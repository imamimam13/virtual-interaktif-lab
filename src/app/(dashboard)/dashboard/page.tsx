import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users, Trophy } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!session) {
        redirect("/auth/login");
    }

    if (session?.user?.role === "ADMIN" && resolvedSearchParams?.view !== "student") {
        redirect("/admin/dashboard");
    }

    // Fetch All Labs
    const allLabs = await prisma.lab.findMany({
        include: {
            department: true,
            _count: {
                select: { modules: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch User Data for XP & Enrolled Labs
    let enrolledLabs: any[] = [];
    let totalXp = 0;

    if (userEmail) {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                enrollments: {
                    include: {
                        lab: {
                            include: {
                                department: true,
                                _count: { select: { modules: true } }
                            }
                        }
                    }
                },
                moduleProgress: {
                    select: { score: true }
                }
            }
        });
        enrolledLabs = user?.enrollments.map((e: any) => e.lab) || [];
        totalXp = user?.moduleProgress.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
    }

    // XP Logic
    const XP_PER_LEVEL = 1000;
    const currentLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const nextLevelXp = currentLevel * XP_PER_LEVEL;
    const currentLevelBaseXp = (currentLevel - 1) * XP_PER_LEVEL;
    const progressToNextLevel = ((totalXp - currentLevelBaseXp) / XP_PER_LEVEL) * 100;

    const LabGrid = ({ labs, emptyMessage }: { labs: any[], emptyMessage: string }) => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {labs.length > 0 ? (
                labs.map((lab) => (
                    <Link key={lab.id} href={`/dashboard/labs/${lab.id}`} className="block h-full">
                        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                            <div className="aspect-video w-full bg-zinc-100 relative overflow-hidden rounded-t-xl group">
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-800 text-gray-400">
                                    <BookOpen className="h-10 w-10 opacity-20" />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="backdrop-blur bg-white/50">
                                        {lab.department?.name || "General"}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{lab.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {lab.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{lab._count?.modules || 0} Modul</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>Siswa</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                    Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    {emptyMessage}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Selamat Datang, {session.user?.name || "Mahasiswa"}!</h2>
                    <p className="text-muted-foreground">Lanjutkan progress belajar di Laboratorium Virtual.</p>
                </div>
                <Link href="/dashboard/labs">
                    <Button variant="outline">
                        Jelajahi Lab Baru <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Modul</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrolledLabs.length}</div>
                        <p className="text-xs text-muted-foreground">Lab diikuti</p>
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium">Level {currentLevel}</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{totalXp.toLocaleString()} XP</div>
                            <div className="text-xs text-muted-foreground">Next: {nextLevelXp.toLocaleString()} XP</div>
                        </div>
                        <Progress value={progressToNextLevel} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            Raih {nextLevelXp - totalXp} XP lagi untuk naik ke Level {currentLevel + 1}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">Semua Lab</TabsTrigger>
                    <TabsTrigger value="my">Lab Saya (Enrolled)</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <LabGrid labs={allLabs} emptyMessage="Belum ada laboratorium yang tersedia." />
                </TabsContent>

                <TabsContent value="my" className="space-y-4">
                    <LabGrid labs={enrolledLabs} emptyMessage="Anda belum mendaftar di kelas manapun." />
                </TabsContent>
            </Tabs>
        </div>
    );
}
