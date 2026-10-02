"use client";

import { useState, useMemo } from "react";
import { Search, X, Shield, User, GraduationCap, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserActions from "./user-actions";

export interface UserItem {
    id: string;
    email: string;
    name: string | null;
    role: string;
    nim?: string | null;
    nidn?: string | null;
    siakadUserId?: string | null;
    phone?: string | null;
    department?: { id: string; name: string } | null;
    createdAt?: Date | string;
}

interface UserTableClientProps {
    users: UserItem[];
}

export default function UserTableClient({ users }: UserTableClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return users.filter((user) => {
            // Role filter
            if (roleFilter !== "ALL" && user.role !== roleFilter) {
                return false;
            }

            // Search query filter
            if (!query) return true;

            const matchesEmail = user.email.toLowerCase().includes(query);
            const matchesName = user.name ? user.name.toLowerCase().includes(query) : false;
            const matchesNim = user.nim ? user.nim.toLowerCase().includes(query) : false;
            const matchesNidn = user.nidn ? user.nidn.toLowerCase().includes(query) : false;
            const matchesDept = user.department?.name ? user.department.name.toLowerCase().includes(query) : false;
            const matchesId = user.id.toLowerCase().includes(query);

            return matchesEmail || matchesName || matchesNim || matchesNidn || matchesDept || matchesId;
        });
    }, [users, searchQuery, roleFilter]);

    return (
        <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari pengguna (Email, Nama, NIM, NIDN, Prodi)..."
                        className="pl-9 pr-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="w-full sm:w-48">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Role ({users.length})</SelectItem>
                            <SelectItem value="LECTURER">Dosen ({users.filter(u => u.role === "LECTURER").length})</SelectItem>
                            <SelectItem value="STUDENT">Mahasiswa ({users.filter(u => u.role === "STUDENT").length})</SelectItem>
                            <SelectItem value="ADMIN">Admin ({users.filter(u => u.role === "ADMIN").length})</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results count indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                    Menampilkan <b>{filteredUsers.length}</b> dari {users.length} pengguna terdaftar
                    {searchQuery && ` untuk pencarian "${searchQuery}"`}
                </span>
                {(searchQuery || roleFilter !== "ALL") && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("ALL");
                        }}
                        className="text-indigo-600 hover:underline text-xs"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* User List */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50/50 dark:bg-zinc-900/50">
                    <User className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-foreground">Tidak ada pengguna yang cocok</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Coba gunakan kata kunci pencarian lain atau ubah filter role.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarFallback
                                        className={
                                            user.role === "ADMIN"
                                                ? "bg-red-100 text-red-700 font-semibold"
                                                : user.role === "LECTURER"
                                                ? "bg-indigo-100 text-indigo-700 font-semibold"
                                                : "bg-emerald-100 text-emerald-700 font-semibold"
                                        }
                                    >
                                        {(user.name ? user.name.substring(0, 2) : user.email.substring(0, 2)).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm truncate">
                                            {user.name || user.email.split("@")[0]}
                                        </p>
                                        <Badge
                                            variant={
                                                user.role === "ADMIN"
                                                    ? "destructive"
                                                    : user.role === "LECTURER"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="text-[10px] px-2 py-0.5 h-5 shrink-0"
                                        >
                                            {user.role === "ADMIN" && <Shield className="w-3 h-3 mr-1" />}
                                            {user.role === "LECTURER" && <GraduationCap className="w-3 h-3 mr-1" />}
                                            {user.role === "STUDENT" && <User className="w-3 h-3 mr-1" />}
                                            {user.role}
                                        </Badge>
                                        {user.department && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground shrink-0">
                                                <Building2 className="w-2.5 h-2.5 mr-1" />
                                                {user.department.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                        <span className="font-mono">{user.email}</span>
                                        {user.nim && (
                                            <>
                                                <span>•</span>
                                                <span>NIM: <b className="text-foreground">{user.nim}</b></span>
                                            </>
                                        )}
                                        {user.nidn && (
                                            <>
                                                <span>•</span>
                                                <span>NIDN: <b className="text-foreground">{user.nidn}</b></span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <UserActions user={user} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
