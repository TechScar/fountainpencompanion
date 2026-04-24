import { useContext } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { dataWithOtherEntry, generateColors } from "./charting";
import { Widget, WidgetDataContext, WidgetWidthContext } from "./widgets";

export const PensGroupedByBrandWidget = ({ renderWhenInvisible }) => (
  <Widget
    header="Pens"
    subtitle="Your pens grouped by brand"
    path="/dashboard/widgets/pens_grouped_by_brand.json"
    renderWhenInvisible={renderWhenInvisible}
  >
    <PensGroupedByBrandWidgetContent />
  </Widget>
);

const PensGroupedByBrandWidgetContent = () => {
  const { data } = useContext(WidgetDataContext);
  const width = useContext(WidgetWidthContext);
  const brands = data.attributes.brands;
  const chartData = dataWithOtherEntry({ data: brands, nameKey: "brand_name" });
  const colors = generateColors(chartData.length);
  return (
    <PieChart width={width} height={width}>
      <Pie data={chartData} dataKey="count" nameKey="brand_name">
        {brands.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};
