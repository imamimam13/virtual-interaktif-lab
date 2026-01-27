import Link from "next/link";
import { Atom, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-md bg-background/80 sticky top-0 z-50">
                <Link className="flex items-center justify-center gap-2" href="/">
                    <Atom className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg tracking-tight">VirtualLab<span className="text-primary">.Demo</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Home
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button size="sm">Login</Button>
                    </Link>
                </div>
            </header>
            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    );
}
