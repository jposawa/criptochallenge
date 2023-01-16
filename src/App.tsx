import React from "react";
import { useRecoilValue } from "recoil";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { BookSettings, BookSide, CurrentTrade } from "./components";
import { currentSymbolState, themeState } from "./state";
import { OperationsDataType } from "./models";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { BOOK_LIMIT, getValidData } from "./helpers";

export default function App() {
  const currentSymbol = useRecoilValue(currentSymbolState);
  const [depthWS, setDepthWS] = React.useState<WebSocket>();
  const [operationsData, setOperationsData] =
    React.useState<OperationsDataType>({
      asks: [],
      bids: [],
      snapshotUpdateId: 0,
    });

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
  };

  React.useEffect(() => {
    const _depthWS = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentSymbol.code}@depth`
    );

    if (depthWS?.url !== _depthWS.url) {
      if (depthWS) {
        toast.success(
          `Getting data for ${currentSymbol.base}/${currentSymbol.quote}`
        );
      }
      depthWS?.close();
      setDepthWS(_depthWS);
    }
  }, [currentSymbol]);

  React.useEffect(() => {
    if (operationsData.code !== currentSymbol.code.toUpperCase()) {
      loadOperationSnapshot();
    }
  }, [depthWS]);

  return (
    <main className={theme}>
      <ToastContainer
        theme={theme === "darkTheme" ? "dark" : "light"}
        closeOnClick
        position="top-right"
      />

      <section className="bookContainer">
        <div className="bookData">
          <header>
            <span>Price ({currentSymbol.quote})</span>
            <span>Amount ({currentSymbol.base})</span>
            <span>Total</span>
          </header>
          <BookSide sideType="sell" data={operationsData?.asks || []} />

          <CurrentTrade />

          <BookSide sideType="buy" data={operationsData?.bids || []} />
        </div>

        <BookSettings />
      </section>
    </main>
  );
}
