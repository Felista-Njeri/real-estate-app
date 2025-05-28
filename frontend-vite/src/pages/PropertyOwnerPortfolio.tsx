import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import DepositDividendsModal from "@/reactcomponents/DepositDividendsModal";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Coins,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/reactcomponents/DashboardLayout";
import { fetchMetadataFromIPFS } from "@/utils/pinata";
import { Property, PropertyMetaData } from "@/types/index";
import { Link } from "react-router";
import { parseAbi } from 'viem';
import { getPublicClient } from '@wagmi/core';
import { wagmiconfig }  from "../../wagmiconfig";

type Transaction = {
  id: string;
  type: string;
  date: Date;
  property: string;
  tokens: number;
  price: number;
};

type Dividend = {
  id: string;
  type: string;
  date: Date;
  property: string;
  status: "Distributed";
  totalDividends: number;
};

const PropertyOwnerPortfolio = () => {
  const { address } = useAccount();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [propertiesWithMetadata, setPropertiesWithMetadata] = useState<(Property & PropertyMetaData)[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [dividendHistory, setDividendHistory] = useState<Dividend[]>([]);

  const { data, isLoading, isError, isFetching } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertiesByOwner',
    args: [address],
  })
  //const properties: Property[] = (data as Property[]) || [];
    useEffect(() => {
      async function fetchLogs(){
        const publicClient = getPublicClient(wagmiconfig)
        try{
          const logs = await publicClient.getLogs({  
            address: CONTRACT_ADDRESS,
            events: parseAbi([
              'event PropertyTokenized( uint256 propertyId, string propertyName, uint256 totalTokens, uint256 tokenPrice)',
            ]),
            fromBlock: 0n,
            toBlock: 'latest',
            strict: true,
          })
          console.log("Logs", logs)
            
          const transactions: Transaction[] = logs.map((log) => ({
            id: log.transactionHash,
            type: log.eventName,
            date: new Date(),
            property: log.args.propertyName,
            tokens: Number(log.args.totalTokens),
            price: Number(log.args.tokenPrice) / 1e18 * 260000,
          }));
  
          setTransactionHistory(transactions);
  
        } catch(error){
          console.error('Error fetching transaction history:', error);
        }
      }
      fetchLogs();
    }, [])

       useEffect(() => {
      async function fetchLogs(){
        const publicClient = getPublicClient(wagmiconfig)
        try{
          const logs = await publicClient.getLogs({  
            address: CONTRACT_ADDRESS,
            events: parseAbi([
              'event DividendsDistributed(uint256 propertyId, string propertyName, uint256 totalDividends)'
            ]),
            fromBlock: 0n,
            toBlock: 'latest',
            strict: true,
          })
          console.log("Logs", logs)
            
          const transactions: Dividend[] = logs.map((log) => ({
            id: log.transactionHash,
            type: log.eventName,
            date: new Date(),
            property: log.args.propertyName,
            status: "Distributed",
            totalDividends: Number(log.args.totalDividends) / 1e18 * 260000
          }));
  
          setDividendHistory(transactions);
  
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
  
          const filtered = enriched.filter((p): p is Property & PropertyMetaData => p !== null);
          setPropertiesWithMetadata(filtered);
        } catch (err) {
          console.error("Error processing property metadata:", err);
        }
      };
  
      fetchAllMetadata();
    }, [data]);

  if (!address) return <div className="h-96 flex items-center justify-center">Please connect your wallet</div>
  if (isLoading || isFetching || isError) return <div className="h-96 flex items-center justify-center"><Spinner className="text-black" /> Loading your properties...</div>
  if (!propertiesWithMetadata) return (
    <div className="h-96 flex items-center justify-center">
      <p>Loading metadata</p>
      <span className="loading loading-spinner loading-md"></span>
    </div>
  )

  const handleDepositDividendClick = (property: Property) => {
    setSelectedProperty(property); // Set the selected property
    setDepositModalOpen(true); // Open the modal
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold mb-8">Property Owner Dashboard</h1>
        <Button>
          <Link to={`/owner-dividend-dashboard`} className="flex items-center gap-1">Dividend Dashboard <ArrowUpRight size={30} /> </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Properties
                </p>
                <h3 className="text-2xl font-bold">{propertiesWithMetadata.length}</h3>
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
                  {(propertiesWithMetadata.reduce((sum, property) => sum + (Number(property.tokensSold) * Number(property.tokenPrice) / 1e18 * 260000), 0)).toLocaleString()} KES
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
                  Tokens Sold
                </p>
                <h3 className="text-2xl font-bold">
                  {(propertiesWithMetadata.reduce((sum, property) => sum + Number(property.tokensSold), 0)).toLocaleString()}
                </h3>
              </div>
              <TrendingUp className="h-8 w-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Cards */}
      <div className="mb-8 glass-card p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>
        {propertiesWithMetadata.length === 0 ? (
          <p className="text-center text-gray-500">You have no Tokenized properties</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {propertiesWithMetadata.map((property) => (
            <Card key={property.propertyId}>
              <div className="flex flex-col md:flex-row overflow-hidden">
                <div className="md:w-1/3 h-48 relative">
                  <div className="absolute top-0 left-0 bg-emerald-600 text-white px-3 py-1 rounded-tl-md">
                    Tokenized
                  </div>
                      <img 
                        src={property.images.split(",")[0]}
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
                      {(Number(property.tokenPrice) /1e18 * 2000 * 130).toLocaleString("en-KE")} KES/token
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Token Sales</p>
                      <div className="flex items-center space-x-1">
                        <Progress
                          value={
                            ((Number(property.totalTokens) - Number(property.tokensSold)) / (Number(property.totalTokens))) * 100
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {/* {Math.round((property.soldTokens / property.totalTokens) * 100)}% */}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(Number(property.tokensSold))} of{" "}
                        {property.totalTokens.toLocaleString('en-KE')} tokens sold
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Token Sale Revenue</p>
                      <p className="text-base font-medium">{(Number(property.tokensSold) * Number(property.tokenPrice) / 1e18 * 260000).toLocaleString()} KES</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Dividends</span>
                      <p className="font-medium">{((Number(property.totalDividends)) /1e18 * 130 * 2000).toLocaleString('en-KE')} KES</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tokens</span>
                      <p className="font-medium">{property.totalTokens.toLocaleString('en-KE')} tokens</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Property Value</span>
                      <p className="font-medium">{(Number(property.totalTokens) * Number(property.tokenPrice) / 1e18 * 260000).toLocaleString()} KES</p>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="mr-2">
                    <Link to={`/marketplace/${property.propertyId}`}>
                      Manage Property
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-sage-600 mx-4 text-white px-4 py-2 rounded-md hover:bg-sage-700"
                    onClick={() => handleDepositDividendClick(property)}
                  >
                    Deposit Dividends
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

      </div>

            {/* Tokenization Transaction History */}
            <Card className="glass-card mb-4">
              <CardHeader>
                <CardTitle>Tokenization History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Property Value</TableHead>
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
                        <TableCell>{transaction.tokens.toLocaleString()}</TableCell>
                        <TableCell>{(transaction.tokens * transaction.price).toLocaleString('en-KE')} </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

      {/* Dividend Distribution History */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Dividend Distribution History</CardTitle>
          <Link 
            to={`/owner-dividend-dashboard`} 
            className="mr-4 flex gap-2 items-center border border-gray-500 py-2 px-4 rounded-sm hover:bg-slate-300">
            More details <ArrowRight size={25}/>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Dividend Amount (KES)</TableHead>
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
                  <TableCell>{dividend.totalDividends.toLocaleString('en-KE')}</TableCell>
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
      {/* Deposit Dividends Modal */}
      {selectedProperty && (
        <DepositDividendsModal
          propertyId={selectedProperty.propertyId}
          isOpen={isDepositModalOpen}
          onClose={() => setDepositModalOpen(false)}
        />
      )}
    </div>
    </DashboardLayout>
  );
};

export default PropertyOwnerPortfolio;
