import { useState } from "react";
import { useNavigate } from "react-router";
import { useWriteContract } from "wagmi";
import { useAccount} from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BuyModalProps {
  propertyId: number;
  tokenPrice: bigint;
  isOpen: boolean;
  onClose: () => void;
}

const BuyModal = ({ propertyId, tokenPrice, isOpen, onClose }: BuyModalProps) => {
  
  const { address } = useAccount();

  const [amount, setAmount] = useState<number>(1);
  const [localLoading, setLocalLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const totalCost = Number(tokenPrice) * amount / 1e18; // Convert to ETH

  const { writeContractAsync, isSuccess } = useWriteContract({});

  const handleBuy = async () => {
    
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
    
    try{
      await writeContractAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "purchaseTokens",
        args: [propertyId, amount],
        value: BigInt(totalCost * 1e18), // Send ETH equivalent to contract
      });
      toast({
        title: "Success",
        description: "Please sign the transaction to confirm the purchase",
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
    }finally {
      setLocalLoading(false); // Stop loading regardless of success or failure
    }
    };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
      <DialogHeader>
              <DialogTitle>Purchase Tokens</DialogTitle>
              <DialogDescription>Please enter the amount of tokens you want to purchase</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Token Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="bg-sage-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Purchase Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>{amount || "0"} tokens</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Price per token:</span>
                  <span>{Number(tokenPrice) / 1e18} ETH</span>
                </div>
                <div className="border-t border-sage-200 mt-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{amount ? (Number(tokenPrice) * amount) / 1e18 : "0"} ETH</span>
                  </div>
                </div>
              </div>
            </div>
      <DialogFooter>
      {!isSuccess ? (
    <Button
      type="submit"
      onClick={handleBuy}
      className="w-full bg-sage-600 hover:bg-sage-700"
      disabled={localLoading}
    >
      {localLoading ? (
        <>
          Processing...
          <span className="loading loading-spinner loading-sm"></span>
        </>
      ) : (
        "Confirm Purchase"
      )}
    </Button>
  ) : (
    <Button 
      className="w-full bg-sage-600 hover:bg-sage-700"
      onClick={() => navigate(`/portfolio`)}
    >
      My Portfolio
    </Button>
  )}

        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default BuyModal;