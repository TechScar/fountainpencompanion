import { CurrentlyInkedCard } from "./CurrentlyInkedCard";
import "./cards.scss";

export const Cards = ({ data, hiddenFields, onUsageRecorded }) => {
  return (
    <div className="fpc-currently-inked-cards">
      {data.map((row, i) => (
        <CurrentlyInkedCard
          key={row.id + "i" + i}
          hiddenFields={hiddenFields}
          onUsageRecorded={onUsageRecorded}
          {...row}
        />
      ))}
    </div>
  );
};
