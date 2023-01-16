import React, { LegacyRef } from "react";
import { useRecoilValue } from "recoil";
import { BOOK_SIDE_LIMIT, numFixed, roundUp } from "../helpers";
import { decimalPlacesState } from "../state";
import "./BookSide.scss";

type BookSideProps = {
  data: string[];
  sideType?: string;
};

export const BookSide: React.FC<BookSideProps> = ({ sideType, data }) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const priceColor =
    sideType?.toUpperCase() === "BUY"
      ? "--buyColor"
      : sideType?.toUpperCase() === "SELL"
      ? "--sellColor"
      : "--textColor";
  const decimalPlaces = useRecoilValue(decimalPlacesState);
  // I know each list item has 19 of height, so I'm doing this to not render unnecessary list items in DOM for mobile
  const maxItem = Math.floor((containerRef?.current?.offsetHeight || 0) / 19);

  //Show only the top amount of data, based on BOOK_SIDE_LIMIT and ordered by price from high to low
  const filterredData = React.useMemo(() => {
    const sortedData = data
      ? data.sort((opA, opB) => parseFloat(opB[0]) - parseFloat(opA[0]))
      : [];

    return sortedData.slice(0, BOOK_SIDE_LIMIT);
  }, [data]);

  return (
    <section
      className="bookSide"
      style={{ "--priceColor": `var(${priceColor})` } as React.CSSProperties}
      ref={containerRef}
    >
      <ul>
        {filterredData &&
          filterredData.slice(0, maxItem).map((operation, index) => {
            const opPrice =
              sideType?.toUpperCase() === "sell"
                ? roundUp(operation[0], decimalPlaces)
                : numFixed(operation[0], decimalPlaces);
            const opAmount = numFixed(operation[1], 5);
            const opTotal = numFixed(
              parseFloat(opPrice) * parseFloat(opAmount),
              4
            );

            return (
              <li key={index} className="dataRow">
                <span className="price">{opPrice}</span>
                <span>{opAmount}</span>
                <span>{opTotal}</span>
              </li>
            );
          })}
      </ul>
    </section>
  );
};
