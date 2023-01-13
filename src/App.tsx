import React from "react";
import { useRecoilValue } from "recoil";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { BookSettings, BookSide, CurrentTrade } from "./components";
import { currentSymbolState, themeState } from "./state";
import { OperationsDataProps } from "./models";
import { ToastContainer, toast } from "react-toastify";

export default function App() {
  const currentSymbol = useRecoilValue(currentSymbolState);
  const [depthWS, setDepthWS] = React.useState<WebSocket>();
  const [operationsData, setOperationsData] =
    React.useState<OperationsDataProps>();

  const theme = useRecoilValue(themeState);

  const updateOperations = () => {
    if (depthWS) {
      depthWS.onmessage = ({ data }: { data: string }) => {
        if (data) {
          const parsedData = JSON.parse(data);

          setOperationsData(parsedData);
        }
      };
    }
  };

  React.useEffect(() => {
    const _depthWS = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentSymbol.code}@depth20@100ms`
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
    updateOperations();
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
