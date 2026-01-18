import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical, Pencil, Trash2, Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteLab } from "@/lib/admin-actions";
import DeleteLabButton from "@/components/admin/delete-lab-button";

export default async function AdminLabsPage() {
    const labs = await prisma.lab.findMany({
        include: {
            department: true,
            _count: {
                select: { modules: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Kelola Laboratorium</h1>
                    <p className="text-muted-foreground">Daftar semua laboratorium yang tersedia.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/labs/import">
                        <Button variant="outline">Import CSV</Button>
                    </Link>
                    <Link href="/admin/labs/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Buat Lab
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari laboratorium..." className="pl-8" />
                </div>
            </div>

            {/* Labs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {labs.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed">
                        <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Belum ada laboratorium</h3>
                        <p>Silakan buat laboratorium pertama anda.</p>
                    </div>
                ) : (
                    labs.map((lab: { id: string; title: string; description: string; createdAt: Date; department: { name: string; } | null; _count: { modules: number; }; }) => (
                        <Card key={lab.id} className="group hover:shadow-md transition-all">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                                        🧪
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/labs/${lab.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteLabButton id={lab.id} />
                                    </div>
                                </div>
                                <CardTitle className="mt-4 line-clamp-1" title={lab.title}>{lab.title}</CardTitle>
                                <CardDescription className="line-clamp-2 h-10">{lab.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {lab.department ? (
                                        <Badge variant="outline">{lab.department.name}</Badge>
                                    ) : (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Independen</Badge>
                                    )}
                                    <Badge variant="secondary">{lab._count.modules} Modul</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Dibuat: {new Date(lab.createdAt).toLocaleDateString("id-ID")}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
