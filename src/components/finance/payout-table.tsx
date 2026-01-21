"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Check, X, Loader2, UploadCloud } from "lucide-react";
import { approvePayout, rejectPayout } from "@/lib/finance-actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PayoutTableProps {
    payouts: any[]; // Using any for brevity with prisma types, ideally Typed
    isAdmin?: boolean;
}

export function PayoutTable({ payouts, isAdmin = false }: PayoutTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                    {isAdmin ? "Manage withdrawal requests." : "Status of your withdrawal requests."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            {isAdmin && <TableHead>User</TableHead>}
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Bank Details</TableHead>
                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 6 : 4} className="text-center py-8 text-muted-foreground">
                                    No payout records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout) => (
                                <PayoutRow key={payout.id} payout={payout} isAdmin={isAdmin} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function PayoutRow({ payout, isAdmin }: { payout: any; isAdmin: boolean }) {
    const [loading, setLoading] = useState(false);
    const [actionDialog, setActionDialog] = useState<"APPROVE" | "REJECT" | null>(null);
    const [proofUrl, setProofUrl] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    const handleAction = async () => {
        setLoading(true);
        try {
            if (actionDialog === "APPROVE") {
                await approvePayout(payout.id, proofUrl);
                toast.success("Payout marked as PAID");
            } else if (actionDialog === "REJECT") {
                await rejectPayout(payout.id, rejectReason);
                toast.success("Payout REJECTED");
            }
            setActionDialog(null);
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TableRow>
            <TableCell>{formatDate(payout.createdAt)}</TableCell>
            {isAdmin && (
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{payout.user?.name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{payout.user?.email}</span>
                        {payout.user?.role && <Badge variant="outline" className="w-fit text-[10px] mt-1">{payout.user.role}</Badge>}
                    </div>
                </TableCell>
            )}
            <TableCell className="font-medium">Rp {payout.amount.toLocaleString()}</TableCell>
            <TableCell>
                <Badge
                    variant={
                        payout.status === "PAID"
                            ? "default" // "success" if defined, else default/secondary
                            : payout.status === "REJECTED"
                                ? "destructive"
                                : "secondary" // PENDING
                    }
                    className={payout.status === "PAID" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                    {payout.status}
                </Badge>
                {payout.proof && (
                    <a href={payout.proof} target="_blank" rel="noopener noreferrer" className="block text-xs mt-1 text-blue-500 hover:underline">
                        View Proof
                    </a>
                )}
                {payout.status === "REJECTED" && payout.notes && (
                    <p className="text-xs text-red-500 mt-1">{payout.notes}</p>
                )}
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={payout.bankDetails || ""}>
                {payout.bankDetails}
            </TableCell>
            {isAdmin && (
                <TableCell className="text-right">
                    {payout.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600" onClick={() => setActionDialog("APPROVE")}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => setActionDialog("REJECT")}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Approve Dialog */}
                    <Dialog open={actionDialog === "APPROVE"} onOpenChange={(v) => !v && setActionDialog(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Payment</DialogTitle>
                                <DialogDescription>
                                    Upload proof of transfer to mark this as PAID.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <Label>Proof URL (Optional)</Label>
                                <Input
                                    placeholder="https://..."
                                    value={proofUrl}
                                    onChange={(e) => setProofUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Currently using URL input. Use a valid image link.</p>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setActionDialog(null)} disabled={loading}>Cancel</Button>
                                <Button onClick={handleAction} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Paid
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reject Dialog */}
                    <Dialog open={actionDialog === "REJECT"} onOpenChange={(v) => !v && setActionDialog(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Payout</DialogTitle>
                                <DialogDescription>
                                    Provide a reason for rejection.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>Reason</Label>
                                <Input
                                    placeholder="Incorrect bank details..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setActionDialog(null)} disabled={loading}>Cancel</Button>
                                <Button onClick={handleAction} disabled={loading} variant="destructive">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Reject
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TableCell>
            )}
        </TableRow>
    );
}
