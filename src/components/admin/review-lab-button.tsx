"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
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
import { approveLab, rejectLab } from "@/lib/admin-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewLabButtonProps {
    lab: {
        id: string;
        title: string;
        price: number;
        requestedPrice: number;
        feePercentage: number;
        lppmFeePercentage: number;
        instructor: string | null;
    };
}

export default function ReviewLabButton({ lab }: ReviewLabButtonProps) {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(lab.requestedPrice);
    const [fee, setFee] = useState(lab.feePercentage);
    const [lppmFee, setLppmFee] = useState(lab.lppmFeePercentage);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const res = await approveLab(lab.id, price, fee, lppmFee);
            if (res.message.includes("success")) {
                toast.success("Lab approved successfully");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to approve");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this price request? The lab will remain Free.")) return;
        setIsLoading(true);
        try {
            const res = await rejectLab(lab.id);
            if (res.message.includes("rejected")) {
                toast.success("Request rejected");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to reject");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Pricing
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Paid Lab Request</DialogTitle>
                    <DialogDescription>
                        Dosen <strong>{lab.instructor}</strong> mengajukan harga untuk lab <strong>{lab.title}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                        <p className="font-semibold">Requested Price: Rp {lab.requestedPrice.toLocaleString()}</p>
                        <p className="opacity-80">Current Status: Free</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Harga Final (Rp)</Label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Fee Dosen (%)</Label>
                            <Input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Fee LPPM (%)</Label>
                            <Input
                                type="number"
                                value={lppmFee}
                                onChange={(e) => setLppmFee(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="col-span-full">
                        <p className="text-xs text-muted-foreground italic">
                            * Platform Fee (Admin) = {100 - fee - lppmFee}%
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 justify-between sm:justify-between">
                    <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak (Set Free)
                    </Button>
                    <Button onClick={handleApprove} disabled={isLoading}>
                        {isLoading ? "Processing..." : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve & Publish
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
