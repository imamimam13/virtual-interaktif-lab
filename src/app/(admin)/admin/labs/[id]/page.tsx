import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Edit, Download, Users, FileText, Video, PlayCircle } from "lucide-react";
import ModuleViewer from "@/components/modules/module-viewer";

// Helper component for generic module icon
function ModuleIcon({ type }: { type: string }) {
    switch (type) {
        case "VIDEO": return <Video className="h-4 w-4" />;
        case "PDF": return <FileText className="h-4 w-4" />;
        case "QUIZ": return <PlayCircle className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
}

export default async function LabDetailsPage({ params }: { params: { id: string } }) {
    const lab = await prisma.lab.findUnique({
        where: { id: params.id },
        include: {
            modules: { orderBy: { order: 'asc' } },
            department: true,
            _count: { select: { enrollments: true } }
        }
    });

    if (!lab) {
        return <div>Lab not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/labs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{lab.title}</h1>
                        <p className="text-muted-foreground">
                            {lab.department?.name || "Independent Lab"} • {lab._count.enrollments} Students Enrolled
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/api/labs/${lab.id}/export-grades`} target="_blank">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Export Grades (CSV)
                        </Button>
                    </Link>
                    <Link href={`/admin/labs/${lab.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" /> Edit Lab
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Modules</CardTitle>
                        <CardDescription>Content content available in this lab.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lab.modules.map((module) => (
                                <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded">
                                            <ModuleIcon type={module.type} />
                                        </div>
                                        <span>{module.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{module.type}</span>
                                </div>
                            ))}
                            {lab.modules.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">No modules added yet.</p>
                            )}
                        </div>
                        <div className="mt-4">
                            <Link href={`/admin/labs/${lab.id}/modules/create`}>
                                <Button variant="outline" className="w-full">
                                    + Add Module
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Instructor Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    {/* @ts-ignore */}
                                    <p className="font-medium">{lab.instructor || "Not assigned"}</p>
                                    <p className="text-xs text-muted-foreground">Main Instructor</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Grading Scheme</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                {/* @ts-ignore */}
                                {lab.grading ? JSON.stringify(JSON.parse(lab.grading), null, 2) : "Default Grading"}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
