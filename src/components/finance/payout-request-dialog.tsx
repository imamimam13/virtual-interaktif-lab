"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { requestPayout } from "@/lib/finance-actions";
import { Loader2, DollarSign } from "lucide-react";

interface PayoutRequestDialogProps {
    availableBalance: number;
}

export function PayoutRequestDialog({ availableBalance }: PayoutRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<number | "">("");
    const [bankDetails, setBankDetails] = useState("");

    const handleRequest = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (Number(amount) > availableBalance) {
            toast.error("Insufficient balance");
            return;
        }
        if (!bankDetails.trim()) {
            toast.error("Please provide bank details");
            return;
        }

        setLoading(true);
        try {
            const res = await requestPayout(Number(amount), bankDetails);
            if (res.message.includes("success")) {
                toast.success(res.message);
                setOpen(false);
                setAmount("");
                setBankDetails("");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <DollarSign className="mr-2 h-4 w-4" /> Request Payout
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                    <DialogDescription>
                        Withdraw your earnings. The process may take 1-3 business days.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="available" className="text-right">
                            Balance
                        </Label>
                        <div className="col-span-3 font-semibold text-green-600">
                            Rp {availableBalance.toLocaleString()}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount (Rp)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="col-span-3"
                            placeholder="Enter amount..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="bank" className="text-right pt-2">
                            Bank Details
                        </Label>
                        <Textarea
                            id="bank"
                            value={bankDetails}
                            onChange={(e) => setBankDetails(e.target.value)}
                            className="col-span-3"
                            placeholder="Bank Name, Account Number, Account Name"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleRequest} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
