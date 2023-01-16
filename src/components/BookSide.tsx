import React from "react";
import { BOOK_SIDE_LIMIT } from "../helpers";
import "./BookSide.scss";

type BookSideProps = {
  data: string[];
  sideType?: string;
};

export const BookSide: React.FC<BookSideProps> = ({ sideType, data }) => {
  const priceColor =
    sideType?.toUpperCase() === "BUY"
      ? "--buyColor"
      : sideType?.toUpperCase() === "SELL"
      ? "--sellColor"
      : "--textColor";
  
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
    >
      <ul>
        {filterredData &&
          filterredData.map((operation, index) => {
            const opPrice = parseFloat(operation[0]).toFixed(2);
            const opAmount = parseFloat(operation[1]).toFixed(5);
            const opTotal = (
              parseFloat(opPrice) * parseFloat(opAmount)
            ).toFixed(4);

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
