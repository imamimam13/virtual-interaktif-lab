import { prisma } from "@/lib/prisma";
import CreateLabForm from "./form";

export default async function CreateLabPage() {
    // Fetch departments from DB for the dropdown
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    return <CreateLabForm departments={departments} />;
}
