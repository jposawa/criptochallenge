export * from "./constants";

/**
 * Method to validate ASKS and BIDS values from depthUpdate. It should return a list with pairs which amount !== 0
 */
export const getValidData = (dataList: string[]): string[] =>
  dataList.filter((pairValue) => parseFloat(pairValue[1]) !== 0);

export const numFixed = (
  number: number | string,
  decimalNumber?: number
): string => {
  const regex = new RegExp("^-?\\d+(?:.\\d{0," + (decimalNumber || -1) + "})?");

  return number.toString().match(regex)?.[0] || "0";
};

export const roundUp = (
  baseNumber: string | number,
  decimalPlaces?: number
): string => {
  if (!decimalPlaces || decimalPlaces === 0) {
    //Since I'm doing a more generic function, I have to ensure baseNumber conversion to string before parseFloat
    return Math.ceil(parseFloat(baseNumber.toString())).toString();
  }

  const [intNumber, decimalNumber] = baseNumber.toString().split(".");

  const ceiledDecimal = Math.ceil(
    parseFloat(
      decimalNumber.slice(0, decimalPlaces) +
        "." +
        decimalNumber.slice(decimalPlaces)
    )
  );

  const newDecimal =
    parseInt(decimalNumber[0]) > 0 || ceiledDecimal > 9
      ? ceiledDecimal.toString()
      : `0${ceiledDecimal}`;

  return newDecimal.length > decimalPlaces
    ? (`${intNumber + 1}.${newDecimal.slice(1)}`)
    : `${intNumber}.${newDecimal}`;
};
