import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { useReadContract } from "wagmi";
import { useParams } from "react-router";
import BuyModal from "@/reactcomponents/BuyModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";


interface Property {
  propertyId: number;
  propertyName: string;
  location: string;
  images: string;
  description: string;
  totalTokens: bigint;
  tokenPrice: bigint;
  totalDividends: bigint;
  owner: string;
  isActive: boolean;
}

// Mock data
const propertyDetails = {
  id: 1,
  name: "Luxury Apartment Complex",
  location: "123 Ocean Drive, Miami, FL",
  description:
    "A premium residential complex featuring 200 luxury apartments with state-of-the-art amenities, including a rooftop pool, fitness center, and 24/7 concierge service.",
  price: 0.1,
  totalTokens: 1000,
  availableTokens: 750,
  totalInvestors: 45,
  annualReturn: 12.5,
  images: [
    "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  ],
  amenities: [
    "24/7 Security",
    "Rooftop Pool",
    "Fitness Center",
    "Concierge Service",
    "Underground Parking",
    "Business Center",
  ],
  financials: {
    propertyValue: "25,000,000",
    rentalYield: "8.5%",
    occupancyRate: "95%",
    monthlyRevenue: "180,000",
  },
  documents: [
    { name: "Property Valuation Report", type: "PDF" },
    { name: "Legal Documentation", type: "PDF" },
    { name: "Financial Projections", type: "PDF" },
  ],
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  
  const { data, isLoading, isError } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getProperty",
    args: [Number(id)], // Get a specific property by ID
  });
  
  const property: Property | null = data ? (data as Property) : null;
    
  if (isLoading) return <><div className="flex justify-center items-center h-screen gap-4"><p>Loading</p><span className="loading loading-spinner loading-lg"></span></div></>
  if (isError || !property) return <p>Property not found.</p>;
  

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      {/* Property Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {property.propertyName}
        </h1>
        <p className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-5 w-5 mr-2" />
          {property.location}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Images */}
          <Card className="glass-card overflow-hidden">
            <img
              src={propertyDetails.images[0]}
              alt={property.propertyName}
              className="w-full h-[400px] object-cover"
            />
          </Card>

          {/* Property Description should add in smart contract*/}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>About the Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{propertyDetails.description}</p>
            </CardContent>
          </Card>

          {/* Amenities should i add into the smart contract? */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyDetails.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <div className="h-2 w-2 bg-sage-600 rounded-full" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Property Value</TableCell>
                    <TableCell>${propertyDetails.financials.propertyValue}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Rental Yield</TableCell>
                    <TableCell>{propertyDetails.financials.rentalYield}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Occupancy Rate</TableCell>
                    <TableCell>
                      {propertyDetails.financials.occupancyRate}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Revenue</TableCell>
                    <TableCell>
                      ${propertyDetails.financials.monthlyRevenue}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Investment Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per Token</span>
                  <span className="font-medium">
                    {(Number(property.tokenPrice)) / 1e18} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Tokens</span>
                  <span className="font-medium">
                    {property.totalTokens}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Investors</span>
                  <span className="font-medium">
                    {propertyDetails.totalInvestors}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Annual Return</span>
                  <span className="font-medium text-sage-600">
                    {propertyDetails.annualReturn}%
                  </span>
                </div>
              </div>

              {/* how i will calculate available tokens from total tokens */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Token Sale Progress</label>
                <Progress
                  value={
                    ((propertyDetails.totalTokens - propertyDetails.availableTokens) /
                      propertyDetails.totalTokens) * 100
                  }
                />
                <p className="text-sm text-gray-600">
                  {propertyDetails.totalTokens - propertyDetails.availableTokens} of{" "}
                  {propertyDetails.totalTokens} tokens sold
                </p>
              </div>

              <Button 
                className="w-full bg-sage-600 hover:bg-sage-700"
                onClick={() => setModalOpen(true)}
              >
                Purchase Tokens
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {propertyDetails.documents.map((doc, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium">{doc.name}</span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <BuyModal 
          propertyId={property.propertyId} 
          tokenPrice={property.tokenPrice} 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)}
         />
    </div>
  );
};

export default PropertyDetails;