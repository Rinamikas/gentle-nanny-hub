import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface NannyRating {
  name: string;
  appointments: number;
}

interface NannyRatingChartProps {
  data: NannyRating[];
}

const NannyRatingChart = ({ data }: NannyRatingChartProps) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Рейтинг нянь по числу заявок</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="appointments"
              fill="#FFD6FF"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NannyRatingChart;