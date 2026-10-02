"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlaskConical, Pencil, Search, X, Layers, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
                        placeholder="Cari laboratorium (Judul, Deskripsi, Prodi)..."
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
                        <Card key={lab.id} className={`flex flex-col justify-between hover:shadow-md transition-all relative ${lab.requestedPrice > 0 ? "border-orange-300 bg-orange-50/10" : ""}`}>
                            <div>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl shrink-0">
                                            🧪
                                        </div>
                                        <div className="flex items-center gap-1">
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
                                    <CardTitle className="mt-3 line-clamp-1 text-base" title={lab.title}>{lab.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-9 text-xs">{lab.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {lab.department ? (
                                            <Badge variant="outline" className="text-[11px]">{lab.department.name}</Badge>
                                        ) : (
                                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 text-[11px]">Independen</Badge>
                                        )}
                                        <Badge variant="secondary" className="text-[11px]">{lab._count.modules} Modul</Badge>
                                        {lab.requestedPrice > 0 && (
                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 animate-pulse text-[11px]">
                                                Menunggu Approval
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Dosen: <b className="text-foreground">{lab.instructor || "Belum diset"}</b>
                                    </div>
                                </CardContent>
                            </div>

                            <CardFooter className="pt-2 border-t flex gap-2">
                                <Link href={`/admin/labs/${lab.id}/modules`} className="flex-1">
                                    <Button size="sm" className="w-full text-xs">
                                        <Layers className="mr-1.5 h-3.5 w-3.5" /> Kelola Materi
                                    </Button>
                                </Link>
                                <Link href={`/admin/labs/${lab.id}`}>
                                    <Button size="sm" variant="outline" className="text-xs">
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
