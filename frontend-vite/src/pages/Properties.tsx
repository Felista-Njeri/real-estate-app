import { useState } from "react";
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
import Footer from "@/reactcomponents/Footer";
import Navbar from "@/reactcomponents/Navbar";

const properties = [
  {
    id: 1,
    name: "Two Rivers Mall",
    location: "Limuru Rd, Nairobi",
    price: 0.1,
    totalTokens: 1000,
    availableTokens: 750,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  },
  {
    id: 2,
    name: "AppleWood Adams",
    location: "Ngong Rd, Nairobi",
    price: 0.15,
    totalTokens: 2000,
    availableTokens: 1200,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  },
  {
    id: 3,
    name: "Eagle Apartments",
    location: "Upperhill, Nairobi",
    price: 0.15,
    totalTokens: 2000,
    availableTokens: 1200,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  },
];

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
        Property Marketplace
      </h1>

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
        {properties.map((property) => (
          <Card
            key={property.id}
            className="glass-card overflow-hidden hover-transform"
          >
            <div className="relative h-48">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {property.price} ETH/token
              </div>
            </div>

            <CardHeader>
              <CardTitle>{property.name}</CardTitle>
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
                    <p className="font-medium">{property.totalTokens}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available</p>
                    <p className="font-medium">{property.availableTokens}</p>
                  </div>
                </div>

                <Button className="w-full bg-sage-600 hover:bg-sage-700">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Properties;