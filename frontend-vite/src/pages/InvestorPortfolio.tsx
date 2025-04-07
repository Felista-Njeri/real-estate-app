import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Building2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import SellModal from "@/reactcomponents/SellModal";
import DepositDividendsModal from "@/reactcomponents/DepositDividendsModal";
import ClaimDividendsModal from "@/reactcomponents/ClaimDividendsModal";

interface PortfolioItem {
  propertyId: number;
  propertyName: string;
  value: number;
  tokens: number;
  roi: number;
  tokenPrice: bigint;
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

const InvestorPortfolio = ({ propertyId }: { propertyId: number }) => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PortfolioItem | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [showClaimDividendsModal, setShowClaimDividendsModal] = useState(false);

  const { data , isLoading, isError } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getInvestorHoldings",
    args: [address],
  });

  const fetchInvestorBalances = async (propertyId: number) => {
    const { data: balance } = useReadContract({
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "getInvestorBalance",
      args: [propertyId, address],
    });
    return Number(balance || 0);
    
  };

  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      try {
        // Ensure data is formatted correctly
        const formattedHoldings: PortfolioItem[] = (data as any[]).map((item) => {
          const tokens = 0 // Fetch tokens from investorBalances
          const value = tokens * Number(item.tokenPrice) / 1e18; // Calculate value
          const roi = 0; // Calculate ROI (you need to implement this logic)

          return {
          propertyId: Number(item.propertyId || 0),
          propertyName: item.propertyName || "Unknown",
          value: value,
          tokens: tokens,
          roi: roi,
          tokenPrice: BigInt(item.tokenPrice || 0),
        };
        });
        console.log("Formatted holdings:", formattedHoldings)  
        setHoldings(formattedHoldings);
      } catch (error) {
        console.error("Error processing holdings data:", error);
      }
      setLoading(false);
    }
  }, [data, isLoading, address]);

  // Ensure calculations only run when holdings exist
  const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalTokens = holdings.reduce((acc, curr) => acc + curr.tokens, 0) || 0;
  const averageROI =
    holdings.length > 0
      ? holdings.reduce((acc, curr) => acc + curr.roi, 0) / holdings.length
      : 0;
     
  const handleSellClick = (property: PortfolioItem) => {
    setSelectedProperty(property); // Set the selected property
    setModalOpen(true); // Open the modal
  };

  const handleDepositDividendClick = (property: PortfolioItem) => {
    setSelectedProperty(property); // Set the selected property
    setDepositModalOpen(true); // Open the modal
  };

  const handleClaimDividends = (property: PortfolioItem) => {
    setSelectedProperty(property); // Set the selected property
    setShowClaimDividendsModal(true); // Open the modal
  };

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
                      <Button
                        className="bg-sage-600 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                        onClick={() => navigate(`/marketplace/${holding.propertyId}`)}
                      >
                        View Property
                      </Button>
                      <Button
                        className="bg-red-600 mx-4 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        onClick={() => handleSellClick(holding)}
                      >
                        Sell Property Tokens
                      </Button>
                      <Button
                        className="bg-sage-600 mx-4 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                        onClick={() => handleDepositDividendClick(holding)}
                      >
                        Deposit Dividends
                      </Button>
                      <Button
                        className="bg-sage-600 mx-4 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                        onClick={() => handleClaimDividends(holding)}
                      > 
                        Claim Dividends
                      </Button>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

      {/* Sell Modal */}
      {selectedProperty && (
        <SellModal
          propertyId={selectedProperty.propertyId}
          tokenPrice={selectedProperty.tokenPrice}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
      {/* Sell Modal */}
      {selectedProperty && (
        <DepositDividendsModal
          propertyId={selectedProperty.propertyId}
          isOpen={isDepositModalOpen}
          onClose={() => setDepositModalOpen(false)}
        />
      )}
      {/* Deposit Dividends Modal */}
        {selectedProperty && (<ClaimDividendsModal
        propertyId={selectedProperty.propertyId}
        isOpen={showClaimDividendsModal}
        onClose={() => setShowClaimDividendsModal(false)}
      />)}
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
