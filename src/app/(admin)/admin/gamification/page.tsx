import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Trash2 } from "lucide-react";
import { deleteLevelTitle } from "@/lib/gamification-actions";
import GamificationForm from "./gamification-form";

export default async function GamificationPage() {
    const levels = await prisma.levelTitle.findMany({
        orderBy: { level: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gamification Settings</h2>
                <p className="text-muted-foreground">Atur titel untuk setiap level pencapaian mahasiswa.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">


                // ...

                {/* Form Add/Edit */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah / Edit Title</CardTitle>
                        <CardDescription>Jika level sudah ada, akan di-update.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GamificationForm />
                    </CardContent>
                </Card>

                {/* List of Titles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Level & Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {levels.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Belum ada title yang diatur.</p>
                            ) : (
                                levels.map((l) => (
                                    <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 font-bold text-sm">
                                                {l.level}
                                            </div>
                                            <div>
                                                <div className="font-medium">{l.title}</div>
                                                <div className="text-xs text-muted-foreground">Min. {(l.level - 1) * 1000} XP</div>
                                            </div>
                                        </div>
                                        <form action={deleteLevelTitle.bind(null, l.level)}>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
