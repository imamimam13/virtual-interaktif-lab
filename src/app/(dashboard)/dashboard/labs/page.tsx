import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LabsPage({
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

    // Fetch Enrolled Labs
    let enrolledLabs: any[] = [];
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
                }
            }
        });
        enrolledLabs = user?.enrollments.map((e: any) => e.lab) || [];
    }

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

    const defaultTab = resolvedSearchParams?.view === "my" ? "my" : "all";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daftar Laboratorium</h2>
                    <p className="text-muted-foreground">Temukan materi praktikum yang sesuai dengan kebutuhan anda.</p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
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
