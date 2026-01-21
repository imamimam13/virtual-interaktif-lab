import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FlaskConical, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/login");

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) redirect("/auth/login");

    const isLecturer = user.role === "LECTURER";

    // --- LECTURER VIEW ---
    if (isLecturer) {
        // Stats for Lecturer
        const myLabsVal = await prisma.lab.count({
            where: { instructor: user.name }
        });

        // Count enrollments in my labs
        const myEnrollments = await prisma.enrollment.count({
            where: {
                lab: { instructor: user.name } // Filtering by name as per current schema architecture
            }
        });

        // Calculate Revenue (Instructor Share)
        // Calculate Revenue (Instructor Share)
        // Need to fetch paid enrollments
        const paidEnrollments: any[] = await prisma.enrollment.findMany({
            where: {
                paymentStatus: "PAID",
                lab: { instructor: user.name }
            } as any,
            select: { instructorShare: true }
        });
        const myRevenue = paidEnrollments.reduce((acc, curr) => acc + (curr.instructorShare || 0), 0);

        // Fetch My Recent Labs
        const myRecentLabs = await prisma.lab.findMany({
            where: { instructor: user.name },
            take: 5,
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
                        <p className="text-muted-foreground">Selamat datang, {user.name}. Berikut ringkasan kelas Anda.</p>
                    </div>
                    <Link href="/admin/labs/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Buat Lab Baru
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kelas Saya</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myLabsVal}</div>
                            <p className="text-xs text-muted-foreground">Lab aktif dikelola</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myEnrollments}</div>
                            <p className="text-xs text-muted-foreground">Terdaftar di kelas Anda</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan Saya</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {myRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total bagi hasil (Paid Labs)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* My Recent Labs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Terbaru Saya</CardTitle>
                        <CardDescription>Daftar lab yang Anda kelola.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myRecentLabs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Anda belum membuat kelas.</p>
                            ) : (
                                myRecentLabs.map((lab: any) => (
                                    <div key={lab.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                                                👨‍🏫
                                            </div>
                                            <div>
                                                <p className="font-medium">{lab.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {lab.department?.name || "Independen"} • {lab._count.modules} Modul
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

    // --- ADMIN VIEW (Default) ---
    const userCount = await prisma.user.count();
    const labCount = await prisma.lab.count();
    const departmentCount = await prisma.department.count();

    // Fetch recent labs
    const recentLabs = await prisma.lab.findMany({
        take: 5,
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
                    <p className="text-muted-foreground">Monitor platform statistics and manage virtual labs.</p>
                </div>
                <Link href="/admin/labs/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Buat Lab Baru
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
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
                        <p className="text-xs text-muted-foreground">Across {departmentCount} Departments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Modul Completed</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Coming Soon</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Labs */}
            <Card>
                <CardHeader>
                    <CardTitle>Laboratorium Terbaru</CardTitle>
                    <CardDescription>Daftar lab yang baru saja ditambahkan atau diperbarui.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentLabs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Belum ada laboratorium.</p>
                        ) : (
                            recentLabs.map((lab: any) => (
                                <div key={lab.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                                            🧪
                                        </div>
                                        <div>
                                            <p className="font-medium">{lab.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lab.department?.name || "Independen"} • {lab._count.modules} Modul
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
