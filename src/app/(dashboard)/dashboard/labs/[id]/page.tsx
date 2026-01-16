import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, FileText, HelpCircle, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EnrollButton from "@/components/features/enroll-button";

export default async function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    // Get current user ID
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) redirect("/auth/login");

    const lab = await prisma.lab.findUnique({
        where: { id },
        include: {
            department: true,
            modules: {
                orderBy: { order: 'asc' }
            },
            enrollments: {
                where: { userId: user.id }
            }
        }
    });

    if (!lab) {
        notFound();
    }

    const isEnrolled = lab.enrollments.length > 0;

    const getIcon = (type: string) => {
        switch (type) {
            case "VIDEO": return <PlayCircle className="h-5 w-5 text-blue-500" />;
            case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
            case "QUIZ": return <HelpCircle className="h-5 w-5 text-yellow-500" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {lab.department ? (
                                <Badge variant="outline">{lab.department.name}</Badge>
                            ) : (
                                <Badge className="bg-purple-100 text-purple-700">General</Badge>
                            )}
                            {isEnrolled ? (
                                <Badge variant="default" className="bg-green-600">Terdaftar</Badge>
                            ) : (
                                <Badge variant="secondary">Belum Terdaftar</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold">{lab.title}</h1>
                        <p className="text-muted-foreground max-w-3xl">{lab.description}</p>

                        {!isEnrolled && (
                            <div className="pt-2">
                                <EnrollButton labId={lab.id} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Materi Pembelajaran</h2>
                        {!isEnrolled && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>

                    {lab.modules.length === 0 ? (
                        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            Belum ada materi di laboratorium ini.
                        </div>
                    ) : (
                        lab.modules.map((module: any, index: number) => (
                            <div key={module.id} className="relative">
                                {!isEnrolled && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 cursor-not-allowed flex items-center justify-center backdrop-blur-[1px]">
                                        <Lock className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                )}
                                <Card className={`transition-colors ${isEnrolled ? "hover:border-primary/50 cursor-pointer" : "opacity-75"}`}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{module.title}</h3>
                                            <p className="text-xs text-muted-foreground">{module.type}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" disabled={!isEnrolled}>
                                            {getIcon(module.type)}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {isEnrolled ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress Saya</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Selesai</span>
                                        <span className="font-bold">0 / {lab.modules.length}</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-0" />
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">Selesaikan semua modul untuk mendapatkan sertifikat.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Akses Terbatas</h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300/80">
                                    Anda perlu mendaftar (Enroll) di laboratorium ini untuk mengakses materi video, pdf, dan kuis.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-2">Instruksi Lab</h3>
                            <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
                                <li>Pelajari materi secara berurutan.</li>
                                <li>Tonton video sampai selesai.</li>
                                <li>Kerjakan kuis untuk mendapatkan nilai.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
