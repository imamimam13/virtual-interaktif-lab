"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    FlaskConical,
    Users,
    Settings,
    Menu,
    ChevronLeft,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const adminSidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
    { icon: PlusCircle, label: "Buat Lab Baru", href: "/admin/labs/create" },
    { icon: FlaskConical, label: "Kelola Lab", href: "/admin/labs" },
    { icon: Users, label: "Pengguna", href: "/admin/users" },
    { icon: FlaskConical, label: "Prodi / Jurusan", href: "/admin/departments" },
    { icon: Settings, label: "Pengaturan Platform", href: "/admin/settings" },
];

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
            {/* Sidebar */}
            <aside
                className={cn(
                    "hidden border-r bg-zinc-900 text-white md:block transition-[width] duration-300 ease-in-out fixed inset-y-0 left-0 z-30",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="flex h-16 items-center border-b border-zinc-800 px-4 justify-between">
                    {isSidebarOpen ? (
                        <Link className="flex items-center gap-2 font-bold text-lg" href="/admin/dashboard">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                            <span className="">Admin Panel</span>
                        </Link>
                    ) : (
                        <div className="mx-auto">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto hidden md:flex text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="space-y-4 py-4">
                        <div className="px-3 py-2">
                            <div className="space-y-1">
                                {adminSidebarItems.map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start hover:bg-zinc-800 hover:text-white",
                                                pathname === item.href ? "bg-red-600/10 text-red-400 hover:bg-red-600/20" : "text-zinc-400",
                                                !isSidebarOpen && "justify-center px-2"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-2")} />
                                            {isSidebarOpen && <span>{item.label}</span>}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-[margin] duration-300 ease-in-out flex flex-col",
                "md:ml-20",
                isSidebarOpen && "md:ml-64"
            )}>
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/50 px-6 backdrop-blur dark:bg-zinc-950/50">
                    <h1 className="text-lg font-semibold tracking-tight md:text-xl">
                        {adminSidebarItems.find(i => i.href === pathname)?.label || "Admin Area"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard?view=student" className="text-muted-foreground hover:text-primary">
                                Switch to Student View
                            </Link>
                        </Button>

                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-red-100 text-red-600">AD</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
