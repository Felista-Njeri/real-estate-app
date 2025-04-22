import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { AnalyticsChart } from "@/reactcomponents/AnalyticsChart";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Coins,
  TrendingUp,
  ChevronRight,
  MapPin,
  BarChart as BarChartIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock data for portfolio value history
const portfolioHistory = [
  { date: "2023-10", value: 150000 },
  { date: "2023-11", value: 155000 },
  { date: "2023-12", value: 158000 },
  { date: "2024-01", value: 162000 },
  { date: "2024-02", value: 165000 },
  { date: "2024-03", value: 170000 },
];

// Colors for pie chart
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

// const properties = [
//   {
//     id: 1,
//     name: "Luxury Apartment Complex",
//     location: "Miami, FL",
//     imageUrl: "/apartment.jpg", // Using the uploaded image
//     totalTokens: 1000,
//     soldTokens: 750,
//     price: 0.1,
//     monthlyRevenue: 0.012,
//     investors: 42,
//     sqft: 12000,
//     yearBuilt: 2020,
//     monthlyData: [
//       { month: "Jan", sales: 100, revenue: 10 },
//       { month: "Feb", sales: 150, revenue: 15 },
//       { month: "Mar", sales: 200, revenue: 20 },
//       { month: "Apr", sales: 300, revenue: 30 },
//     ],
//   },
//   {
//     id: 2,
//     name: "Commercial Office Space",
//     location: "New York, NY",
//     imageUrl: "/apartment.jpg", // Using the uploaded image
//     totalTokens: 2000,
//     soldTokens: 1200,
//     price: 0.15,
//     monthlyRevenue: 0.018,
//     investors: 85,
//     sqft: 25000,
//     yearBuilt: 2018,
//     monthlyData: [
//       { month: "Jan", sales: 200, revenue: 30 },
//       { month: "Feb", sales: 300, revenue: 45 },
//       { month: "Mar", sales: 400, revenue: 60 },
//       { month: "Apr", sales: 300, revenue: 45 },
//     ],
//   },
//   {
//     id: 3,
//     name: "Retail Shopping Center",
//     location: "Los Angeles, CA",
//     imageUrl: "/apartment.jpg", // Using the uploaded image
//     totalTokens: 1500,
//     soldTokens: 900,
//     price: 0.12,
//     monthlyRevenue: 0.014,
//     investors: 64,
//     sqft: 18000,
//     yearBuilt: 2019,
//     monthlyData: [
//       { month: "Jan", sales: 150, revenue: 18 },
//       { month: "Feb", sales: 200, revenue: 24 },
//       { month: "Mar", sales: 250, revenue: 30 },
//       { month: "Apr", sales: 300, revenue: 36 },
//     ],
//   },
// ];

const dividendHistory = [
  {
    id: 1,
    property: "Luxury Apartment Complex",
    date: "2024-03-15",
    amount: 0.012,
    recipients: 42,
    status: "Distributed",
  },
  {
    id: 2,
    property: "Commercial Office Space",
    date: "2024-03-10",
    amount: 0.018,
    recipients: 85,
    status: "Distributed",
  },
  {
    id: 3,
    property: "Retail Shopping Center",
    date: "2024-02-28",
    amount: 0.014,
    recipients: 64,
    status: "Distributed",
  },
];

// types.ts or inside the same file
interface Property {
  propertyId: number;
  propertyName: string;
  location: string;
  images?: string;
  totalTokens: bigint;
  tokensSold: bigint;
  tokenPrice: bigint;
  totalDividends: bigint;
  owner: string;
  isActive: boolean;
}


