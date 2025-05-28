import { useState } from "react";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../abi/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from '@/types/index'; 

interface ClaimDividendsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ClaimDividendsModal = ({ propertyId, isOpen, onClose }: ClaimDividendsModalProps) => {
  const { address } = useAccount();
  const [localLoading, setLocalLoading] = useState(false);

  const { toast } = useToast();

  const { writeContractAsync, isSuccess } = useWriteContract({});

  // Fetch investor's token balance
  const { data: investorBalance } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "investorBalances",
    args: [BigInt(propertyId), address],
  });

  // Fetch total dividends for the property
  const { data } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getProperty",
    args: [BigInt(propertyId)],
  }) as { data: Property };

  const totalDividends = data?.totalDividends
  const totalTokens = data?.totalTokens

  // Fetch claimed dividends by the investor
  const { data: claimedDividends } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "claimedDividends",
    args: [BigInt(propertyId), address],
  });

  // Calculate unclaimed dividends
  const dividendShare = (Number(investorBalance) * Number(totalDividends)) / Number(totalTokens);
  const unclaimedDividends = dividendShare - Number(claimedDividends);

  const handleClaimDividends = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim dividends.",
        variant: "destructive",
      });
      return;
    }

    if (unclaimedDividends <= 0) {
      toast({
        title: "No Dividends to Claim",
        description: "You have no unclaimed dividends for this property.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLocalLoading(true);
      await writeContractAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "claimDividends",
        args: [BigInt(propertyId)],
      });
      toast({
        title: "Success",
        description: `You have successfully claimed ${(unclaimedDividends / 1e18 * 260000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } KES in dividends!`,
        className: "bg-green-500",
      });
    } catch (error: unknown) {
      console.error("Caught error:", error);

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
          description: "Failed to claim dividends. Please try again.",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Claim Dividends</DialogTitle>
          <DialogDescription>
            Claim your share of dividends for this property.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-sage-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Your Holdings:</span>
              <span>{(Number(investorBalance)).toLocaleString() || "0"} tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Dividends:</span>
              <span>{(Number(totalDividends) / 1e18 * 260000 || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Claimed Dividends:</span>
              <span>{(Number(claimedDividends) / 1e18 * 260000 || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES</span>
            </div>
            <div className="border-t border-sage-200 mt-2 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Unclaimed Dividends:</span>
                <span>{(unclaimedDividends / 1e18 * 260000 || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          {!isSuccess ? (
            <Button
              type="submit"
              onClick={handleClaimDividends}
              className="w-full bg-sage-600 hover:bg-sage-700"
              disabled={localLoading}
            >
              {localLoading ? (
                <>
                  Processing...
                  <span className="loading loading-spinner loading-sm"></span>
                </>
              ) : (
                "Claim Dividends"
              )}
            </Button>
          ) : (
            <Button
              className="w-full bg-sage-600 hover:bg-sage-700"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDividendsModal;