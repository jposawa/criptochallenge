import React from "react";
import { useRecoilValue } from 'recoil'
import './App.scss'
import { BookSettings, BookSide, CurrentTrade } from './components';
import { currentSymbolState, themeState } from './state'
import { OperationsDataProps } from "./models";

// GET pairs https://data.binance.com/api/v3/exchangeInfo

export default function App() {
  const currentSymbol = useRecoilValue(currentSymbolState);
  const [depthWS, setDepthWS] = React.useState<WebSocket>();
  const [operationsData, setOperationsData] = React.useState<OperationsDataProps>();
  
  const theme = useRecoilValue(themeState);

  const updateOperations = () => {
    if (depthWS) {
      depthWS.onmessage = ({ data }: { data: string }) => {
        if (data) {
          const parsedData = JSON.parse(data);

          setOperationsData(parsedData);
        }
      }
    }
  }

  

  

  React.useEffect(() => {
    // const _webSocket = new WebSocket(`wss://fstream.binance.com/ws/${currentSymbol}@bookTicker`);
    const _depthWS = new WebSocket(`wss://stream.binance.com:9443/ws/${currentSymbol.code}@depth20@100ms`);
    if (depthWS) {
      depthWS.close();
    }

    setDepthWS(_depthWS);
  }, [currentSymbol]);

  React.useEffect(() => {
    updateOperations();
  }, [depthWS]);

  return (
    <main className={theme}>
      <section className="bookContainer">
        <div className="bookData">
          <BookSide sideType="sell" data={operationsData?.asks || []} />
          
          <CurrentTrade />

          <BookSide sideType="buy" data={operationsData?.bids || []} />
        </div>

        <BookSettings />
      </section>
    </main>
  )
}