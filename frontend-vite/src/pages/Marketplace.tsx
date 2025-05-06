import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useReadContract } from 'wagmi';
import { readContract } from '@wagmi/core';
import { wagmiconfig } from "../../wagmiconfig";
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
import { fetchMetadataFromIPFS } from "@/utils/pinata";
import { Property, PropertyMetaData } from "@/types/index";

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTokensMap, setAvailableTokensMap] = useState<{ [key: number]: number }>({});
  const [propertiesWithMetadata, setPropertiesWithMetadata] = useState<(Property & PropertyMetaData)[]>([]);

  const navigate = useNavigate();

  const { data, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllProperties",
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

        const filtered = enriched.filter((p): p is Property & PropertyMetaData => p !== null);
        setPropertiesWithMetadata(filtered);
      } catch (err) {
        console.error("Error processing property metadata:", err);
      }
    };

    fetchAllMetadata();
  }, [data]);

  const filteredProperties = propertiesWithMetadata.filter(
    (p) =>
      p.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchAvailableTokens = async () => {
      if (!propertiesWithMetadata.length) return;

      const tokenMap: { [key: number]: number } = {};

      await Promise.all(
        propertiesWithMetadata.map(async (property) => {
          try {
            const tokens = await readContract(wagmiconfig, {
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getAvailableTokens',
              args: [property.propertyId],
            });

            tokenMap[property.propertyId] = Number(tokens);
          } catch (err) {
            console.error(`Error fetching tokens for property ${property.propertyId}`, err);
          }
        })
      );
      setAvailableTokensMap(tokenMap);
    };

    fetchAvailableTokens();
  }, [propertiesWithMetadata]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen gap-4">
      <p>Loading</p>
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
  if (isError) return <p className="text-center mt-56">Error fetching properties.</p>
  if (!propertiesWithMetadata) return (
    <div className="flex justify-center items-center h-screen gap-4">
      <p>Loading properties</p>
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
  //if (!propertiesWithMetadata.length) return <p className="text-center mt-56">No properties available.</p>

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
        {filteredProperties.map((property, index) => (
          <Card key={index} className="glass-card overflow-hidden hover-transform">
            <div className="relative h-48">
              <img
                src={property.images.split(",")[0]} // Just first image for now
                alt={property.propertyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {((Number(property.tokenPrice) / 1e18) * 2000 * 130).toLocaleString('en-KE')} KES/token
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
                    <p className="font-medium">{property.totalTokens.toLocaleString('en-KE')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available Tokens</p>
                    <p className="font-medium">
                      {availableTokensMap[property.propertyId] !== undefined
                        ? availableTokensMap[property.propertyId].toLocaleString('en-KE')
                        : "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Value</p>
                    <p className="font-medium">
                      {(Number(property.totalTokens) * Number(property.tokenPrice) / 1e18 * 2000 * 130 ).toLocaleString('en-KE')} KES
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dividends</p>
                    <p className="font-medium">{(Number(property.totalDividends) / 1e18 * 2000 * 130).toLocaleString('en-KE')} KES</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-sage-600 hover:bg-sage-700"
                  onClick={() => navigate(`/marketplace/${property.propertyId}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!filteredProperties.length && (
          <p className="text-center text-gray-500 col-span-full">No matching properties found.</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
