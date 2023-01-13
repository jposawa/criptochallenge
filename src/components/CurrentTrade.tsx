import React from "react";
import axios from "axios";
import { CurrentTradeProps } from "../models";
import { useRecoilValue } from "recoil";
import { currentSymbolState } from "../state";
import { TRADE_INTERVAL } from "../helpers";

export const CurrentTrade = () => {
  const [totalQueries, setTotalQueries] = React.useState(0);
  const [currentTrade, setCurrentTrade] = React.useState<CurrentTradeProps>();
  const currentSymbol = useRecoilValue(currentSymbolState);

  const updateTrade = () => {
    const trade: CurrentTradeProps = { price: 0, isSeller: false };

    axios
      .get("https://data.binance.com/api/v3/trades", {
        params: {
          symbol: currentSymbol.code.toUpperCase(),
          limit: 1,
        },
      })
      .then((response) => {
        trade.price = parseFloat(response.data?.[0]?.price);
        trade.isSeller = response.data?.[0]?.isBuyerMaker;

        setCurrentTrade(trade);
      })
      .catch((error) => {
        console.warn("Error fetch trade", error);
      })
      .finally(() => {
        setTotalQueries(totalQueries + 1);
      });
  };

  React.useEffect(() => {
    setTimeout(updateTrade, TRADE_INTERVAL);
  }, [totalQueries])

  return (
    <>
      {currentTrade && (
        <section className={currentTrade.isSeller ? "txtSeller" : "txtBuyer"}>
          <span>{currentTrade?.price.toFixed(2)}</span>
          <span>{currentTrade.isSeller ? <>&#8595;</> : <>&#8593;</>}</span>
        </section>
      )}
    </>
  );
};
