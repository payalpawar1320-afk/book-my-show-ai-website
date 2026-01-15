import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Loader2, Check, Building2 } from "lucide-react";

type PaymentMethod = "credit_card" | "debit_card" | "upi";

interface PaymentMethodsProps {
  totalAmount: number;
  isProcessing: boolean;
  onPayment: () => Promise<void>;
  onBack: () => void;
}

const PaymentMethods = ({
  totalAmount,
  isProcessing,
  onPayment,
  onBack,
}: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const isCardFormValid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    cardExpiry.length === 5 &&
    cardCvv.length === 3 &&
    cardName.length > 0;

  const isUpiValid = upiId.includes("@") && upiId.length > 3;

  const canProceed =
    (paymentMethod === "upi" && isUpiValid) ||
    ((paymentMethod === "credit_card" || paymentMethod === "debit_card") && isCardFormValid);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Payment Method</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          className="grid gap-3"
        >
          {/* UPI Option */}
          <div
            className={cn(
              "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
              paymentMethod === "upi"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setPaymentMethod("upi")}
          >
            <RadioGroupItem value="upi" id="upi" />
            <Label
              htmlFor="upi"
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">UPI</p>
                <p className="text-xs text-muted-foreground">
                  Pay using any UPI app
                </p>
              </div>
            </Label>
          </div>

          {/* Credit Card Option */}
          <div
            className={cn(
              "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
              paymentMethod === "credit_card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setPaymentMethod("credit_card")}
          >
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label
              htmlFor="credit_card"
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Credit Card</p>
                <p className="text-xs text-muted-foreground">
                  Visa, Mastercard, Amex
                </p>
              </div>
            </Label>
          </div>

          {/* Debit Card Option */}
          <div
            className={cn(
              "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
              paymentMethod === "debit_card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setPaymentMethod("debit_card")}
          >
            <RadioGroupItem value="debit_card" id="debit_card" />
            <Label
              htmlFor="debit_card"
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Debit Card</p>
                <p className="text-xs text-muted-foreground">
                  All major bank cards
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Payment Form */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {paymentMethod === "upi" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi_id">Enter UPI ID</Label>
              <Input
                id="upi_id"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Example: 9876543210@paytm, name@okicici
              </p>
            </div>
          </div>
        )}

        {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card_name">Cardholder Name</Label>
              <Input
                id="card_name"
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                maxLength={19}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card_expiry">Expiry Date</Label>
                <Input
                  id="card_expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  maxLength={5}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_cvv">CVV</Label>
                <Input
                  id="card_cvv"
                  placeholder="123"
                  type="password"
                  value={cardCvv}
                  maxLength={3}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total Amount */}
      <div className="rounded-lg bg-primary/10 p-4 flex justify-between items-center">
        <span className="font-medium">Amount to Pay</span>
        <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
      </div>

      {/* Demo Notice */}
      <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
        🔒 This is a demo payment. No real transaction will occur.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isProcessing}>
          Back
        </Button>
        <Button
          onClick={onPayment}
          className="flex-1"
          size="lg"
          disabled={!canProceed || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Pay ₹{totalAmount}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethods;
