import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Building2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";

interface PortfolioItem {
  propertyId: number;
  propertyName: string;
  value: number;
  tokens: number;
  roi: number;
}

const InvestorPortfolio = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data, isLoading, isError } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getInvestorHoldings",
    args: [address],
  });

  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      try {
        // Ensure data is formatted correctly
        const formattedHoldings: PortfolioItem[] = (data as any[]).map((item) => ({
          propertyId: Number(item.propertyId),
          propertyName: item.propertyName,
          value: Number(item.value),
          tokens: Number(item.tokens),
          roi: Number(item.roi),
        }));

        setHoldings(formattedHoldings);
      } catch (error) {
        console.error("Error processing holdings data:", error);
      }
      setLoading(false);
    }
  }, [data, isLoading]);

  // Ensure calculations only run when holdings exist
  const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalTokens = holdings.reduce((acc, curr) => acc + curr.tokens, 0) || 0;
  const averageROI =
    holdings.length > 0
      ? holdings.reduce((acc, curr) => acc + curr.roi, 0) / holdings.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">Investment Portfolio</h1>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Value" value={`$${totalValue.toLocaleString()}`} icon={<DollarSign className="h-8 w-8 text-sage-600" />} />
        <StatCard title="Total Tokens" value={totalTokens.toString()} icon={<Wallet className="h-8 w-8 text-sage-600" />} />
        <StatCard title="Average ROI" value={`${averageROI.toFixed(1)}%`} icon={<TrendingUp className="h-8 w-8 text-sage-600" />} />
        <StatCard title="Properties" value={holdings.length.toString()} icon={<Building2 className="h-8 w-8 text-sage-600" />} />
      </div>

      {/* Property Holdings */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 flex justify-center gap-x-2">
              Loading holdings<span className="loading loading-spinner loading-sm"></span>
            </p>
          ) : isError ? (
            <p className="text-center text-red-500">Error fetching portfolio.</p>
          ) : holdings.length === 0 ? (
            <p className="text-center text-gray-500">You don’t own any properties yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tokens Owned</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{holding.propertyName}</TableCell>
                    <TableCell>{holding.tokens}</TableCell>
                    <TableCell>${holding.value.toLocaleString()}</TableCell>
                    <TableCell className="text-sage-600">{holding.roi}%</TableCell>
                    <TableCell>
                      <button
                        className="bg-sage-600 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                        onClick={() => navigate(`/marketplace/${holding.propertyId}`)}
                      >
                        View Property
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorPortfolio;

// Reusable Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card className="glass-card">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
);
