import React from "react";
import { useRecoilValue } from 'recoil'
import './App.scss'
import { BookSide } from './components';
import { themeState } from './state'
import axios from "axios";

// GET pairs https://data.binance.com/api/v3/exchangeInfo

export type OperationsDataProps = {
  asks: string[],
  bids: string[],
  lastUpdateId: number,
};

type CurrentTradeProps = {
  price: number,
  isSeller: boolean,
  usdPrice?: number,
};

export type TradeSymbol = {
  code: string;
  base: string;
  quote: string;
}

export default function App() {
  const [currentSymbol, setCurrentSymbol] = React.useState<TradeSymbol>({
    code: "btcusdt",
    base: "BTC",
    quote: "USDT",
  });
  const [depthWS, setDepthWS] = React.useState<WebSocket>();
  const [operationsData, setOperationsData] = React.useState<OperationsDataProps>();
  const [currentTrade, setCurrentTrade] = React.useState<CurrentTradeProps>();
  const [totalQueries, setTotalQueries] = React.useState(0);
  const [symbolsList, setSymbolsList] = React.useState<TradeSymbol[]>([]);
  const symbolCodeRef = React.useRef<HTMLInputElement>(null);
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

  const updateCurrentSymbol = (event: React.MouseEvent<HTMLElement>) => {
    const buttonElement = event.target;
    console.log(buttonElement);
    console.log(symbolCodeRef.current);
  }

  const updatePrice = () => {
    const trade: CurrentTradeProps = { price: 0, isSeller: false };

    axios.get("https://data.binance.com/api/v3/trades", {
      params: {
        symbol: currentSymbol.code.toUpperCase(),
        limit: 1,
      }
    }).then((response) => {
      trade.price = parseFloat(response.data[0].price);
      trade.isSeller = response.data[0].isBuyerMaker;

      setCurrentTrade(trade);
    }).catch((error) => {
      console.warn("REST Error", error);
    }).finally(() => {
      setTotalQueries(totalQueries + 1);
    });
  }

  React.useEffect(() => {
    if (symbolsList.length === 0) {
      axios.get("https://data.binance.com/api/v3/exchangeInfo").then((response) => {
        const { symbols } = response?.data;
        const parsedList = symbols.filter((symbol: any) => symbol?.status === "TRADING").map((tradingSymbol: any) => ({
          code: tradingSymbol.symbol,
          base: tradingSymbol.baseAsset,
          quote: tradingSymbol.quoteAsset,
        }));

        setSymbolsList(parsedList);
      }).catch((error) => {
        console.warn("Error fetching symbols", error);
      });
    }
  }, []);

  React.useEffect(() => {
    setTimeout(updatePrice, 1000);
  }, [totalQueries]);

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
          {currentTrade && (
            <section className={currentTrade.isSeller ? "txtSeller" : "txtBuyer"}>
              <span>{currentTrade?.price.toFixed(2)}</span>
              <span>{currentTrade.isSeller ? (<>&#8595;</>) : (<>&#8593;</>)}</span>
            </section>
          )}
          <BookSide sideType="buy" data={operationsData?.bids || []} />
        </div>

        <div className="settings">
          <datalist id="symbolsList">
            {symbolsList.map((symbol, index) => (
              <option key={`${symbol.code}${index}`}>
                {symbol.base}/{symbol.quote}
              </option>
            ))}
          </datalist>
          <input type="text" placeholder="Currency symbol" list="symbolsList" defaultValue={`${currentSymbol.base}/${currentSymbol.quote}`} ref={symbolCodeRef} />

          <button type="button" onClick={updateCurrentSymbol}>&#8635;</button>
        </div>
      </section>
    </main>
  )
}