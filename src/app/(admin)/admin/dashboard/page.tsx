import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FlaskConical, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/login");

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) redirect("/auth/login");

    const isLecturer = user.role === "LECTURER";

    // --- LECTURER VIEW (Strict Isolation: Only Own Labs) ---
    if (isLecturer) {
        const lecturerFilter = {
            OR: [
                ...(user.name ? [{ instructor: user.name }] : []),
                ...(user.email ? [{ instructor: user.email }] : []),
            ]
        };

        // Count only my labs
        const myLabsVal = await prisma.lab.count({
            where: lecturerFilter
        });

        // Count enrollments in only my labs
        const myEnrollments = await prisma.enrollment.count({
            where: {
                lab: lecturerFilter
            }
        });

        // Calculate Revenue (Instructor Share from my labs)
        const paidEnrollments: any[] = await prisma.enrollment.findMany({
            where: {
                paymentStatus: "PAID",
                lab: lecturerFilter
            } as any,
            select: { instructorShare: true }
        });
        const myRevenue = paidEnrollments.reduce((acc, curr) => acc + (curr.instructorShare || 0), 0);

        // Fetch My Recent Labs (strictly only my labs)
        const myLabs = await prisma.lab.findMany({
            where: lecturerFilter,
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                department: true,
                _count: { select: { modules: true } }
            }
        });

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dosen Dashboard</h2>
                        <p className="text-muted-foreground">Selamat datang, {user.name || user.email}. Kelola kelas praktikum Anda.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/labs/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Buat Lab Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kelas / Lab Saya</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myLabsVal}</div>
                            <p className="text-xs text-muted-foreground">Lab aktif yang Anda ampu</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mahasiswa Terdaftar</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myEnrollments}</div>
                            <p className="text-xs text-muted-foreground">Terdaftar di kelas praktikum Anda</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan Saya</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {myRevenue.toLocaleString("id-ID")}</div>
                            <p className="text-xs text-muted-foreground">Total bagi hasil (Paid Labs)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* My Recent Labs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Kelas / Lab Saya</CardTitle>
                            <CardDescription>
                                Daftar laboratorium praktikum yang Anda kelola.
                            </CardDescription>
                        </div>
                        <Link href="/admin/labs">
                            <Button variant="ghost" size="sm">Lihat Semua →</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myLabs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-gray-50/50 dark:bg-zinc-900/50 rounded-lg border border-dashed">
                                    <FlaskConical className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm font-medium text-foreground">Anda belum memiliki kelas / laboratorium.</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                                        Klik tombol di bawah untuk mulai membuat modul praktikum pertama Anda.
                                    </p>
                                    <Link href="/admin/labs/create">
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" /> Buat Lab Baru
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                myLabs.map((lab: any) => (
                                    <div key={lab.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                                                🧪
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{lab.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {lab.department?.name || "Independen"} • {lab._count.modules} Modul
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/labs/${lab.id}/modules`}>
                                                <Button variant="outline" size="sm">Kelola Materi</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- ADMIN VIEW (Superadmin sees all) ---
    const userCount = await prisma.user.count();
    const labCount = await prisma.lab.count();
    const departmentCount = await prisma.department.count();

    const recentLabs = await prisma.lab.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
            department: true,
            _count: {
                select: { modules: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Monitor platform statistics and manage all virtual labs.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/labs">
                        <Button variant="outline">
                            Kelola Semua Lab ({labCount})
                        </Button>
                    </Link>
                    <Link href="/admin/labs/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Buat Lab Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lab Aktif</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{labCount}</div>
                        <p className="text-xs text-muted-foreground">Di {departmentCount} Program Studi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Integrasi</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">Online</div>
                        <p className="text-xs text-muted-foreground">SIAKAD SSO & REST API Aktif</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Labs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Laboratorium Terbaru (Semua Dosen)</CardTitle>
                        <CardDescription>Daftar seluruh lab kampus yang baru saja ditambahkan.</CardDescription>
                    </div>
                    <Link href="/admin/labs">
                        <Button variant="ghost" size="sm">Lihat Semua →</Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentLabs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">Belum ada laboratorium.</p>
                        ) : (
                            recentLabs.map((lab: any) => (
                                <div key={lab.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                                            🧪
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{lab.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {lab.department?.name || "Independen"} • {lab._count.modules} Modul • Dosen: <b>{lab.instructor || "Umum"}</b>
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/labs/${lab.id}/modules`}>
                                        <Button variant="outline" size="sm">Manage Modules</Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
