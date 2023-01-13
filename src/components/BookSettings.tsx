import axios from "axios";
import React from "react";
import { useRecoilState } from "recoil";
import { TradeSymbol } from "../models";
import { currentSymbolState } from "../state";

export const BookSettings = () => {
  const [currentSymbol, setCurrentSymbol] = useRecoilState(currentSymbolState);
  const [symbolsList, setSymbolsList] = React.useState<TradeSymbol[]>([]);
  const symbolCodeRef = React.useRef<HTMLInputElement>(null);
  
  const updateCurrentSymbol = (event: React.MouseEvent<HTMLElement>) => {
    const buttonElement = event.target;
    console.log(buttonElement);
    console.log(symbolCodeRef.current);
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

  return (
    <div className="settings">
      <datalist id="symbolsList">
        {symbolsList.map((symbol, index) => (
          <option key={`${symbol.code}${index}`}>
            {symbol.base}/{symbol.quote}
          </option>
        ))}
      </datalist>
      <input
        type="text"
        placeholder="Currency symbol"
        list="symbolsList"
        defaultValue={`${currentSymbol.base}/${currentSymbol.quote}`}
        ref={symbolCodeRef}
      />

      <button type="button" onClick={updateCurrentSymbol}>
        &#8635;
      </button>
    </div>
  );
};
