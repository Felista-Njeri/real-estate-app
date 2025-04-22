import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { wagmiconfig }  from "../../wagmiconfig";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Building2, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import SellModal from "@/reactcomponents/SellModal";
import DepositDividendsModal from "@/reactcomponents/DepositDividendsModal";
import ClaimDividendsModal from "@/reactcomponents/ClaimDividendsModal";
import StatCard from '@/reactcomponents/StatCard'
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

interface PortfolioItem {
  propertyId: number;
  propertyName: string;
  location: string;
  value: number;
  tokens: number;
  tokenPrice: bigint;
  totalDividends: bigint;
  roi: number;
  imageUrl?: string;
}

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

const InvestorPortfolio = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PortfolioItem | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [showClaimDividendsModal, setShowClaimDividendsModal] = useState(false);

  const { data: properties , isLoading, isError } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getInvestorHoldings",
    args: [address],
  });
  
  useEffect(() => {
    if (!isLoading && Array.isArray(properties)) {
      const fetchHoldingsData = async () => {
        try {
          const holdingsData = await Promise.all(
            properties.map(async (property: any) => {
              // Fetch all needed data in parallel
              const balance = await readContract( wagmiconfig, {
                  abi: CONTRACT_ABI,
                  address: CONTRACT_ADDRESS,
                  functionName: "getInvestorBalanceForEachProperty",
                  args: [Number(property.propertyId), address],
                })
  
              const tokensOwned = Number(balance || 0);
              const tokenValue = tokensOwned * Number(property.tokenPrice) / 1e18;

              // Simple ROI calculation
              const roi = property.tokenValue > 0 ? (Number(property.totalDividends)) / (Number(property.tokenPrice)) * 100 : 0;
  
              return {
                propertyId: Number(property.propertyId),
                propertyName: property.propertyName,
                location: property.location,
                value: tokenValue,
                tokens: tokensOwned,
                roi: roi,
                tokenPrice: BigInt(property.tokenPrice),     
                totalDividends: BigInt(property.totalDividends),
              };
            })
          );
          setHoldings(holdingsData);
        } catch (error) {
          console.error("Error fetching holdings data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchHoldingsData();
    }
  }, [properties, isLoading, address]);


  // Ensure calculations only run when holdings exist
  // const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0) || 0;
  // const totalTokens = holdings.reduce((acc, curr) => acc + curr.tokens, 0) || 0;
  // const averageROI =
  //   holdings.length > 0
  //     ? holdings.reduce((acc, curr) => acc + curr.roi, 0) / holdings.length
  //     : 0;
     
  const handleSellClick = (property: PortfolioItem) => {
    setSelectedProperty(property); // Set the selected property
    setModalOpen(true); // Open the modal
  };

  // const handleDepositDividendClick = (property: PortfolioItem) => {
  //   setSelectedProperty(property); // Set the selected property
  //   setDepositModalOpen(true); // Open the modal
  // };

  const handleClaimDividends = (property: PortfolioItem) => {
    setSelectedProperty(property); // Set the selected property
    setShowClaimDividendsModal(true); // Open the modal
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">Investor Portfolio</h1>

      {isError && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    Error loading portfolio data. Please try again.
  </div>
)}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Value" 
          value={holdings.reduce((sum, item) => sum + item.tokens, 0).toString()}
          icon={<DollarSign className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Total Tokens" 
          value={holdings.reduce((sum, item) => sum + item.tokens, 0).toString()}
          icon={<Wallet className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Average ROI" 
          value={holdings.reduce((sum, item) => sum + item.tokens, 0).toString()}
          icon={<TrendingUp className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Properties" 
          value={holdings.length.toString()} 
          icon={<Building2 className="h-8 w-8 text-sage-600" />} />
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
                  data={holdings}
                  dataKey="value"
                  nameKey="propertyName"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {holdings.map((entry, index) => (
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
                    const item = holdings[index];
                    const percentage = (
                      (item.value /
                        holdings.reduce((sum, h) => sum + h.value, 0)) *
                      100
                    ).toFixed(1);
                    return `${value.slice(0, 15)}... (${percentage}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

{/* Property Holdings */}
<div className="mb-8 p-4 glass-card">
  <h2 className="text-2xl font-semibold mb-4">Your Property Holdings</h2>

  {loading ? (
    <p className="text-center text-gray-500 flex justify-center gap-x-2">
      Loading holdings
      <span className="loading loading-spinner loading-sm"></span>
    </p>
  ) : isError ? (
    <p className="text-center text-red-500">Error fetching portfolio.</p>
  ) : holdings.length === 0 ? (
    <p className="text-center text-gray-500">You don’t own any properties yet.</p>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {holdings.map((holding, index) => (
        <Card
          key={index}
          className="glass-card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/3 h-48 relative">
              <div className="absolute rounded-tl-md top-0 left-0 bg-emerald-600 text-white px-3 py-1 rounded-br-md">
                Tokenized
              </div>
              <img
                src={holding.imageUrl || "/apartment.jpg"} // fallback image if not available
                alt={holding.propertyName}
                className="w-full h-48 rounded-md object-cover"
              />
            </div>
            <div className="md:w-2/3 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    {holding.propertyName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">
                      {holding.location || "Unknown Location"}
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  ${holding.value.toString()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Tokens Owned</p>
                  <p className="text-base font-medium">{holding.tokens}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-base font-medium">${holding.value}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className={`text-base font-medium ${holding.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.roi.toFixed(1)}%
                  </p>
                </div>
              </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/marketplace/${holding.propertyId}`)}
              >
                View Details
              </Button>
              <Button 
                size="sm" 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => handleSellClick(holding)}
              >
                Sell Tokens
              </Button>
              <Button
                size="sm"
                className="bg-sage-600 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                onClick={() => handleClaimDividends(holding)}
              > 
                Claim Dividends
                </Button>
            </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )}
</div>


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

      {/* Sell Modal */}
      {selectedProperty && (
        <SellModal
          propertyId={selectedProperty.propertyId}
          tokenPrice={selectedProperty.tokenPrice}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
      {/* Deposit Dividends Modal */}
      {selectedProperty && (
        <DepositDividendsModal
          propertyId={selectedProperty.propertyId}
          isOpen={isDepositModalOpen}
          onClose={() => setDepositModalOpen(false)}
        />
      )}
      {/* Claim Dividends Modal */}
        {selectedProperty && (
        <ClaimDividendsModal
        propertyId={selectedProperty.propertyId}
        isOpen={showClaimDividendsModal}
        onClose={() => setShowClaimDividendsModal(false)}
      />)}
    </div>
  );
};

export default InvestorPortfolio;
