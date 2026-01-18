"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const barChartData = [
  { month: "T3", nhập: 120, xuất: 100 },
  { month: "T4", nhập: 190, xuất: 150 },
  { month: "T5", nhập: 150, xuất: 200 },
  { month: "T6", nhập: 250, xuất: 180 },
  { month: "T7", nhập: 220, xuất: 250 },
  { month: "T8", nhập: 300, xuất: 280 },
];

const barChartConfig = {
  nhập: {
    label: "Nhập",
    color: "hsl(var(--primary))",
  },
  xuất: {
    label: "Xuất",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const pieChartData = [
  { name: "Vật tư thay thế", value: 45, fill: "hsl(var(--chart-1))" },
  { name: "Hóa chất/Dầu mỡ", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Dụng cụ", value: 15, fill: "hsl(var(--chart-3))" },
  { name: "BHLĐ", value: 10, fill: "hsl(var(--chart-4))" },
  { name: "Khác", value: 5, fill: "hsl(var(--chart-5))" },
];

const pieChartConfig = {
  value: {
    label: "Value",
  },
  "Vật tư thay thế": {
    label: "Vật tư thay thế",
    color: "hsl(var(--chart-1))",
  },
  "Hóa chất/Dầu mỡ": {
    label: "Hóa chất/Dầu mỡ",
    color: "hsl(var(--chart-2))",
  },
  "Dụng cụ": {
    label: "Dụng cụ",
    color: "hsl(var(--chart-3))",
  },
  "BHLĐ": {
    label: "BHLĐ",
    color: "hsl(var(--chart-4))",
  },
  "Khác": {
    label: "Khác",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function DashboardCharts() {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Cơ cấu giá trị tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={pieChartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                strokeWidth={5}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Xu hướng nhập / xuất (6 tháng)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="nhập" fill="var(--color-nhập)" radius={4} />
              <Bar dataKey="xuất" fill="var(--color-xuất)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
