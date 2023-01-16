import React from "react";
import axios from "axios";
import { CurrentTradeType } from "../models";
import { useRecoilValue } from "recoil";
import { currentSymbolState, decimalPlacesState } from "../state";
import { numFixed, roundUp } from "../helpers";

export const CurrentTrade = () => {
  const [tradeWS, setTradeWS] = React.useState<WebSocket>();
  const [priceWS, setPriceWS] = React.useState<WebSocket>();
  const [currentTrade, setCurrentTrade] = React.useState<CurrentTradeType>();
  const [usdPrice, setUsdPrice] = React.useState<string>();
  const currentSymbol = useRecoilValue(currentSymbolState);
  const decimalPlaces = useRecoilValue(decimalPlacesState);

  const getUsdSymbol = () => {
    const usdSymbol = [currentSymbol?.base, "BUSD"];

    if (currentSymbol.base === "USDT") {
      usdSymbol.reverse();
    }

    return usdSymbol;
  };

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
              price: parsedData.p,
              isSeller: parsedData.m,
            };
          });
        }
      };
    }
  };

  const updatePrice = () => {
    if (priceWS) {
      priceWS.onmessage = ({ data }: { data: string }) => {
        if (data) {
          const parsedData = JSON.parse(data);
          const openPrice = numFixed(parsedData.o, 2);

          setUsdPrice(openPrice);
        }
      };
    }
  };

  const getTradeSnapshot = () => {
    const trade: CurrentTradeType = { price: "0", isSeller: false };

    axios
      .get("https://data.binance.com/api/v3/trades", {
        params: {
          symbol: currentSymbol.code.toUpperCase(),
          limit: 1,
        },
      })
      .then((response) => {
        trade.price = response.data?.[0]?.price;
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

  const getPriceSnapshot = () => {
    axios
      .get("https://data.binance.com/api/v3/ticker/price", {
        params: {
          symbol: getUsdSymbol().join(""),
        },
      })
      .then((response) => {
        const { data } = response;

        if (data) {
          setUsdPrice(numFixed(data.price, 2));
        }
      })
      .catch((error) => {
        console.warn("Error fetch price", error);
      })
      .finally(() => {
        updatePrice();
      });
  };

  React.useEffect(() => {
    const usdSymbol = [currentSymbol?.base, "BUSD"];

    if (currentSymbol.base === "USDT") {
      usdSymbol.reverse();
    }

    const _tradeWS = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentSymbol.code}@trade`
    );
    const _priceWS = new WebSocket(
      `wss://stream.binance.com:9443/ws/${getUsdSymbol()
        .join("")
        .toLowerCase()}@miniTicker`
    );

    if (
      tradeWS?.url !== _tradeWS.url ||
      tradeWS.readyState === tradeWS.CLOSED
    ) {
      tradeWS?.close();

      setTradeWS(_tradeWS);
    }

    if (
      priceWS?.url !== _priceWS.url ||
      priceWS.readyState === priceWS.CLOSED
    ) {
      priceWS?.close();

      setPriceWS(_priceWS);
    }
  }, [currentSymbol.code]);

  React.useEffect(() => {
    getTradeSnapshot();
  }, [tradeWS?.url]);

  React.useEffect(() => {
    getPriceSnapshot();
  }, [priceWS?.url]);

  return (
    <section className="currentData">
      {currentTrade && (
        <div className={currentTrade.isSeller ? "txtSeller" : "txtBuyer"}>
          <span>
            {currentTrade.isSeller
              ? roundUp(currentTrade?.price, decimalPlaces)
              : numFixed(currentTrade?.price, decimalPlaces)}
          </span>
          <span>{currentTrade.isSeller ? <>&#8595;</> : <>&#8593;</>}</span>
        </div>
      )}

      {usdPrice && <span>${usdPrice}</span>}
    </section>
  );
};
