import { atom } from "recoil";
import { NAMESPACE } from "../helpers";
import { TradeSymbol } from "../models";

export const themeState = atom<string>({
  key: `${NAMESPACE}theme`,
  default: "darkTheme",
})

export const currentSymbolState = atom<TradeSymbol>({
  key: `${NAMESPACE}tradeSymbol`,
  default: {
    code: "btcusdt",
    base: "BTC",
    quote: "USDT",
  }
})