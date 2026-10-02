import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import UserTableClient from "./user-table-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        include: {
            department: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
        orderBy: { email: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground">Kelola akun mahasiswa, dosen, dan administrator.</p>
                </div>
                <Link href="/admin/users/create">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Tambah User
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <CardDescription>Total {users.length} pengguna terdaftar di sistem Virtual Lab.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTableClient users={users} />
                </CardContent>
            </Card>
        </div>
    );
}
