export type CurrentTradeType = {
  price: string;
  isSeller: boolean;
  usdPrice?: number;
};

export type TradeSymbol = {
  code: string;
  base: string;
  quote: string;
}

export type OperationsDataType = {
  asks: string[];
  bids: string[];
  code?: string;
  snapshotUpdateId: number;
  lastUpdateId?: number;
};
