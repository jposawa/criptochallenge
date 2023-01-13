export type CurrentTradeProps = {
  price: number,
  isSeller: boolean,
  usdPrice?: number,
};

export type TradeSymbol = {
  code: string;
  base: string;
  quote: string;
}

export type OperationsDataProps = {
  asks: string[],
  bids: string[],
  lastUpdateId: number,
};
