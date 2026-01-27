import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, FileText, HelpCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DemoLabDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const lab = await prisma.lab.findUnique({
        where: { id },
        include: {
            department: true,
            modules: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!lab || !lab.isPublic) {
        notFound();
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "VIDEO": return <PlayCircle className="h-5 w-5 text-blue-500" />;
            case "INTERACTIVE_VIDEO": return <PlayCircle className="h-5 w-5 text-purple-500" />;
            case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
            case "QUIZ": return <HelpCircle className="h-5 w-5 text-yellow-500" />;
            case "SIMULATION": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/demo/labs" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Demo
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {lab.department ? (
                                <Badge variant="outline">{lab.department.name}</Badge>
                            ) : (
                                <Badge className="bg-purple-100 text-purple-700">General</Badge>
                            )}
                            <Badge className="bg-green-600">Demo Access</Badge>
                        </div>
                        <h1 className="text-3xl font-bold">{lab.title}</h1>
                        <p className="text-muted-foreground max-w-3xl">{lab.description}</p>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Materi Pembelajaran (Demo Mode)</h2>
                    </div>

                    {lab.modules.length === 0 ? (
                        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            Belum ada materi di laboratorium ini.
                        </div>
                    ) : (
                        lab.modules.map((module: any, index: number) => (
                            // In demo mode, we just link to the module detail page similar to verified user,
                            // BUT we need to make sure the Module Detail page itself also supports public access.
                            // Wait, existing module detail pages are under /dashboard/module/[id].
                            // I cannot modify that easily to be public without middleware changes and logic changes there.
                            // It is safer/cleaner to make a /demo/module/[id] route that renders content.
                            // For now, I'll link to /demo/module/[id] and create that page next.
                            <Link key={module.id} href={`/demo/module/${module.id}`} className="block relative">
                                <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{module.title}</h3>
                                            <p className="text-xs text-muted-foreground">{module.type}</p>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            {getIcon(module.type)}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Mode Demo</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300/80">
                                Anda sedang mengakses lab ini dalam mode publik.
                                <ul className="list-disc pl-4 mt-2 space-y-1">
                                    <li>Materi dapat diakses penuh.</li>
                                    <li>Progress tidak disimpan.</li>
                                    <li>Skor kuis tidak direkam.</li>
                                    <li>Sertifikat tidak diterbitkan.</li>
                                </ul>
                            </p>
                            <div className="mt-4">
                                <Link href="/auth/login">
                                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                                        Login untuk Akses Penuh
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
