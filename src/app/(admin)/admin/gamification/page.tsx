import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GamificationForm from "./gamification-form";
import DeleteLevelTitleButton from "./delete-button";

export default async function GamificationPage() {
    // @ts-ignore
    const levels = await (prisma as any).levelTitle.findMany({
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
                                levels.map((l: any) => (
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
                                        <DeleteLevelTitleButton level={l.level} />
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
