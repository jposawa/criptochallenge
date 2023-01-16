import React from "react";
import "./SideIcon.scss";

export const SideIcon: React.FC<{
  active?: boolean;
  size?: string;
  typeIcon?: string;
}> = ({ active = false, size = "2rem", typeIcon = "both" }) => {
  typeIcon = typeIcon.toString().toLowerCase();

  return (
    <div
      className={`sideIcon ${typeIcon}Icon`}
      style={
        { "--size": size, opacity: active ? 1 : 0.7 } as React.CSSProperties
      }
    >
      <span>
        <span
          style={{
            display:
              typeIcon === "buy" || typeIcon === "bid" ? "none" : "block",
          }}
        />
        <span
          style={{
            display:
              typeIcon === "sell" || typeIcon === "ask" ? "none" : "block",
          }}
        />
      </span>

      <ul>
        <li />
        <li />
        <li />
      </ul>
    </div>
  );
};
