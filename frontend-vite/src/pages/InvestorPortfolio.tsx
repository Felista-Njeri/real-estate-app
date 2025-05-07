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
import { DashboardLayout } from "@/reactcomponents/DashboardLayout";
import { fetchMetadataFromIPFS } from "@/utils/pinata";
import { Property, PropertyMetaData } from "@/types/index";

interface PortfolioItem {
  propertyId: number;
  value: number;
  tokens: number;
  roi: number;
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

const InvestorPortfolio = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState<PortfolioItem []>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [showClaimDividendsModal, setShowClaimDividendsModal] = useState(false);
  const [propertiesWithMetadata, setPropertiesWithMetadata] = useState<(Property & PropertyMetaData & PortfolioItem)[]>([]);

  const { data , isLoading, isError } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getInvestorHoldings",
    args: [address],
  });
  
    useEffect(() => {
      const fetchAllMetadata = async () => {
        if (!data || !Array.isArray(data)) return;
  
        try {
          const allProperties = data as Property[];
  
          const enriched = await Promise.all(
            allProperties.map(async (property) => {
              try {
                const metadata = await fetchMetadataFromIPFS(property.metadataCID);
                return { ...property, ...metadata };
              } catch (err) {
                console.error(`Failed to fetch metadata for property ${property.propertyId}:`, err);
                return null;
              }
            })
          );
  
          const filtered = enriched.filter((p): p is Property & PropertyMetaData & PortfolioItem => p !== null);
          setPropertiesWithMetadata(filtered);
        } catch (err) {
          console.error("Error processing property metadata:", err);
        }
      };
  
      fetchAllMetadata();
    }, [data]);
  
  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      const fetchHoldingsData = async () => {
        try {
          const holdingsData = await Promise.all(
            data.map(async (property: Property) => {
              // Fetch all needed data in parallel
              const balance = await readContract(wagmiconfig, {
                  abi: CONTRACT_ABI,
                  address: CONTRACT_ADDRESS,
                  functionName: "getInvestorBalanceForEachProperty",
                  args: [Number(property.propertyId), address],
                })
  
              const tokensOwned = Number(balance || 0);
              const tokenValue = ((tokensOwned * Number(property.tokenPrice) / 1e18) * (130 * 2000));

              // Simple ROI calculation
              const roi = (Number(tokensOwned) / Number(property.totalDividends) / 1e18 * 260000) * 100;
  
              return {
                propertyId: Number(property.propertyId),
                value: tokenValue,
                tokens: tokensOwned,
                roi: roi,
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
  }, [data, isLoading, address]);
     
  const handleSellClick = (property: Property) => {
    setSelectedProperty(property); // Set the selected property
    setModalOpen(true); // Open the modal
  };

  // const handleDepositDividendClick = (property: PortfolioItem) => {
  //   setSelectedProperty(property); // Set the selected property
  //   setDepositModalOpen(true); // Open the modal
  // };

  const handleClaimDividends = (property: Property) => {
    setSelectedProperty(property); // Set the selected property
    setShowClaimDividendsModal(true); // Open the modal
  };

  if (!propertiesWithMetadata ) return (
    <div className="h-96 flex items-center justify-center">
      <p>Loading metadata</p>
      <span className="loading loading-spinner loading-md"></span>
    </div>
  )

  return (
    <DashboardLayout>
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
          value={holdings.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-KE')}
          icon={<DollarSign className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Total Tokens" 
          value={holdings.reduce((sum, item) => sum + item.tokens, 0).toLocaleString()}
          icon={<Wallet className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Total Tokens" 
          value={holdings.reduce((sum, item) => sum + item.tokens, 0).toLocaleString()}
          icon={<TrendingUp className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Properties" 
          value={holdings.length.toString()} 
          icon={<Building2 className="h-8 w-8 text-sage-600" />} />
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
    <p className="text-center text-gray-500">You do not own any properties yet.</p>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {propertiesWithMetadata.map((property) => {
      const holding = holdings.find(h => h.propertyId == property.propertyId);
      if (!holding) return <p>there is an error somewhere</p>;
      return (
        <Card
          key={property.propertyId}
          className="glass-card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/3 h-48 relative">
              <div className="absolute rounded-tl-md top-0 left-0 bg-emerald-600 text-white px-3 py-1 rounded-br-md">
                Tokenized
              </div>
              <img
                src={property.images.split(",")[0] || "/apartment.jpg"}
                alt={property.propertyName}
                className="w-full h-48 rounded-md object-cover"
              />
            </div>
            <div className="md:w-2/3 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    {property.propertyName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">
                      {property.location || "Unknown Location"}
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  KES{holding.value.toLocaleString('en-KE')}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Tokens Owned</p>
                  <p className="text-base font-medium">{holding.tokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Token Supply</p>
                  <p className="text-base font-medium">{property.totalTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Dividends</p>
                  <p className="text-base font-medium">KES{(Number(property.totalDividends) / 1e18 * 260000).toLocaleString('en-KE')}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className={`text-base font-medium ${holding.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.roi.toLocaleString()}%
                  </p>
                </div> */}
              </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/marketplace/${property.propertyId}`)}
              >
                View Details
              </Button>
              <Button 
                size="sm" 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => handleSellClick(property)}
              >
                Sell Tokens
              </Button>
              <Button
                size="sm"
                className="bg-sage-600 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                onClick={() => handleClaimDividends(property)}
              > 
                Claim Dividends
                </Button>
            </div>
            </div>
          </div>
        </Card>
      )
      })}
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
                  <TableCell>{transaction.tokens || "100"}</TableCell>
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
    </DashboardLayout>
  );
};

export default InvestorPortfolio;
