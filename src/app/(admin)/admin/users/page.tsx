import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, UserPlus, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserActions from "./user-actions";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { email: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground">Kelola akun mahasiswa dan dosen.</p>
                </div>
                <Link href="/admin/users/create">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Tambah User
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari pengguna (Email/Nama)..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <CardDescription>Total {users.length} pengguna terdaftar di sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user: { id: string; email: string; role: string; name: string | null }) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className={user.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}>
                                            {user.email.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"} className="text-[10px] px-2 py-0.5 h-5">
                                                {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                                {user.role}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <UserActions user={user} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
