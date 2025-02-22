import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Building2, Users, Coins, TrendingUp } from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Luxury Apartment Complex",
    location: "Miami, FL",
    totalTokens: 1000,
    soldTokens: 750,
    price: 0.1,
    monthlyData: [
      { month: "Jan", sales: 100 },
      { month: "Feb", sales: 150 },
      { month: "Mar", sales: 200 },
      { month: "Apr", sales: 300 },
    ],
  },
  {
    id: 2,
    name: "Commercial Office Space",
    location: "New York, NY",
    totalTokens: 2000,
    soldTokens: 1200,
    price: 0.15,
    monthlyData: [
      { month: "Jan", sales: 200 },
      { month: "Feb", sales: 300 },
      { month: "Mar", sales: 400 },
      { month: "Apr", sales: 300 },
    ],
  },
];

const PropertyOwner = () => {
  const totalRevenue = properties.reduce(
    (acc, prop) => acc + prop.soldTokens * prop.price,
    0
  );
  const totalTokens = properties.reduce(
    (acc, prop) => acc + prop.totalTokens,
    0
  );
  const totalSold = properties.reduce(
    (acc, prop) => acc + prop.soldTokens,
    0
  );

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">
        Property Management
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
                  {totalRevenue.toFixed(2)} ETH
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
                  Total Tokens
                </p>
                <h3 className="text-2xl font-bold">{totalTokens}</h3>
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
                <h3 className="text-2xl font-bold">142</h3>
              </div>
              <Users className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Your Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Token Price</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    {property.name}
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.price} ETH</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Progress
                        value={(property.soldTokens / property.totalTokens) * 100}
                      />
                      <p className="text-sm text-muted-foreground">
                        {property.soldTokens} / {property.totalTokens} tokens sold
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(property.soldTokens * property.price).toFixed(2)} ETH
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Token Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {/* <ChartContainer>
              <BarChart data={properties[0].monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sales" fill="#526952" />
              </BarChart>
            </ChartContainer> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyOwner;