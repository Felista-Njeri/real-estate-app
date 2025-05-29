import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { wagmiconfig }  from "../../wagmiconfig";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Building2 } from "lucide-react";
import SellModal from "@/reactcomponents/SellModal";
import DepositDividendsModal from "@/reactcomponents/DepositDividendsModal";
import ClaimDividendsModal from "@/reactcomponents/ClaimDividendsModal";
import StatCard from '@/reactcomponents/StatCard'
import { DashboardLayout } from "@/reactcomponents/DashboardLayout";
import { fetchMetadataFromIPFS } from "@/utils/pinata";
import { Property, PropertyMetaData } from "@/types/index";
import { parseAbi } from 'viem';
import { getPublicClient } from '@wagmi/core';
import { Button } from "@/components/ui/button";

interface PortfolioItem {
  propertyId: number;
  value: number;
  tokens: number;
  roi: number;
  unclaimedDividends: number;
}

type ClaimDividendTransaction = {
  id: string;
  type: string;
  date: Date;
  property: string;
  totalValueClaimed: number;
};

const InvestorDividendDashboard = () => {
  const { address } = useAccount();

  const [holdings, setHoldings] = useState<PortfolioItem []>([]);
  const [claimDividendHistory, setClaimDividendHistory] = useState<ClaimDividendTransaction[]>([]);
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
        async function fetchLogs(){
        const publicClient = getPublicClient(wagmiconfig)
        try{
            const logs = await publicClient.getLogs({  
            address: CONTRACT_ADDRESS,
            events: parseAbi([
                'event DividendsClaimed(uint256 propertyId, string propertyName, address investor, uint256 amount)'
            ]),
            fromBlock: 0n,
            toBlock: 'latest',
            strict: true,
            })
            console.log("Logs", logs)
            
            const transactions: ClaimDividendTransaction[] = logs.map((log) => ({
            id: log.transactionHash,
            type: log.eventName,
            date: new Date(),
            property: log.args.propertyName,
            totalValueClaimed: Number(log.args.amount) / 1e18 * 260000
            }));

            setClaimDividendHistory(transactions);

      } catch(error){
        console.error('Error fetching transaction history:', error);
      }
    }
    fetchLogs();
  }, [])

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

                // Fetch total dividends for the property
                const propertyData = await readContract(wagmiconfig, {
                    abi: CONTRACT_ABI,
                    address: CONTRACT_ADDRESS,
                    functionName: "getProperty",
                    args: [BigInt(property.propertyId)],
                }) as Property ;

                // Fetch claimed dividends by the investor
                const claimedDividends = await readContract(wagmiconfig,{
                    abi: CONTRACT_ABI,
                    address: CONTRACT_ADDRESS,
                    functionName: "claimedDividends",
                    args: [BigInt(property.propertyId), address],
                });

                const totalDividends = propertyData.totalDividends
                const totalTokens = propertyData.totalTokens

                // Calculate unclaimed dividends
                const dividendShare = (Number(balance) * Number(totalDividends)) / Number(totalTokens);
                const unclaimedDividends = dividendShare - Number(claimedDividends);


              const tokensOwned = Number(balance || 0);
              const tokenValue = ((tokensOwned * Number(property.tokenPrice) / 1e18) * 260000);

              // Simple ROI calculation
              const roi = (Number(tokensOwned) / Number(property.totalDividends) / 1e18 * 260000) * 100;
  
              return {
                propertyId: Number(property.propertyId),
                value: tokenValue,
                tokens: tokensOwned,
                roi: roi,
                unclaimedDividends: unclaimedDividends
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
     
  // const handleSellClick = (property: Property) => {
  //   setSelectedProperty(property); // Set the selected property
  //   setModalOpen(true); // Open the modal
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
      <h1 className="text-4xl font-bold mb-8">Investor Dividend Dashboard</h1>

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading portfolio data. Please try again.
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Claimed Dividends (KES)" 
          value={claimDividendHistory.reduce((sum, item) => sum + item.totalValueClaimed, 0).toLocaleString()}
          icon={<Wallet className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Unclaimed Dividends (KES)" 
          value={holdings.reduce((sum, item) => sum + Number(item.unclaimedDividends) / 1e18 * 260000, 0).toLocaleString()}
          icon={<TrendingUp className="h-8 w-8 text-sage-600" />} />
        <StatCard 
          title="Properties" 
          value={holdings.length.toString()} 
          icon={<Building2 className="h-8 w-8 text-sage-600" />} />
      </div>

    {/* Claim Dividends Transaction History */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle>Claim Dividends History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claimDividendHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.property}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{(transaction.totalValueClaimed).toLocaleString('en-KE')} </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Claimed
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        {/* Property Holdings Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Value (KES)</TableHead>
                <TableHead>Tokens Owned</TableHead>
                <TableHead>Overall Dividends (KES)</TableHead>
                <TableHead>Unclaimed Dividends (KES)</TableHead>
                <TableHead>Claimed Dividends (KES)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiesWithMetadata.map((property) => {
               const holding = holdings.find(h => h.propertyId == property.propertyId);
               const transaction = claimDividendHistory.find(t => t.property?.trim().toLowerCase() === property.propertyName.trim().toLowerCase());
               if (!holding) return <p>There is an error somewhere</p>;
               return (
                <TableRow key={property.propertyId}>
                  <TableCell className="font-medium">
                    {property.propertyName}
                  </TableCell>
                  <TableCell>{holding.value.toLocaleString('en-KE')}</TableCell>
                  <TableCell>{holding.tokens.toLocaleString()}</TableCell>
                  <TableCell>
                    {(Number(property.totalDividends) / 1e18 * 260000).toLocaleString('en-KE')}
                  </TableCell>
                  <TableCell>{(holding.unclaimedDividends / 1e18 * 260000).toLocaleString()}</TableCell>
                  <TableCell>{(transaction?.totalValueClaimed ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {holding.unclaimedDividends > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Unclaimed
                      </span>
                    ): 
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      No dividends to claim
                      </span>
                    }
                  </TableCell>
                  <TableCell>
                    {holding.unclaimedDividends > 0 ? (
                      <Button
                        size="sm"
                        className="bg-sage-600 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                        onClick={() => handleClaimDividends(property)}
                    > 
                        Claim Dividends
                    </Button>
                    ) : (
                    <Button
                        size="sm"
                        disabled
                        className="bg-sage-600 cursor-not-allowed opacity-50"
                        title="You have no dividends to claim"
                    > 
                    No dividends
                    </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
              )}
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

export default InvestorDividendDashboard;
