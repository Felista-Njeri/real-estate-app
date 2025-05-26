import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContract } from '@wagmi/core'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadFileToPinata, uploadMetadataToPinata } from "../utils/pinata";
import { wagmiconfig } from "../../wagmiconfig";

const Tokenize = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({});

  const { toast } = useToast(); 
  const navigate = useNavigate();

  const [tokenPriceCalc, setTokenPriceCalc] = useState(0)
  const [totalTokensCalc, setTotalTokensCalc] = useState(0)
  const [newPropertyId, setNewPropertyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tokenizedProperty, setTokenizedProperty] = useState<{
    name: string;
    location: string;
    images: string;
    totalTokens: string;
    tokenPrice: string;
  } | null>(null);

  const receipt = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Watch for transaction success using useEffect
  useEffect(() => {
    //console.log("Transaction Hash:", transactionHash);
    //console.log("Transaction Success:", receipt.isSuccess);

    if (receipt.isSuccess) {
      setIsModalOpen(true);
    }
  }, [receipt.isSuccess, transactionHash]); // Only runs when isSuccess changes to true

  
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };
  
  const uploadToIPFS = async () => {
    setIsUploading(true)
    if (selectedFiles.length === 0) {
      toast({
        title: "Please select a file",
        variant: "destructive",
      });
      return;
    }
    try {
      // Use Promise.all to upload all images concurrently
      const uploadPromises = selectedFiles.map(async (file) => {
        return await uploadFileToPinata(file); // map returns the URL directly
      });

      const uploadedUrls = await Promise.all(uploadPromises); // wait for all to finish

      console.log("Uploaded Image URLs:", uploadedUrls); // safe and ordered
  
      setImageUrls(uploadedUrls);

      toast({
        title: "Images uploaded to IPFS",
        description: `${uploadedUrls.length} image(s) uploaded.`,
        className: "bg-green-500",
      });
    } 
    catch (error) {
      console.error("IPFS Upload Error:", error);
      toast({
        title: "Upload Failed",
        description: "Error uploading images to IPFS.",
        variant: "destructive",
      });
    } finally{
      setIsUploading(false)
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyName = formData.get("propertyName") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const totalTokens = formData.get("totalTokens") as string;
    const tokenPrice = formData.get("tokenPrice") as string;

    if (!propertyName || !location || !totalTokens || !tokenPrice) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const totalTokensNumber = Number(totalTokens);
    const tokenPriceNumber = (Number(tokenPrice)) / 130;

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

    const totalTokensBigInt = BigInt(totalTokensNumber);
    const tokenPriceBigInt = BigInt(Math.floor((tokenPriceNumber / 2000) * 1e18));

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before tokenizing your property.",
        variant: "destructive",
      });
      return;
    }

    if (imageUrls.length === 0) {
      toast({
        title: "Please upload an image before tokenizing",
        variant: "destructive",
      });
      return;
    }

    setLocalLoading(true); 

    try {
      const images = imageUrls.join(",");

      const metadata = {
        propertyName: propertyName,
        location: location,
        description: description,
        images: images,
      };
      const metadatacid = await uploadMetadataToPinata(metadata);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "tokenizeProperty",
        args: [
          metadatacid,
          propertyName,
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
        });
      }

      toast({
        title: "Property Submitted for Tokenization",
        description: "Your tokenization request is being processed.",
        className: "bg-green-500",
      });
    } catch (error: unknown) {

      if (error instanceof Error) {
        if (error.message.includes("User rejected the request")) {
          toast({
            title: "Transaction Rejected",
            description: "You rejected the transaction. Please try again if you'd like to proceed.",
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
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    const fetchLatestPropertyId = async () => {
      try {
        const latestPropertyId = await readContract( wagmiconfig, {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getLatestPropertyId',
        });
        setNewPropertyId(Number(latestPropertyId));
      } catch (error) {
        console.error("Failed to fetch latest property ID:", error);
        toast({
          title: "Navigation Failed",
          description: "Could not retrieve the new property ID.",
          variant: "destructive",
        });
      }
    };
  
    if (receipt.isSuccess) {
      setIsModalOpen(true);
      fetchLatestPropertyId();
    }
  }, [receipt.isSuccess]);
  
  return (
    <>
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Provide a detailed description of the property"
                />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Upload Property Images</Label>
                  <Input
                    type="file"
                    multiple
                    id="images"
                    name="images"
                    onChange={changeHandler}
                    className="h-20"
                  />
                  <Button 
                    onClick={uploadToIPFS} 
                    className=" bg-sage-600 hover:bg-sage-700"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                        <>
                          Uploading...
                          <span className="loading loading-spinner loading-sm ml-2"></span>
                        </>
                      ) : ( 
                      "Upload Images" 
                    )}
                  </Button>
                  
                  {imageUrls.length > 0 && (
                      <div className="mt-2">
                      <p>Images Uploaded:</p>
                      <div className="grid grid-cols-3 gap-1">
                        {imageUrls.map((url, index) => (
                          <img
                           key={index}
                           src={url} 
                           alt={`Property ${index}`} 
                           className="w-32 h-32 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalTokens">Total Tokens</Label>
                    <Input
                      id="totalTokens"
                      name="totalTokens"
                      type="number"
                      placeholder="Number of tokens"
                       onChange={(e) => setTotalTokensCalc(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenPrice">Price per Token (KES)</Label>
                    <Input
                      id="tokenPrice"
                      name="tokenPrice"
                      type="number"
                      step="1000"
                      placeholder="5000"
                      onChange={(e) => setTokenPriceCalc(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <span className="font-semibold">Property Value: {(totalTokensCalc * tokenPriceCalc).toLocaleString()} KES</span>
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
                <strong>Images Uploaded:</strong>
              </p>
              <div className="grid grid-cols-3 gap-2">
                 {imageUrls.map((url, index) => (
                   <img
                    key={index}
                    src={url} 
                    alt={`Property ${index}`} 
                    className="w-32 h-32 object-cover rounded" />
                  ))}
              </div>
              <p>
                <strong>Location:</strong> {tokenizedProperty.location}
              </p>
              <p>
                <strong>Total Tokens:</strong> {tokenizedProperty.totalTokens}
              </p>
              <p>
                <strong>Token Price:</strong> {tokenizedProperty.tokenPrice} KES
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                 setIsModalOpen(false);
                 navigate(`/marketplace/${newPropertyId}`); 
                }}
              >
                View Property
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(`/marketplace`);
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
