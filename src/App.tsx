import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { BookSettings, BookSide, CurrentTrade } from "./components";
import {
	currentSymbolState,
	operationDataSourceAtom,
	showCurrentTradeAtom,
	showHeaderAtom,
	showSettingsAtom,
	themeState,
	typeColumnShowState,
} from "./state";
import { DataSource, OperationsDataType } from "./models";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { BOOK_LIMIT, getValidData } from "./helpers";

export default function App() {
	const [showCurrentTrade, setShowCurrentTrade] =
		useRecoilState(showCurrentTradeAtom);
	const [operationDataSource, setOperationDataSource] =
		React.useState<DataSource>(DataSource.Frame);
	const [showSettings, setShowSettings] = useRecoilState(showSettingsAtom);
	const [showHeader, setShowHeader] = useRecoilState(showHeaderAtom);
	const currentSymbol = useRecoilValue(currentSymbolState);
	const [depthWS, setDepthWS] = React.useState<WebSocket>();
	const [operationsData, setOperationsData] =
		React.useState<OperationsDataType>({
			asks: [],
			bids: [],
			snapshotUpdateId: 0,
		});
	const [initialized, setInitialized] = React.useState(false);

	const [typeColumnShow, setTypeColumnShow] =
		useRecoilState(typeColumnShowState);
	const theme = useRecoilValue(themeState);

	const updateOperations = () => {
		if (depthWS) {
			depthWS.onmessage = ({ data }: { data: string }) => {
				if (data) {
					const parsedData = JSON.parse(data);

					setOperationsData((currentData) => {
						const validId: boolean =
							!currentData.lastUpdateId ||
							parsedData.U === currentData.lastUpdateId + 1;

						if (!validId) {
							return currentData;
						}

						const validData = {
							asks: getValidData(parsedData.a),
							bids: getValidData(parsedData.b),
						};

						return {
							...currentData,
							asks: [...currentData.asks, ...validData.asks].slice(
								BOOK_LIMIT * -1
							),
							bids: [...currentData.bids, ...validData.bids].slice(
								BOOK_LIMIT * -1
							),
							lastUpdateId: parsedData.u,
						};
					});
				}
			};
		}
	};

	const loadOperationSnapshot = () => {
		if (operationDataSource === DataSource.Socket) {
			const upperCode = currentSymbol.code.toUpperCase();

			axios
				.get("https://api.binance.com/api/v3/depth", {
					params: {
						symbol: upperCode,
						limit: 1000,
					},
				})
				.then((response) => {
					const { data } = response;

					setOperationsData({
						asks: data.asks,
						bids: data.bids,
						code: upperCode,
						snapshotUpdateId: data.lastUpdateId,
					});
				})
				.catch((error) => {
					console.error("Error fetching snapshot", error);
				})
				.finally(() => {
					updateOperations();
				});
		}
	};

	React.useEffect(() => {
		try {
			// console.table({
			// 	_boardEvent: "Test socket",
			// 	operationDataSource,
			// 	shouldOpen: operationDataSource === DataSource.Socket,
			// });
			if (operationDataSource === DataSource.Socket) {
				const _depthWS = new WebSocket(
					`wss://stream.binance.com:9443/ws/${currentSymbol.code}@depth`
				);

				console.log("[Board] ws", { _depthWS, depthWS });

				if (
					depthWS?.url !== _depthWS.url ||
					depthWS.readyState === depthWS.CLOSED
				) {
					if (depthWS) {
						toast.success(
							`Getting data for ${currentSymbol.base}/${currentSymbol.quote}`
						);
					}
					depthWS?.close();
					setDepthWS(_depthWS);
				}
			}
		} catch (error) {
			console.error("[Board WS] Error opening WebSocket", error);
		}
	}, [currentSymbol, operationDataSource]);

	React.useEffect(() => {
		if (operationsData.code !== currentSymbol.code.toUpperCase()) {
			loadOperationSnapshot();
		}
	}, [depthWS]);

	const handleMessage = (event: MessageEvent) => {
		const origin = event?.origin;
		const validOrigin = "localhost";

		console.log("[Board] Message", {
			initialized,
			event,
			operationDataSource,
		});

		if (origin?.toLowerCase().includes(validOrigin.toLowerCase())) {
			const { data } = event;

			// if (operationDataSource === DataSource.Socket) {

			// }
			console.table({
				_event: "[Board] Message received",
				event,
				data: event?.data,
				initialized,
				operationDataSource,
			});

			if (!initialized) {
				if (data?.type === "config") {
					setShowCurrentTrade(!!data?.showCurrentTrade);
					setShowHeader(!!data?.showHeader);
					setTypeColumnShow(data?.typeColumnShow ?? "none");
					setShowSettings(!!data?.showSettings);
					setOperationDataSource(data?.operationDataSource ?? DataSource.Frame);
					setInitialized(true);
				}
			} else if (
				data?.type === "opData" &&
				operationDataSource === DataSource.Frame
			) {
				console.log("[Board Frame Data] Should update from other frame", {
					event,
					data,
					operationDataSource,
					operationsData,
				});
				// setOperationsData(() => data?.operationsData ?? {});
			}
		}
	};

	React.useEffect(() => {
		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	React.useEffect(() => {
		if (operationDataSource === DataSource.Socket) {
			window.parent.postMessage(
				{
					type: "opData",
					operationsData,
				},
				"*"
			);
		}
	}, [operationsData, operationDataSource]);

	return (
		<main className={theme} data-source={operationDataSource}>
			<ToastContainer
				theme={theme === "darkTheme" ? "dark" : "light"}
				closeOnClick
				position="top-right"
				pauseOnFocusLoss={false}
			/>

			<section className="bookContainer">
				<div className="bookData">
					{showHeader && (
						<header>
							<span>Price ({currentSymbol.quote})</span>
							<span>Amount ({currentSymbol.base})</span>
							<span>Total</span>
						</header>
					)}
					{typeColumnShow !== "buy" && typeColumnShow !== "none" && (
						<BookSide sideType="sell" data={operationsData?.asks || []} />
					)}

					{showCurrentTrade && <CurrentTrade />}

					{typeColumnShow !== "sell" && typeColumnShow !== "none" && (
						<BookSide sideType="buy" data={operationsData?.bids || []} />
					)}
				</div>

				{showSettings && <BookSettings />}
			</section>
		</main>
	);
}
