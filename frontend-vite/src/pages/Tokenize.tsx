import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
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

const Tokenize = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({});

  const { toast } = useToast(); 
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [localLoading, setLocalLoading] = useState(false);
  //const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  //const [imageUrls, setImageUrls] = useState<string[]>([]);
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

  
  // const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files) {
  //     setSelectedFiles(Array.from(event.target.files));
  //   }
  // };
  
  // const uploadToIPFS = async () => {
  //   if (selectedFiles.length === 0) {
  //     toast({
  //       title: "Please select a file",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   try {
  //     const uploadedUrls: string[] = [];

  //     for (const file of selectedFiles) {
  //       const upload = await pinata.upload.file(file);
  //       console.log("Uploaded:", upload);
  //       const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);
  //       uploadedUrls.push(ipfsUrl);
  //     }

  //     setImageUrls(uploadedUrls);
  //   } 
  //   catch (error) {
  //     console.error("IPFS Upload Error:", error);
  //   }
  // };

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyName = formData.get("propertyName") as string;
    const location = formData.get("location") as string;
    const images = formData.get("images") as string;
    const totalTokens = formData.get("totalTokens") as string;
    const tokenPrice = formData.get("tokenPrice") as string;

    // !images
    if (!propertyName || !location || !totalTokens || !tokenPrice) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

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

    const totalTokensBigInt = BigInt(totalTokensNumber);
    const tokenPriceBigInt = BigInt(Math.floor(tokenPriceNumber * 1e18));

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before tokenizing your property.",
        variant: "destructive",
      });
      return;
    }

    // if (imageUrls.length === 0) {
    //   toast({
    //     title: "Please upload an image before tokenizing",
    //     variant: "destructive",
    //   });
    //   return;
    // }

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
      }); //images,

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
      console.error("Caught error:", error);

      if (error instanceof Error) {
        console.log("Error message:", error.message);

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
                <Label htmlFor="location">Images</Label>
                <Input
                  id="location"
                  name="images"
                  placeholder="Provide a detailed description of the property"
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
                {/* <div className="space-y-2">
                  <Label htmlFor="images">Upload Property Images</Label>
                  <Input
                    type="file"
                    multiple
                    id="images"
                    name="images"
                    onChange={changeHandler}
                    className="h-20"
                  />
                  <Button onClick={uploadToIPFS} className=" bg-sage-600 hover:bg-sage-700">
                    Upload Image
                  </Button>
                  {imageUrls.length > 0 && (
                      <div className="mt-2">
                      <p>Images Uploaded:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {imageUrls.map((url, index) => (
                          <img key={index} src={url} alt={`Property ${index}`} className="w-32 h-32 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}

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
                 //navigate(`/marketplace/${property.propertyId}`); // Navigate to the details page (replace with dynamic ID)
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
