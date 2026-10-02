"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlaskConical, Pencil, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DeleteLabButton from "@/components/admin/delete-lab-button";
import ReviewLabButton from "@/components/admin/review-lab-button";

interface LabItem {
    id: string;
    title: string;
    description: string;
    instructor: string | null;
    requestedPrice: number;
    price: number;
    feePercentage: number;
    lppmFeePercentage: number;
    createdAt: Date | string;
    department?: { id: string; name: string } | null;
    _count: { modules: number };
}

interface LabListClientProps {
    labs: LabItem[];
}

export default function LabListClient({ labs }: LabListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLabs = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return labs;

        return labs.filter((lab) => {
            const matchesTitle = lab.title.toLowerCase().includes(query);
            const matchesDesc = lab.description ? lab.description.toLowerCase().includes(query) : false;
            const matchesInstructor = lab.instructor ? lab.instructor.toLowerCase().includes(query) : false;
            const matchesDept = lab.department?.name ? lab.department.name.toLowerCase().includes(query) : false;

            return matchesTitle || matchesDesc || matchesInstructor || matchesDept;
        });
    }, [labs, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Search Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari laboratorium (Judul, Deskripsi, Dosen, Prodi)..."
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

                <div className="text-xs text-muted-foreground">
                    Menampilkan <b>{filteredLabs.length}</b> dari {labs.length} lab
                </div>
            </div>

            {/* Labs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLabs.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed">
                        <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">Tidak ada laboratorium ditemukan</h3>
                        <p className="text-xs mt-1">
                            {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Silakan buat laboratorium pertama anda."}
                        </p>
                    </div>
                ) : (
                    filteredLabs.map((lab) => (
                        <Card key={lab.id} className={`group hover:shadow-md transition-all relative ${lab.requestedPrice > 0 ? "border-orange-300 bg-orange-50/10" : ""}`}>
                            <Link href={`/admin/labs/${lab.id}`} className="absolute inset-0 z-0" />
                            <CardHeader className="pb-4 relative z-10">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl pointer-events-none">
                                        🧪
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                                        {lab.requestedPrice > 0 && (
                                            <ReviewLabButton lab={lab} />
                                        )}
                                        <Link href={`/admin/labs/${lab.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteLabButton id={lab.id} />
                                    </div>
                                </div>
                                <CardTitle className="mt-4 line-clamp-1 pointer-events-none" title={lab.title}>{lab.title}</CardTitle>
                                <CardDescription className="line-clamp-2 h-10 pointer-events-none">{lab.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10 pointer-events-none">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {lab.department ? (
                                        <Badge variant="outline">{lab.department.name}</Badge>
                                    ) : (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Independen</Badge>
                                    )}
                                    <Badge variant="secondary">{lab._count.modules} Modul</Badge>
                                    {lab.requestedPrice > 0 && (
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 animate-pulse">
                                            Waiting Approval
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Dosen: {lab.instructor || "Belum diset"} • Dibuat: {new Date(lab.createdAt).toLocaleDateString("id-ID")}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
