import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Point = {
  date: string;
  [key: string]: string | number;
};

type Props = {
  title: string;
  description: string;
  data: Point[];
  dataKey: string;
  suffix?: string;
};

export default function ChartCard({
  title,
  description,
  data,
  dataKey,
  suffix = "",
}: Props) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => `${value}${suffix}`}
            />
            <Tooltip formatter={(value) => [`${value}${suffix}`, ""]} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
