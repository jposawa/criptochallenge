export * from "./constants";

/**
 * Method to validate ASKS and BIDS values from depthUpdate. It should return a list with pairs which amount !== 0
 */
export const getValidData = (dataList: string[]): string[] =>
  dataList.filter((pairValue) => parseFloat(pairValue[1]) !== 0);
