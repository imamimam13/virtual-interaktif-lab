import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, Building2, GraduationCap } from "lucide-react";

export default async function RevenuePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/login");

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) redirect("/auth/login");

    const isLecturer = currentUser.role === "LECTURER";

    // Build Query
    const whereCondition: any = {
        paymentStatus: "PAID",
        ...(isLecturer ? { lab: { instructor: currentUser.name } } : {})
        // Note: Ideally filter by 'lab.instructorId' if we had it linked to User, 
        // but current schema uses string 'instructor'. 
        // If we can't reliably link, we might show all for now or filter by 'lab.enrollments' where instructor matches?
        // Let's rely on 'lab.instructor' matching User.name for this MVP if strict relation doesn't exist.
        // Wait, schema has `instructor String?`. It's not a FK. 
    };

    // FETCH ALL PAID to calculate safely
    // Casting to any to avoid stale type errors during dev
    const allPaidEnrollments: any[] = await prisma.enrollment.findMany({
        where: whereCondition,
        include: { lab: true, user: true },
        orderBy: { joinedAt: "desc" }
    });

    let filteredEnrollments = allPaidEnrollments;

    if (isLecturer) {
        // Filter by instructor name strictly
        filteredEnrollments = allPaidEnrollments.filter(e => e.lab.instructor === currentUser.name);
    }

    // Calculate Stats
    const totalGross = filteredEnrollments.reduce((acc, curr) => acc + (curr.lab.price || 0), 0);
    const totalInstructor = filteredEnrollments.reduce((acc, curr) => acc + (curr.instructorShare || 0), 0);
    const totalPlatform = filteredEnrollments.reduce((acc, curr) => acc + (curr.platformShare || 0), 0);
    const totalLPPM = filteredEnrollments.reduce((acc, curr) => acc + (curr.lppmShare || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Revenue & Pendapatan</h1>
                <p className="text-muted-foreground">
                    {isLecturer ? "Laporan pendapatan dari kelas Anda." : "Overview seluruh pendapatan platform."}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gross Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {totalGross.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Omzet kotor dari pendaftaran.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Instructor Share (Dosen)</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {totalInstructor.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total hak dosen (50% avg).</p>
                    </CardContent>
                </Card>

                {!isLecturer && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Platform Share</CardTitle>
                                <Wallet className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalPlatform.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Pendapatan bersih platform.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">LPPM Share</CardTitle>
                                <Building2 className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalLPPM.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Dana pengembangan LPPM.</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Transaction List */}
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
                                            <Badge variant="outline" className="border-green-500 text-green-500">PAID</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
