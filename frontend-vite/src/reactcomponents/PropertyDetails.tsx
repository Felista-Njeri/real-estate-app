import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { useReadContract } from "wagmi";
import { useParams } from "react-router";
import Footer from "@/reactcomponents/Footer";
import Navbar from "@/reactcomponents/Navbar";
import BuyModal from "@/reactcomponents/BuyModal";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  
  if (isLoading) return <><Navbar/> <div className="flex justify-center items-center h-screen gap-4"><p>Loading</p><span className="loading loading-spinner loading-lg"></span></div><Footer /></>
  if (isError || !property) return <p>Property not found.</p>;


  return (
    <>
    <Navbar />
    <Card
            className="glass-card overflow-hidden hover-transform"
          >
            <div className="relative h-48">
              <img
                src={property.images}
                alt={property.propertyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              Token Price: {Number(property.tokenPrice) / 1e18} ETH
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
                  className="w-full bg-sage-600 hover:bg-sage-700 flex items-center justify-center gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  Buy Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
    
    <Footer />
    <BuyModal 
      propertyId={property.propertyId} 
      tokenPrice={property.tokenPrice} 
      isOpen={isModalOpen} 
      onClose={() => setModalOpen(false)}
    />
    </>
  )
}

export default PropertyDetails