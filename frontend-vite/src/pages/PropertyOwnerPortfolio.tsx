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
  Users,
  Coins,
  TrendingUp,
  MapPin,
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

const dividendHistory = [
  {
    id: 1,
    property: "Luxury Apartment Complex",
    date: "2024-03-15",
    amount: 0.012 * 2000* 130,
    recipients: 42,
    status: "Distributed",
  },
  {
    id: 2,
    property: "Commercial Office Space",
    date: "2024-03-10",
    amount: 0.018 * 2000* 130,
    recipients: 85,
    status: "Distributed",
  },
  {
    id: 3,
    property: "Retail Shopping Center",
    date: "2024-02-28",
    amount: 0.014 * 2000* 130,
    recipients: 64,
    status: "Distributed",
  },
];


const PropertyOwnerPortfolio = () => {
  const { address } = useAccount();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [propertiesWithMetadata, setPropertiesWithMetadata] = useState<(Property & PropertyMetaData)[]>([]);

  const { data, isLoading, isError, isFetching } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertiesByOwner',
    args: [address],
  })
  //const properties: Property[] = (data as Property[]) || [];

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
  //if (propertiesWithMetadata.length <= 0) return <div className="h-96 flex items-center justify-center">You have no Tokenized properties</div>

  const handleDepositDividendClick = (property: Property) => {
    setSelectedProperty(property); // Set the selected property
    setDepositModalOpen(true); // Open the modal
  };

  return (
    <DashboardLayout>
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
                  1,200,000 KES
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

      {/* Properties Cards */}
      <div className="mb-8 glass-card p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>
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
                      {(Number(property.tokenPrice) /1e18 * 2000 * 130).toLocaleString("en-KE")} KES
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Token Sales</p>
                      <div className="flex items-center space-x-1">
                        <Progress
                        //TO DO: Copy lofic from single property detail page
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
                      <p className="text-base font-medium">700,000 KES</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Dividends:</span>
                      <p className="font-medium">{((Number(property.totalDividends)) /1e18 * 130 * 2000).toLocaleString('en-KE')} KES</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tokens:</span>
                      <p className="font-medium">{property.totalTokens.toLocaleString('en-KE')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Investors:</span>
                      <p className="font-medium">45</p>
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
                <TableHead>Amount (KES)</TableHead>
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
                  <TableCell>{dividend.amount.toLocaleString('en-KE')}</TableCell>
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
