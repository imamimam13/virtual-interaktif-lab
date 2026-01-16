import DashboardWrapper from "@/components/layout/dashboard-wrapper";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardWrapper>
            {children}
        </DashboardWrapper>
    );
}
