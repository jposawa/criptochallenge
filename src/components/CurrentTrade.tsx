import React from "react";
import axios from "axios";
import { CurrentTradeType } from "../models";
import { useRecoilValue } from "recoil";
import { currentSymbolState } from "../state";

export const CurrentTrade = () => {
  const [tradeWS, setTradeWS] = React.useState<WebSocket>();
  const [totalQueries, setTotalQueries] = React.useState(0);
  const [currentTrade, setCurrentTrade] = React.useState<CurrentTradeType>();
  const currentSymbol = useRecoilValue(currentSymbolState);

  const updateTrade = () => {
    if (tradeWS) {
      tradeWS.onmessage = ({ data }: { data: string }) => {
        if (data) {
          const parsedData = JSON.parse(data);

          setCurrentTrade((currentData) => {
            if (parseFloat(parsedData.q) === 0) {
              return currentData;
            }

            return {
              price: parseFloat(parsedData.p),
              isSeller: parsedData.m,
            }
          })
        }
      };
    }
  };

  const getTradeSnapshot = () => {
    const trade: CurrentTradeType = { price: 0, isSeller: false };

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
        updateTrade();
      });
  };

  React.useEffect(() => {
    const _tradeWS = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentSymbol.code}@trade`
    );

    if (tradeWS?.url !== _tradeWS.url) {
      tradeWS?.close();

      setTradeWS(_tradeWS);
    }
  }, [currentSymbol.code]);

  React.useEffect(() => {
    getTradeSnapshot();
  }, [tradeWS?.url]);

  return (
    <>
      {currentTrade && (
        <div className={currentTrade.isSeller ? "txtSeller" : "txtBuyer"}>
          <span>{currentTrade?.price.toFixed(2)}</span>
          <span>{currentTrade.isSeller ? <>&#8595;</> : <>&#8593;</>}</span>
        </div>
      )}
    </>
  );
};
