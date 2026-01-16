"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FlaskConical,
    Settings,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";


interface DashboardLayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FlaskConical, label: "Laboratorium", href: "/dashboard/labs" },
    { icon: BookOpen, label: "Modul Saya", href: "/dashboard/modules" },
    { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden border-r bg-white dark:bg-zinc-950 md:block transition-[width] duration-300 ease-in-out fixed inset-y-0 left-0 z-30",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="flex h-16 items-center border-b px-4 justify-between">
                    {isSidebarOpen ? (
                        <Link className="flex items-center gap-2 font-semibold" href="/">
                            <FlaskConical className="h-6 w-6 text-primary" />
                            <span className="">VirtualLab</span>
                        </Link>
                    ) : (
                        <div className="mx-auto">
                            <FlaskConical className="h-6 w-6 text-primary" />
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto hidden md:flex"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="space-y-4 py-4">
                        <div className="px-3 py-2">
                            <div className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={pathname === item.href ? "secondary" : "ghost"}
                                            className={cn("w-full justify-start", !isSidebarOpen && "justify-center px-2")}
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
                "md:ml-20", // Default collapsed width margin
                isSidebarOpen && "md:ml-64"
            )}>
                {/* Header (Mobile Trigger + User Menu) */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/50 px-6 backdrop-blur dark:bg-zinc-950/50">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                                <div className="px-1 py-6 font-bold text-xl">
                                    Virtual Lab UWB
                                </div>
                                <nav className="flex flex-col gap-4 mt-4">
                                    {sidebarItems.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <span className={cn(
                                                "flex items-center gap-2 px-2 py-1 text-lg font-medium hover:text-primary",
                                                pathname === item.href ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* Breadcrumb or Title placeholder */}
                        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
                            {sidebarItems.find(i => i.href === pathname)?.label || "Dashboard"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="/avatars/01.png" alt="@user" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Mahasiswa</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            user@wirabhakti.ac.id
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/login" })} className="text-red-500 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>


                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
