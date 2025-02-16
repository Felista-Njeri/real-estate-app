import { useState } from "react";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Buy = () => {
  const [amount, setAmount] = useState("");
//   const { toast } = useToast();

  const handleBuy = () => {
    // Here you would integrate with your smart contract
    // toast({
    //   title: "Purchase Initiated",
    //   description: `Processing purchase of ${amount} tokens...`,
    // });
  };

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gradient text-center">
          Purchase Tokens
        </h1>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Token Purchase</CardTitle>
            <CardDescription>
              Enter the amount of tokens you wish to purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                  <span>0.1 ETH</span>
                </div>
                <div className="border-t border-sage-200 mt-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{amount ? Number(amount) * 0.1 : "0"} ETH</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBuy}
                className="w-full bg-sage-600 hover:bg-sage-700"
                disabled={!amount}
              >
                Confirm Purchase
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Buy;