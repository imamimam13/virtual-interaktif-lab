import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoveRight, FlaskConical, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DemoLabsPage() {
    const labs = await prisma.lab.findMany({
        where: { isPublic: true },
        include: { department: true }
    });

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">Public Demo Labs</h1>
                <p className="text-muted-foreground">
                    Cobalah laboratorium virtual kami secara gratis tanpa perlu mendaftar.
                    Jelajahi modul, video, dan simulasi interaktif.
                </p>
            </div>

            {labs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Belum ada Demo Lab</h3>
                    <p className="text-muted-foreground">Silakan cek kembali nanti atau login untuk akses penuh.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labs.map((lab) => (
                        <Card key={lab.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    {lab.department ? (
                                        <Badge variant="outline">{lab.department.name}</Badge>
                                    ) : (
                                        <Badge variant="secondary">General</Badge>
                                    )}
                                    <Badge className="bg-green-600">Demo</Badge>
                                </div>
                                <CardTitle className="line-clamp-2">{lab.title}</CardTitle>
                                <CardDescription className="line-clamp-3">{lab.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" /> Instruktur: {lab.instructor || "Tim Dosen"}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/demo/labs/${lab.id}`} className="w-full">
                                    <Button className="w-full group">
                                        Buka Demo <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
