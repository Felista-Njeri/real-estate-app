import { useState } from "react";
import { useNavigate } from "react-router";
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface Property {
  propertyId: number;
  propertyName: string;
  location: string;
  images: string;
  totalTokens: bigint;
  tokenPrice: bigint;
  totalDividends: bigint;
  owner: string;
  isActive: boolean;
}

const RecentListings = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
  
    const { data, isLoading, isError } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getAllProperties",
    });
  
    // Typecast the data to Property[] or provide an empty array as a fallback
    const properties: Property[] = (data as Property[]) || [];
  
    if (isLoading) return <><div className="flex justify-center items-center h-screen gap-4"><p>Loading</p><span className="loading loading-spinner loading-lg"></span></div></>
    if (isError) return <p>Error fetching properties.</p>;
    if (!properties.length) return <p>No properties available.</p>;
  
  return (
     <div className="container mx-auto px-4 py-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Property Marketplace</h1>
    
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: Property, index: number) => (
              <Card
                key={index}
                className="glass-card overflow-hidden hover-transform"
              >
                <div className="relative h-48">
                  <img
                    src={property.images}
                    alt={property.propertyName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {Number(property.tokenPrice) / 1e18}  ETH/token
                  </div>
                </div>
    
                <CardHeader>
                  <CardTitle>{property.propertyName}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
    
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Tokens</p>
                        <p className="font-medium">{property.totalTokens.toString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-medium">{property.totalTokens.toString()}</p>
                      </div>
                    </div>
    
                    <Button 
                    className="w-full bg-sage-600 hover:bg-sage-700"
                    onClick={() => navigate(`/marketplace/${property.propertyId}`)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
  )
}

export default RecentListings