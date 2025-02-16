import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/reactcomponents/Navbar";
import Footer from "@/reactcomponents/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Tokenize = () => {
  const { toast } = useToast(); // data: writeData
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenizedProperty, setTokenizedProperty] = useState<{
    name: string;
    location: string;
    images: string;
    totalTokens: string;
    tokenPrice: string;
  } | null>(null);

  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [localLoading, setLocalLoading] = useState(false);

  const { isSuccess } = useWaitForTransactionReceipt({
    //isLoading
    hash: transactionHash,
  });

  // Watch for transaction success using useEffect
  useEffect(() => {
    console.log("Transaction Hash:", transactionHash);
    console.log("Transaction Success:", isSuccess);

    if (isSuccess) {
      setIsModalOpen(true); // Open modal when transaction is confirmed
    }
  }, [isSuccess, transactionHash]); // Only runs when isSuccess changes to true

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyName = formData.get("propertyName") as string;
    const location = formData.get("location") as string;
    const images = formData.get("images") as string;
    const totalTokens = formData.get("totalTokens") as string;
    const tokenPrice = formData.get("tokenPrice") as string;

    // Check if any field is null or an empty string
    if (!propertyName || !location || !images || !totalTokens || !tokenPrice) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Ensure totalTokens and tokenPrice are valid numbers
    const totalTokensNumber = Number(totalTokens);
    const tokenPriceNumber = Number(tokenPrice);

    if (
      isNaN(totalTokensNumber) ||
      isNaN(tokenPriceNumber) ||
      totalTokensNumber <= 0 ||
      tokenPriceNumber <= 0
    ) {
      toast({
        title: "Invalid Input",
        description: "Total Tokens and Token Price must be positive numbers.",
        variant: "destructive",
      });
      return;
    }
    // Convert to BigInt safely
    const totalTokensBigInt = BigInt(totalTokensNumber);
    const tokenPriceBigInt = BigInt(Math.floor(tokenPriceNumber * 1e18)); // Convert ETH to Wei

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description:
          "Please connect your wallet before tokenizing your property.",
        variant: "destructive",
      });
      return;
    }

    setLocalLoading(true); // Start loading before calling the contract

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "tokenizeProperty",
        args: [
          propertyName,
          location,
          images,
          totalTokensBigInt,
          tokenPriceBigInt,
        ],
      });

      if (hash) {
        setTransactionHash(hash as `0x${string}`); // Store transaction hash
        setTokenizedProperty({
          name: propertyName,
          location,
          images,
          totalTokens,
          tokenPrice,
        }); // Store property details
      }

      toast({
        title: "Property Submitted for Tokenization",
        description: "Your tokenization request is being processed.",
        className: "bg-green-500",
      });
    } catch (error: unknown) {
      console.error("Caught error:", error);

      if (error instanceof Error) {
        console.log("Error message:", error.message);

        if (error.message.includes("User rejected the request")) {
          toast({
            title: "Transaction Rejected",
            description:
              "You rejected the transaction. Please try again if you'd like to proceed.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Transaction Failed",
          description: "Failed to tokenize the property. Please try again.",
          variant: "destructive",
        });
        return;
      }
      console.error("Unexpected error", error);
      toast({
        title: "Unknown Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <>
      <Navbar />
      <div className=" mx-auto px-4 py-12 animate-fadeIn bg-gradient-to-r from-sage-100 to-terra-100">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
            Tokenize Your Property
          </h1>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Fill in the details of your property to begin the tokenization
                process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Property Name</Label>
                  <Input
                    id="propertyName"
                    name="propertyName"
                    placeholder="Enter property name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Property location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    name="images"
                    placeholder="Property images"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalTokens">Total Tokens</Label>
                    <Input
                      id="totalTokens"
                      name="totalTokens"
                      type="number"
                      placeholder="Number of tokens"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenPrice">Price per Token (ETH)</Label>
                    <Input
                      id="tokenPrice"
                      name="tokenPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sage-600 hover:bg-sage-700 flex items-center justify-center gap-2"
                  disabled={localLoading}
                >
                  {localLoading ? "Processing" : "Submit for Tokenization"}
                  {localLoading && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      {isModalOpen && tokenizedProperty && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Property Tokenized Successfully</DialogTitle>
              <DialogDescription>
                Your property has been successfully tokenized. Here are the
                details:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Property Name:</strong> {tokenizedProperty.name}
              </p>
              <p>
                <strong>Location:</strong> {tokenizedProperty.location}
              </p>
              <p>
                <strong>Total Tokens:</strong> {tokenizedProperty.totalTokens}
              </p>
              <p>
                <strong>Token Price:</strong> {tokenizedProperty.tokenPrice} ETH
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  window.location.href = `/properties/1`; // Navigate to the details page (replace with dynamic ID)
                }}
              >
                View Property
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  window.location.href = "/properties";
                }}
              >
                Go to Properties
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Tokenize;
