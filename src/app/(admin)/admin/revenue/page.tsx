import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, Building2, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayoutRequestDialog } from "@/components/finance/payout-request-dialog";
import { PayoutTable } from "@/components/finance/payout-table";

export default async function RevenuePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/login");

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) redirect("/auth/login");

    const isLecturer = currentUser.role === "LECTURER";
    const isAdmin = currentUser.role === "ADMIN";

    // --- 1. Fetch Revenue Data (Enrollments) ---
    const whereCondition: any = {
        paymentStatus: "PAID",
        ...(isLecturer && !isAdmin ? { lab: { instructor: currentUser.name } } : {}) // Only filter for lecturer if not admin
    };

    const allPaidEnrollments: any[] = await prisma.enrollment.findMany({
        where: whereCondition,
        include: { lab: true, user: true },
        orderBy: { joinedAt: "desc" }
    });

    let filteredEnrollments = allPaidEnrollments;
    // If it's a lecturer but not an admin, ensure the filter is applied.
    // If it's an admin (even if also a lecturer), they see all.
    // If it's a regular user (not lecturer, not admin), they shouldn't be here, but if they were, they'd see all.
    // The initial whereCondition already handles the primary filtering for lecturers.
    // This additional filter ensures strictness if the initial query was broader for some reason.
    if (isLecturer && !isAdmin) {
        filteredEnrollments = allPaidEnrollments.filter(e => e.lab.instructor === currentUser.name);
    }

    const totalGross = filteredEnrollments.reduce((acc, curr) => acc + (curr.lab.price || 0), 0);
    const totalInstructor = filteredEnrollments.reduce((acc, curr) => acc + (curr.instructorShare || 0), 0);
    const totalPlatform = filteredEnrollments.reduce((acc, curr) => acc + (curr.platformShare || 0), 0);
    const totalLPPM = filteredEnrollments.reduce((acc, curr) => acc + (curr.lppmShare || 0), 0);
    // ^ note: for lecturer view, totalLPPM/Platform might be irrelevent or 0 if query filters strictly. 
    // Actually for Lecturer, we only care about 'totalInstructor'.

    // --- 2. Fetch Payout Data ---
    const payoutWhere: any = {};
    if (isLecturer && !isAdmin) {
        payoutWhere.userId = currentUser.id;
    }

    const payouts = await prisma.payout.findMany({
        where: payoutWhere,
        include: { user: true },
        orderBy: { createdAt: "desc" }
    });

    // --- 3. Calculate Balances (For Lecturer) ---
    let availableBalance = 0;
    let totalWithdrawn = 0;

    if (isLecturer) {
        const myTotalEarnings = totalInstructor;
        // Consider only payouts for the current lecturer
        const myPayouts = payouts.filter((p: any) => p.userId === currentUser.id && p.status !== "REJECTED");
        const withdrawnSum = myPayouts.reduce((acc: number, curr: any) => acc + curr.amount, 0);

        availableBalance = myTotalEarnings - withdrawnSum;
        totalWithdrawn = withdrawnSum;
    }

    // For Admin: Calculate LPPM Pending/Withdrawn if we track it? 
    // Currently LPPM shares are just accumulated in 'totalLPPM'. We don't have Payouts for LPPM user specifically yet 
    // unless we create a specific 'LPPM' user. For now, just show the total LPPM accumulated.

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Finance & Revenue</h1>
                    <p className="text-muted-foreground">
                        {isLecturer ? "Kelola pendapatan dan penarikan dana." : "Overview pendapatan platform dan cashout."}
                    </p>
                </div>
                {isLecturer && (
                    <PayoutRequestDialog availableBalance={availableBalance} />
                )}
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Gross - Visible to Admin mostly, or total sales for Lecturer */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gross Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {totalGross.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total nilai transaksi.</p>
                    </CardContent>
                </Card>

                {isLecturer && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Earnings</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {totalInstructor.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total pendapatan anda.</p>
                        </CardContent>
                    </Card>
                )}

                {isLecturer && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">Rp {availableBalance.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Siap ditarik (dikurangi pending/paid).</p>
                        </CardContent>
                    </Card>
                )}

                {isAdmin && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Platform Net</CardTitle>
                                <Building2 className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalPlatform.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Pendapatan bersih platform.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">LPPM Share</CardTitle>
                                <GraduationCap className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalLPPM.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Hak LPPM (10%).</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Tabs defaultValue="payouts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payouts">Payout History</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="payouts" className="space-y-4">
                    <PayoutTable payouts={payouts} isAdmin={isAdmin} />
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histori Transaksi</CardTitle>
                            <CardDescription>Daftar mahasiswa yang telah membayar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead>Lab</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Total Bayar</TableHead>
                                        <TableHead>Dosen Share</TableHead>
                                        {!isLecturer && <TableHead>Platform Share</TableHead>}
                                        {!isLecturer && <TableHead>LPPM Share</TableHead>}
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEnrollments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isLecturer ? 6 : 8} className="text-center py-4">Belum ada data.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEnrollments.map((e) => (
                                            <TableRow key={e.id}>
                                                <TableCell>
                                                    <div className="font-medium">{e.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{e.user.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{e.lab.title}</div>
                                                </TableCell>
                                                <TableCell>{formatDate(e.joinedAt)}</TableCell>
                                                <TableCell>Rp {e.lab.price.toLocaleString()}</TableCell>
                                                <TableCell className="text-blue-600 font-medium">
                                                    Rp {(e.instructorShare || 0).toLocaleString()}
                                                </TableCell>
                                                {!isLecturer && (
                                                    <>
                                                        <TableCell className="text-purple-600">Rp {(e.platformShare || 0).toLocaleString()}</TableCell>
                                                        <TableCell className="text-orange-600">Rp {(e.lppmShare || 0).toLocaleString()}</TableCell>
                                                    </>
                                                )}
                                                <TableCell>
                                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">PAID</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

