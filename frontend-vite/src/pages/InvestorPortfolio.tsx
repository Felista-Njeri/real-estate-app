import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  TrendingUp,
  
  Building2,
  DollarSign,
} from "lucide-react";

const performanceData = [
  { month: "Jan", value: 1000 },
  { month: "Feb", value: 1200 },
  { month: "Mar", value: 1100 },
  { month: "Apr", value: 1400 },
  { month: "May", value: 1800 },
  { month: "Jun", value: 2100 },
];

const holdings = [
  {
    id: 1,
    property: "Luxury Apartment Complex",
    tokens: 100,
    value: 10000,
    roi: 15.5,
  },
  {
    id: 2,
    property: "Commercial Office Space",
    tokens: 50,
    value: 7500,
    roi: 12.3,
  },
];

const transactionHistory = [
  {
    id: 1,
    date: "2024-03-15",
    property: "Luxury Apartment Complex",
    type: "Purchase",
    tokens: 50,
    price: 5000,
  },
  {
    id: 2,
    date: "2024-03-10",
    property: "Commercial Office Space",
    type: "Dividend",
    tokens: null,
    price: 250,
  },
];

const InvestorPortfolio = () => {
  const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0);
  const totalTokens = holdings.reduce((acc, curr) => acc + curr.tokens, 0);
  const averageROI =
    holdings.reduce((acc, curr) => acc + curr.roi, 0) / holdings.length;

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">
        Investment Portfolio
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <h3 className="text-2xl font-bold">${totalValue.toLocaleString()}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tokens
                </p>
                <h3 className="text-2xl font-bold">{totalTokens}</h3>
              </div>
              <Wallet className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average ROI
                </p>
                <h3 className="text-2xl font-bold">{averageROI.toFixed(1)}%</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Properties
                </p>
                <h3 className="text-2xl font-bold">{holdings.length}</h3>
              </div>
              <Building2 className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {/* <ChartContainer>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#526952"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer> */}
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tokens Owned</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell className="font-medium">
                    {holding.property}
                  </TableCell>
                  <TableCell>{holding.tokens}</TableCell>
                  <TableCell>${holding.value.toLocaleString()}</TableCell>
                  <TableCell className="text-sage-600">
                    {holding.roi}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.property}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.tokens || "-"}</TableCell>
                  <TableCell>${transaction.price.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorPortfolio;