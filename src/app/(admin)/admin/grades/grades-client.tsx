"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    Download,
    GraduationCap,
    Users,
    CheckCircle2,
    Clock,
    Award,
    FileText,
    Video,
    HelpCircle,
    Eye,
    ExternalLink,
    Filter,
    BarChart3,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

interface ModuleData {
    id: string;
    title: string;
    type: string;
    order: number;
}

interface StudentGradeData {
    id: string; // enrollment id
    userId: string;
    name: string;
    email: string;
    nim: string | null;
    departmentName: string | null;
    status: string;
    paymentStatus: string;
    joinedAt: string;
    completedAt: string | null;
    progressPercentage: number;
    completedModulesCount: number;
    finalScore: number;
    certificateCode: string | null;
    moduleResults: {
        moduleId: string;
        moduleTitle: string;
        moduleType: string;
        completed: boolean;
        score: number | null;
        updatedAt: string | null;
    }[];
}

interface LabSummary {
    id: string;
    title: string;
    instructor: string | null;
    departmentName: string | null;
    modulesCount: number;
    enrollmentsCount: number;
}

interface GradesClientProps {
    labs: LabSummary[];
    currentLab: {
        id: string;
        title: string;
        instructor: string | null;
        departmentName: string | null;
        modules: ModuleData[];
    } | null;
    students: StudentGradeData[];
}

export default function GradesClient({ labs, currentLab, students }: GradesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedStudent, setSelectedStudent] = useState<StudentGradeData | null>(null);

    const handleLabChange = (labId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("labId", labId);
        router.push(`/admin/grades?${params.toString()}`);
    };

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (student.nim && student.nim.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "COMPLETED" && (student.status === "COMPLETED" || student.progressPercentage === 100)) ||
                (statusFilter === "ACTIVE" && student.status === "ACTIVE" && student.progressPercentage < 100) ||
                (statusFilter === "CERTIFIED" && Boolean(student.certificateCode));

            return matchesSearch && matchesStatus;
        });
    }, [students, searchQuery, statusFilter]);

    // Summary Statistics
    const stats = useMemo(() => {
        if (students.length === 0) {
            return { total: 0, completed: 0, avgScore: 0, certified: 0, completionRate: 0 };
        }
        const total = students.length;
        const completed = students.filter(s => s.status === "COMPLETED" || s.progressPercentage === 100).length;
        const certified = students.filter(s => Boolean(s.certificateCode)).length;
        const totalScore = students.reduce((acc, s) => acc + s.finalScore, 0);
        const avgScore = Math.round((totalScore / total) * 10) / 10;
        const completionRate = Math.round((completed / total) * 100);

        return { total, completed, avgScore, certified, completionRate };
    }, [students]);

    const getScoreBadge = (score: number) => {
        if (score >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
        if (score >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
        if (score > 0) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300";
    };

    const getModuleIcon = (type: string) => {
        switch (type) {
            case "VIDEO":
            case "INTERACTIVE_VIDEO":
                return <Video className="h-4 w-4 text-blue-500" />;
            case "QUIZ":
                return <HelpCircle className="h-4 w-4 text-amber-500" />;
            case "PDF":
            case "INSTRUCTION":
                return <FileText className="h-4 w-4 text-emerald-500" />;
            default:
                return <BookOpen className="h-4 w-4 text-purple-500" />;
        }
    };

    if (labs.length === 0) {
        return (
            <Card className="text-center py-12">
                <CardContent className="space-y-4">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold">Belum Ada Laboratorium</h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm">
                        Anda belum memiliki laboratorium praktikum aktif. Silakan buat laboratorium terlebih dahulu.
                    </p>
                    <Link href="/admin/labs/create">
                        <Button>Buat Lab Baru</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Lab Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Hasil & Nilai Peserta</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Pantau progres pembelajaran, hasil kuis/tugas, dan perolehan sertifikat mahasiswa.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="w-full md:w-72">
                        <Select
                            value={currentLab?.id || labs[0]?.id}
                            onValueChange={handleLabChange}
                        >
                            <SelectTrigger className="font-medium">
                                <SelectValue placeholder="Pilih Laboratorium" />
                            </SelectTrigger>
                            <SelectContent>
                                {labs.map((lab) => (
                                    <SelectItem key={lab.id} value={lab.id}>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate max-w-[200px]">{lab.title}</span>
                                            <span className="text-xs text-muted-foreground">({lab.enrollmentsCount} mhs)</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentLab && (
                        <Link href={`/api/labs/${currentLab.id}/export-grades`} target="_blank">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Current Lab Overview & Stats */}
            {currentLab && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Peserta Enrol</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentLab.departmentName || "Umum"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat Kelulusan</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completionRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.completed} dari {stats.total} mahasiswa selesai
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</CardTitle>
                            <BarChart3 className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span></div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari {currentLab.modules.filter(m => m.type === "QUIZ" || m.type === "INTERACTIVE_VIDEO").length} modul dinilai
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sertifikat Diterbitkan</CardTitle>
                            <Award className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.certified}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Mahasiswa telah bersertifikat
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filter and Search Bar */}
            <Card>
                <CardHeader className="p-4 md:p-6 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg">Daftar Mahasiswa & Nilai</CardTitle>
                            <CardDescription>
                                Menampilkan rekapitulasi progres dan nilai untuk {currentLab?.title || "Laboratorium"}
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Nama / NIM / Email..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="mr-2 h-3.5 w-3.5" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Status</SelectItem>
                                    <SelectItem value="ACTIVE">Sedang Belajar</SelectItem>
                                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                                    <SelectItem value="CERTIFIED">Bersertifikat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[240px]">Mahasiswa</TableHead>
                                    <TableHead>Prodi / NIM</TableHead>
                                    <TableHead className="w-[180px]">Progres Modul</TableHead>
                                    <TableHead className="text-center">Nilai Akhir</TableHead>
                                    <TableHead className="text-center">Sertifikat</TableHead>
                                    <TableHead>Tanggal Gabung</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            {students.length === 0
                                                ? "Belum ada mahasiswa yang mendaftar di laboratorium ini."
                                                : "Tidak ditemukan mahasiswa yang sesuai dengan filter pencarian."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const initials = student.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase() || "M";

                                        const totalModules = currentLab?.modules.length || 0;

                                        return (
                                            <TableRow key={student.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm leading-tight">
                                                                {student.name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {student.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="text-xs font-medium">
                                                        {student.nim ? <Badge variant="outline" className="font-mono text-[10px]">{student.nim}</Badge> : "-"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {student.departmentName || "Umum"}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-muted-foreground font-medium">
                                                                {student.completedModulesCount} / {totalModules} Modul
                                                            </span>
                                                            <span className="font-semibold">{student.progressPercentage}%</span>
                                                        </div>
                                                        <Progress
                                                            value={student.progressPercentage}
                                                            className={cn("h-2", student.progressPercentage === 100 ? "[&>div]:bg-emerald-500" : "")}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("font-bold text-sm px-2.5 py-0.5 border", getScoreBadge(student.finalScore))}
                                                    >
                                                        {student.finalScore}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    {student.certificateCode ? (
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 gap-1 text-[11px]">
                                                            <Award className="h-3 w-3" />
                                                            Terbit
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Belum</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(student.joinedAt)}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1 text-xs"
                                                        onClick={() => setSelectedStudent(student)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Student Detail Modal */}
            <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {selectedStudent && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                                            {selectedStudent.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <DialogTitle className="text-lg">{selectedStudent.name}</DialogTitle>
                                        <DialogDescription className="text-xs">
                                            {selectedStudent.email} {selectedStudent.nim && `• NIM: ${selectedStudent.nim}`}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-5 pt-2">
                                {/* Summary Card in Modal */}
                                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg text-center">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Progres</span>
                                        <span className="text-base font-bold text-foreground">
                                            {selectedStudent.progressPercentage}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Nilai Akhir</span>
                                        <span className="text-base font-bold text-primary">
                                            {selectedStudent.finalScore} / 100
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Sertifikat</span>
                                        <span className="text-xs font-semibold block mt-1">
                                            {selectedStudent.certificateCode ? (
                                                <span className="text-amber-600 font-mono">{selectedStudent.certificateCode}</span>
                                            ) : (
                                                <span className="text-muted-foreground">Belum Selesai</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Module Progress List */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Rincian Modul & Pengerjaan
                                    </h4>

                                    <div className="space-y-2 border rounded-lg p-2 divide-y">
                                        {selectedStudent.moduleResults.map((mod, idx) => (
                                            <div key={mod.moduleId} className="pt-2 pb-2 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-md bg-muted flex items-center justify-center">
                                                        {getModuleIcon(mod.moduleType)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-snug">
                                                            {idx + 1}. {mod.moduleTitle}
                                                        </p>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Tipe: {mod.moduleType} {mod.updatedAt && `• Terakhir: ${formatDate(mod.updatedAt)}`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-right">
                                                    {(mod.moduleType === "QUIZ" || mod.moduleType === "INTERACTIVE_VIDEO") && (
                                                        <Badge variant="outline" className={cn("text-xs font-bold", mod.score !== null ? getScoreBadge(mod.score) : "")}>
                                                            Skor: {mod.score !== null ? mod.score : "-"}
                                                        </Badge>
                                                    )}

                                                    {mod.completed ? (
                                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Selesai
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-zinc-500 text-[11px] gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Belum
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {selectedStudent.moduleResults.length === 0 && (
                                            <p className="text-center text-xs text-muted-foreground py-4">
                                                Belum ada data modul untuk lab ini.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
