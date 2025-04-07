import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  data: Array<any>;
  dataKey: string;
  height?: number;
  color?: string;
  action?: ReactNode;
}

export function AnalyticsChart({
  title,
  subtitle,
  data,
  dataKey,
  height = 300,
  color = "#1E88E5",
  action
}: AnalyticsChartProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${dataKey})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
