import axios from "axios";
import React from "react";
import { useRecoilState } from "recoil";
import { TradeSymbol } from "../models";
import {
  currentSymbolState,
  decimalPlacesState,
  typeColumnShowState,
} from "../state";
import { toast } from "react-toastify";

import "./BookSettings.scss";
import { SideIcon } from "./SideIcon";

export const BookSettings = () => {
  const [currentSymbol, setCurrentSymbol] = useRecoilState(currentSymbolState);
  const [symbolsList, setSymbolsList] = React.useState<TradeSymbol[]>([]);
  const symbolCodeRef = React.useRef<HTMLInputElement>(null);
  const [decimalPlaces, setDecimalPlaces] = useRecoilState(decimalPlacesState);
  const [typeColumnShow, setTypeColumnShow] =
    useRecoilState(typeColumnShowState);
  const columnIconSize = "1.5rem";

  const handleDecimalPlaces = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const select = event.target;

    setDecimalPlaces(parseInt(select?.value));
  };

  const updateCurrentSymbol = (event: React.FormEvent) => {
    event.preventDefault();
    const inputElement = symbolCodeRef.current;
    const symbolCode = inputElement?.value?.split("/").join("");

    const [selectedSymbol] = symbolsList.filter(
      (symbol) => symbol.code === symbolCode
    );

    if (!selectedSymbol) {
      toast.error(`This symbol isn't used by the API`);
      inputElement?.focus();
      return;
    }

    setCurrentSymbol({
      ...selectedSymbol,
      code: selectedSymbol.code.toLowerCase(),
    });
  };

  React.useEffect(() => {
    if (symbolsList.length === 0) {
      axios
        .get("https://api.binance.com/api/v3/exchangeInfo")
        .then(async (response) => {
          const { symbols } = response?.data;
          const parsedList = symbols
            .filter((symbol: any) => symbol?.status === "TRADING")
            .map((tradingSymbol: any) => ({
              code: tradingSymbol.symbol,
              base: tradingSymbol.baseAsset,
              quote: tradingSymbol.quoteAsset,
            }));

          setSymbolsList(parsedList);
        })
        .catch((error) => {
          console.warn("Error fetching symbols", error);
        });
    }
  }, []);

  return (
    <div className="bookSettings">
      <div className="columnTypes">
        <span
          onClick={() => {
            setTypeColumnShow("both");
          }}
        >
          <SideIcon
            active={typeColumnShow !== "buy" && typeColumnShow !== "sell"}
            size={columnIconSize}
          />
        </span>

        <span
          onClick={() => {
            setTypeColumnShow("buy");
          }}
        >
          <SideIcon
            typeIcon="buy"
            active={typeColumnShow === "buy"}
            size={columnIconSize}
          />
        </span>

        <span
          onClick={() => {
            setTypeColumnShow("sell");
          }}
        >
          <SideIcon
            typeIcon="sell"
            active={typeColumnShow === "sell"}
            size={columnIconSize}
          />
        </span>
      </div>

      <form onSubmit={updateCurrentSymbol}>
        <datalist id="symbolsList">
          {symbolsList.map((symbol, index) => (
            <option
              key={`${symbol.code}${index}`}
              value={`${symbol.base}/${symbol.quote}`}
            >
              {symbol.code}
            </option>
          ))}
        </datalist>
        <input
          name="symbolInput"
          type="text"
          placeholder="Currency symbol"
          list="symbolsList"
          defaultValue={`${currentSymbol.base}/${currentSymbol.quote}`}
          ref={symbolCodeRef}
        />

        <button type="submit" className="quadButton">
          &#8635;
        </button>
      </form>

      <select
        name="decimalPlacesSelect"
        title="Decimal places"
        className="decimalSelect"
        onChange={handleDecimalPlaces}
        defaultValue={decimalPlaces}
      >
        <option value="2">0.01</option>
        <option value="1">0.1</option>
        <option value="0">1</option>
      </select>
    </div>
  );
};