const PropertyOwnerPortfolio = () => {
  const { address } = useAccount();

  const [selectedProperty, setSelectedProperty] = useState<Property[]>([]);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);

  const { data, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertiesByOwner',
    args: [address],
  })
  const properties: Property[] = (data as Property[]) || [];

  if (!address) return <div className="h-96 flex items-center justify-center">Please connect your wallet</div>
  if (isLoading) return <div className="h-96 flex items-center justify-center"><Spinner className="text-black" /> Loading your properties...</div>
  if (properties.length <= 0) return <div className="h-96 flex items-center justify-center">You have no Tokenized properties</div>
  if (isError || !properties) return <div className="h-96 flex items-center justify-center">Failed to load properties</div>

  
  // Calculate summary metrics
  // const totalRevenue = properties.reduce(
  //   (acc, prop) => acc + prop.soldTokens * prop.price,
  //   0
  // );
  // const totalTokens = properties.reduce(
  //   (acc, prop) => acc + prop.totalTokens,
  //   0
  // );
  // const totalSold = properties.reduce(
  //   (acc, prop) => acc + prop.soldTokens,
  //   0
  // );
  // const totalInvestors = properties.reduce(
  //   (acc, prop) => acc + prop.investors,
  //   0
  // );

  //To do: Handle deposit of dividends to a property
  // const handleDepositDividendClick = (property: PortfolioItem) => {
  //   setSelectedProperty(property); // Set the selected property
  //   setDepositModalOpen(true); // Open the modal
  // };

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">
        Property Owner Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Properties
                </p>
                <h3 className="text-2xl font-bold">{properties.length}</h3>
              </div>
              <Building2 className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold">
                  65 ETH
                </h3>
              </div>
              <Coins className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Token Sales
                </p>
                <h3 className="text-2xl font-bold">
                  560
                </h3>
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
                  Total Investors
                </p>
                <h3 className="text-2xl font-bold">45</h3>
              </div>
              <Users className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>
      </div>

              {/* Portfolio Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Value History Chart */}
        <Card className="glass-card p-4">
          <CardHeader>
            <CardTitle>Portfolio Value History</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution Chart */}
        <Card className="glass-card p-4">
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={properties}
                  dataKey="value"
                  nameKey="propertyName"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {properties.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry, index) => {
                    const item = properties[index];
                    const percentage = (
                      (Number(item.tokenPrice) /
                        properties.reduce((sum, h) => sum + Number(h.tokenPrice), 0)) *
                      100
                    ).toFixed(1);
                    return `${String(item.tokenPrice).slice(0, 15)}... (${percentage}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Properties Cards */}
      <div className="mb-8 glass-card p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property: Property) => (
            <Card 
              key={property.propertyId} 
              // className={`glass-card hover:shadow-lg transition-shadow cursor-pointer ${
              //   selectedProperty.propertyId === property.propertyId ? "ring-2 ring-sage-500" : ""
              // }`}
              // onClick={() => setSelectedProperty(property)}
            >
              <div className="flex flex-col md:flex-row overflow-hidden">
                <div className="md:w-1/3 h-48 relative">
                  <div className="absolute top-0 left-0 bg-emerald-600 text-white px-3 py-1 rounded-tl-md">
                    Tokenized
                  </div>
                      <img 
                        src={property.images} 
                        alt={property.propertyName} 
                        className="w-full h-64 rounded-md object-cover"
                      />
                </div>
                <div className="md:w-2/3 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold leading-tight">{property.propertyName}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-emerald-600">
                      {Number(property.tokenPrice) /1e18} ETH
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Token Sales</p>
                      <div className="flex items-center space-x-1">
                        <Progress
                          // value={(property.soldTokens / property.totalTokens) * 100}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">
                          {/* {Math.round((property.soldTokens / property.totalTokens) * 100)}% */}
                        </span>
                      </div>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {property.soldTokens}/{property.totalTokens} tokens sold
                      </p> */}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Revenue</p>
                      <p className="text-base font-medium">56 ETH</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Area:</span>
                      <p className="font-medium">4565 sqft</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Investors:</span>
                      <p className="font-medium">45</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Year:</span>
                      <p className="font-medium">2000</p>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="mr-2">
                    Manage Property
                  </Button>
                  <Button
                    size="sm"
                    className="bg-sage-600 mx-4 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                    // onClick={() => handleDepositDividendClick(holding)}
                  >
                    Deposit Dividends
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dividend Distribution History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Dividend Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount (ETH)</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividendHistory.map((dividend) => (
                <TableRow key={dividend.id}>
                  <TableCell>
                    {new Date(dividend.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {dividend.property}
                  </TableCell>
                  <TableCell>{dividend.amount}</TableCell>
                  <TableCell>{dividend.recipients}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {dividend.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyOwnerPortfolio;
