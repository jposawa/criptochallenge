import React from "react";

import styles from "./BookSide.module.scss";

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
  const filterredData = React.useMemo(() => {
    const sortedData = data
      ? data.sort((opA, opB) => parseFloat(opB[0]) - parseFloat(opA[0]))
      : [];

    if (sortedData.length === 20) {
      sortedData.splice(-5);
    }

    return sortedData;
  }, [data]);

  return (
    <section
      className={styles.bookSide}
      style={{ "--priceColor": `var(${priceColor})` }}
    >
      <ul>
        {filterredData &&
          filterredData.map((operation, index) => {
            const opPrice = Number.parseFloat(operation[0]).toFixed(2);
            const opAmount = parseFloat(operation[1]).toFixed(5);
            const opTotal = (
              parseFloat(opPrice) * parseFloat(opAmount)
            ).toFixed(4);

            return (
              <li key={index} className="dataRow">
                <span className={styles.price}>{opPrice}</span>
                <span>{opAmount}</span>
                <span>{opTotal}</span>
              </li>
            );
          })}
      </ul>
    </section>
  );
};
