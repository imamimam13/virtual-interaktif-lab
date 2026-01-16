import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { createDepartment, deleteDepartment } from "@/lib/admin-actions";

export default async function AdminDepartmentsPage() {
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { labs: true }
            }
        }
    });

    async function handleCreate(formData: FormData) {
        "use server";
        await createDepartment(null, formData);
    }

    async function handleDelete(id: string) {
        "use server";
        await deleteDepartment(id);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Prodi / Jurusan</h1>
                <p className="text-muted-foreground">Kelola daftar Program Studi yang tersedia.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Tambah Prodi</CardTitle>
                        <CardDescription>Masukkan nama program studi baru.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleCreate} className="space-y-4">
                            <div className="grid gap-2">
                                <Input name="name" placeholder="Nama Prodi (e.g. Teknik Sipil)" required />
                            </div>
                            <div className="grid gap-2">
                                <Input name="level" placeholder="Jenjang (e.g. S1, D3)" required />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Tambah
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daftar Program Studi ({departments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Prodi</TableHead>
                                    <TableHead>Jumlah Lab</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            Belum ada data prodi inside database.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    departments.map((dept: { id: string; name: string; _count: { labs: number } }) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium">{dept.name}</TableCell>
                                            <TableCell>{dept._count.labs} Lab</TableCell>
                                            <TableCell className="text-right">
                                                <form action={handleDelete.bind(null, dept.id)}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
