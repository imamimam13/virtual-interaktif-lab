import { prisma } from "@/lib/prisma";
import UserForm from "./form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateUserPage() {
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Tambah Pengguna Baru</h1>
                    <p className="text-muted-foreground">Buat akun untuk mahasiswa atau dosen.</p>
                </div>
            </div>

            <UserForm departments={departments} />
        </div>
    );
}
