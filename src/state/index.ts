import { atom } from "recoil";
import { NAMESPACE } from "../helpers";
import { DataSource, TradeSymbol } from "../models";

export const themeState = atom<string>({
	key: `${NAMESPACE}theme`,
	default: "darkTheme",
});

export const currentSymbolState = atom<TradeSymbol>({
	key: `${NAMESPACE}tradeSymbol`,
	default: {
		code: "usdtbrl",
		base: "USDT",
		quote: "BRL",
	},
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

export const showSettingsAtom = atom<boolean>({
	key: `${NAMESPACE}showSettings`,
	default: false,
});

export const operationDataSourceAtom = atom<DataSource>({
	key: `${NAMESPACE}operationDataSource`,
	default: DataSource.Frame,
});
