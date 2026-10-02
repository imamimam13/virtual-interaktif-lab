import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FlaskConical, Activity, Plus, BookOpen } from "lucide-react";
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
    const totalSystemLabs = await prisma.lab.count();

    // --- LECTURER VIEW ---
    if (isLecturer) {
        const instructorName = user.name || user.email;

        // Count my labs (matching name or email)
        const myLabsVal = await prisma.lab.count({
            where: {
                OR: [
                    { instructor: instructorName },
                    { instructor: user.name || undefined },
                    { instructor: user.email },
                ].filter(Boolean) as any
            }
        });

        // Count enrollments in my labs
        const myEnrollments = await prisma.enrollment.count({
            where: {
                lab: {
                    OR: [
                        { instructor: instructorName },
                        { instructor: user.name || undefined },
                        { instructor: user.email },
                    ].filter(Boolean) as any
                }
            }
        });

        // Calculate Revenue (Instructor Share)
        const paidEnrollments: any[] = await prisma.enrollment.findMany({
            where: {
                paymentStatus: "PAID",
                lab: {
                    OR: [
                        { instructor: instructorName },
                        { instructor: user.name || undefined },
                        { instructor: user.email },
                    ].filter(Boolean) as any
                }
            } as any,
            select: { instructorShare: true }
        });
        const myRevenue = paidEnrollments.reduce((acc, curr) => acc + (curr.instructorShare || 0), 0);

        // Fetch My Recent Labs (or all recent labs if none created yet)
        let displayLabs = await prisma.lab.findMany({
            where: {
                OR: [
                    { instructor: instructorName },
                    { instructor: user.name || undefined },
                    { instructor: user.email },
                ].filter(Boolean) as any
            },
            take: 6,
            orderBy: { createdAt: "desc" },
            include: {
                department: true,
                _count: { select: { modules: true } }
            }
        });

        const isShowingAllCampusLabs = displayLabs.length === 0;
        if (isShowingAllCampusLabs) {
            displayLabs = await prisma.lab.findMany({
                take: 6,
                orderBy: { createdAt: "desc" },
                include: {
                    department: true,
                    _count: { select: { modules: true } }
                }
            });
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dosen Dashboard</h2>
                        <p className="text-muted-foreground">Selamat datang, {user.name || user.email}. Kelola praktikum dan materi lab Anda.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/labs">
                            <Button variant="outline">
                                <BookOpen className="mr-2 h-4 w-4" /> Kelola Semua Lab ({totalSystemLabs})
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
                            <CardTitle className="text-sm font-medium">Kelas / Lab Saya</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myLabsVal}</div>
                            <p className="text-xs text-muted-foreground">Dari total {totalSystemLabs} lab di kampus</p>
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

                {/* Recent Labs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{isShowingAllCampusLabs ? "Daftar Laboratorium Kampus" : "Kelas / Lab Saya"}</CardTitle>
                            <CardDescription>
                                {isShowingAllCampusLabs
                                    ? "Berikut laboratorium yang ada di sistem kampus. Anda dapat mengedit materi atau membuat lab baru."
                                    : "Daftar laboratorium praktikum yang Anda kelola."}
                            </CardDescription>
                        </div>
                        <Link href="/admin/labs">
                            <Button variant="ghost" size="sm">Lihat Semua →</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {displayLabs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">Belum ada laboratorium yang dibuat.</p>
                            ) : (
                                displayLabs.map((lab: any) => (
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

    // --- ADMIN VIEW (Default) ---
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
                    <p className="text-muted-foreground">Monitor statistik platform dan kelola laboratorium virtual.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/labs">
                        <Button variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" /> Kelola Lab ({labCount})
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
                        <CardTitle>Laboratorium Terbaru</CardTitle>
                        <CardDescription>Daftar lab yang baru saja ditambahkan atau diperbarui.</CardDescription>
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
                                        <Button variant="outline" size="sm">Kelola Materi</Button>
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
