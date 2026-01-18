import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Edit, Trash2, FileCode } from "lucide-react";
import Link from "next/link";
import { deleteTemplate } from "@/lib/certificate-actions";
import { Badge } from "@/components/ui/badge";

export default async function CertificateTemplatesPage() {
    const templates = await prisma.certificateTemplate.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            _count: { select: { labs: true } }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Certificate Templates</h2>
                    <p className="text-muted-foreground">Kelola desain sertifikat untuk laboratorium.</p>
                </div>
                <Link href="/admin/certificate-templates/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Buat Template Baru
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-blue-500" />
                                    {template.name}
                                </CardTitle>
                                {template.isDefault && <Badge>Default</Badge>}
                            </div>
                            <CardDescription>
                                Digunakan oleh {template._count.labs} Laboratorium
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="h-32 bg-gray-100 rounded border p-2 overflow-hidden text-[10px] text-gray-500 font-mono select-none">
                                {template.html.substring(0, 300)}...
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                            <Link href={`/admin/certificate-templates/${template.id}`} className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                            </Link>
                            <form action={deleteTemplate.bind(null, template.id)}>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
