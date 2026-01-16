import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutWrapper from "@/components/layout/admin-wrapper";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
