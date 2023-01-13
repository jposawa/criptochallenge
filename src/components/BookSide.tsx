import React from "react";

import styles from "./BookSide.module.scss";

type BookSideProps = {
  data: string[];
  sideType?: string;
}

export const BookSide: React.FC<BookSideProps> = ({ sideType, data }) => {
  const priceColor = sideType?.toUpperCase() === "BUY" ? "--buyColor" : sideType?.toUpperCase() === "SELL" ? "--sellColor" : "--textColor";
  const filterredData = React.useMemo(() => {
    const sortedData = data ? data.sort((opA, opB) => parseFloat(opB[0]) - parseFloat(opA[0])) : [];

    if (sortedData.length === 20) {
      sortedData.splice(-7);
    }

    return sortedData;
  }, [data]);

  return (
    <section className={styles.bookSide} style={{ "--priceColor": `var(${priceColor})` }}>
      <ul>
        {filterredData && filterredData.map((operation, index) => (
          <li key={index}>
            <span className={styles.price}>{parseFloat(operation[0]).toFixed(2)}</span>
            <span>{parseFloat(operation[1]).toFixed(5)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}