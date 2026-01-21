import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import VerifyButton from "@/app/(admin)/admin/enrollments/verify-button"; // Client component for actions

export default async function EnrollmentsPage() {
    // Cast to any to bypass stale Prisma types
    const enrollments: any[] = await prisma.enrollment.findMany({
        where: {
            paymentStatus: {
                in: ["PENDING", "PAID"] // Show pending and paid history
            }
        } as any,
        include: {
            user: true,
            lab: true
        },
        orderBy: {
            joinedAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Verifikasi Pendaftaran</h1>
                <p className="text-muted-foreground">Kelola pendaftaran dan pembayaran lab.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pendaftaran</CardTitle>
                    <CardDescription>Menampilkan semua pendaftaran yang membutuhkan verifikasi atau histori pembayaran.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mahasiswa</TableHead>
                                <TableHead>Lab</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Biaya</TableHead>
                                <TableHead>Status Pembayaran</TableHead>
                                <TableHead>Bukti</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">Tidak ada data.</TableCell>
                                </TableRow>
                            ) : (
                                enrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>
                                            <div className="font-medium">{enrollment.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{enrollment.user.email}</div>
                                        </TableCell>
                                        <TableCell>{enrollment.lab.title}</TableCell>
                                        <TableCell>{formatDate(enrollment.joinedAt)}</TableCell>
                                        <TableCell>Rp {enrollment.lab.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={enrollment.paymentStatus === "PAID" ? "default" : enrollment.paymentStatus === "PENDING" ? "secondary" : "destructive"}>
                                                {enrollment.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {enrollment.paymentProof ? (
                                                <a href={enrollment.paymentProof.startsWith("data:") ? "#" : enrollment.paymentProof} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">
                                                    Lihat Bukti
                                                </a>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {enrollment.paymentStatus === "PENDING" && (
                                                <VerifyButton enrollmentId={enrollment.id} />
                                            )}
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
