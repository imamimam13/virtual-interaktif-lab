import CreateModuleForm from "./form";

export default async function CreateModulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CreateModuleForm labId={id} />;
}
