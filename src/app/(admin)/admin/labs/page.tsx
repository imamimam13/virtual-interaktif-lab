import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LabListClient from "./lab-list-client";

export const dynamic = "force-dynamic";

export default async function AdminLabsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/login");

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

            <LabListClient labs={labs} />
        </div>
    );
}
