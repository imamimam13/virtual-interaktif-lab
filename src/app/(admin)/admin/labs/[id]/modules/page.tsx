import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ArrowLeft, FileText, Video, HelpCircle, Trash2, Edit, Eye, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { deleteModule } from "@/lib/module-actions";
import SmartPdfUploader from "@/components/admin/smart-pdf-uploader";

import DraggableModuleList from "@/components/admin/draggable-module-list";

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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Kelola Modul: {lab.title}</h1>
                    <p className="text-muted-foreground">Atur materi dan urutan pembelajaran untuk laboratorium ini.</p>
                </div>
                <div className="ml-auto">
                    <Link href={`/admin/labs/${labId}/modules/create`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Modul
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Modul Pembelajaran</CardTitle>
                    <CardDescription>
                        Kelola konten materi dan atur urutan kemunculan modul untuk mahasiswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SmartPdfUploader labId={labId} />
                    <DraggableModuleList labId={labId} initialModules={lab.modules} />
                </CardContent>
            </Card>
        </div>
    );
}
