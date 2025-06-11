import { atom } from "recoil";
import { NAMESPACE } from "../helpers";
import { TradeSymbol } from "../models";

export const themeState = atom<string>({
  key: `${NAMESPACE}theme`,
  default: "darkTheme",
});

export const currentSymbolState = atom<TradeSymbol>({
  key: `${NAMESPACE}tradeSymbol`,
  default: {
    code: "btcbusd",
    base: "BTC",
    quote: "BUSD",
  }
});

export const decimalPlacesState = atom<number>({
  key: `${NAMESPACE}decimalPlaces`,
  default: 2,
});

export const typeColumnShowState = atom<string>({
  key: `${NAMESPACE}typeColumnShow`,
  default: "none",
});

export const showHeaderAtom = atom<boolean>({
  key: `${NAMESPACE}showHeader`,
  default: false,
});

export const showCurrentTradeAtom = atom<boolean>({
  key: `${NAMESPACE}showCurrentTrade`,
  default: false,
});
