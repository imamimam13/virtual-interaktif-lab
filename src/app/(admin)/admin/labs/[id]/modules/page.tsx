import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ArrowLeft, FileText, Video, HelpCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { deleteModule } from "@/lib/module-actions";
import SmartPdfUploader from "@/components/admin/smart-pdf-uploader";

export default async function ModuleManagerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: labId } = await params;

    const lab = await prisma.lab.findUnique({
        where: { id: labId },
        include: {
            modules: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!lab) {
        return <div>Lab not found</div>;
    }

    async function handleDelete(moduleId: string) {
        "use server";
        await deleteModule(moduleId, labId);
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "VIDEO": return <Video className="h-5 w-5 text-blue-500" />;
            case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
            case "QUIZ": return <HelpCircle className="h-5 w-5 text-yellow-500" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Manage Modules: {lab.title}</h1>
                    <p className="text-muted-foreground">Manage learning materials for this laboratory.</p>
                </div>
                <div className="ml-auto">
                    <Link href={`/admin/labs/${labId}/modules/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Module
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Modul</CardTitle>
                    <CardDescription>Kelola urutan dan konten modul.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <SmartPdfUploader labId={labId} />

                    {lab.modules.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                            No modules yet. Click "Add Module" to start.
                        </div>
                    ) : (
                        lab.modules.map((module: any, index: number) => (
                            <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-background p-2 rounded-full border shadow-sm font-mono text-sm font-bold w-8 h-8 flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <div className="bg-secondary/20 p-2 rounded-md">
                                        {getIcon(module.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{module.title}</h3>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{module.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/labs/${labId}/modules/${module.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <form action={handleDelete.bind(null, module.id)}>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
