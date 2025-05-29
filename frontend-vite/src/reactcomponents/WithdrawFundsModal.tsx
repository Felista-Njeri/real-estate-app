import { useState } from "react";
import { useWriteContract } from "wagmi";
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

interface WithdrawFundsModalModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawFundsModal = ({ propertyId, isOpen, onClose }: WithdrawFundsModalModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [localLoading, setLocalLoading] = useState(false);

  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of KES to withdraw.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLocalLoading(true);

      const amountInWei = BigInt((amount / (130 * 2000)) * 1e18 );

      await writeContractAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "withdrawFunds",
        args: [propertyId, amountInWei],
      });

      toast({
        title: "Success",
        description: `You have successfully withdrawn ${amount.toLocaleString('en-KE')} KES for this property.`,
        className: "bg-green-500",
      });

      onClose();
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
          description: "Failed to withdraw funds. Please try again.",
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
      setAmount(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Withdraw Funds for this Property</DialogTitle>
          <DialogDescription>
            Enter the amount of KES you want to withdraw for this property.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleWithdraw}
            className="w-full bg-sage-600 hover:bg-sage-700"
            disabled={localLoading}
          >
            {localLoading ? (
              <>
                Processing...
                <span className="loading loading-spinner loading-sm"></span>
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawFundsModal;