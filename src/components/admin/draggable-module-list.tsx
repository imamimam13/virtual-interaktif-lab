"use client";

import { useState, useTransition } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GripVertical, Video, FileText, HelpCircle, Edit, Trash2, Eye, ArrowUp, ArrowDown, CheckCircle2, Loader2, BookOpen, Layers, Code, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { reorderModules, deleteModule } from "@/lib/module-actions";

export interface ModuleItem {
    id: string;
    title: string;
    type: string;
    order: number;
    labId: string;
}

interface DraggableModuleListProps {
    labId: string;
    initialModules: ModuleItem[];
}

export default function DraggableModuleList({ labId, initialModules }: DraggableModuleListProps) {
    const [items, setItems] = useState<ModuleItem[]>(initialModules);
    const [isSaving, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const getIcon = (type: string) => {
        switch (type) {
            case "INSTRUCTION": return <BookOpen className="h-4 w-4 text-indigo-500" />;
            case "VIDEO": return <Video className="h-4 w-4 text-blue-500" />;
            case "INTERACTIVE_VIDEO": return <Video className="h-4 w-4 text-purple-500" />;
            case "PDF": return <FileText className="h-4 w-4 text-rose-500" />;
            case "QUIZ": return <HelpCircle className="h-4 w-4 text-amber-500" />;
            case "HTML": return <Code className="h-4 w-4 text-emerald-500" />;
            case "SCORM": return <Layers className="h-4 w-4 text-teal-500" />;
            case "SIMULATION": return <Sparkles className="h-4 w-4 text-purple-500" />;
            default: return <FileText className="h-4 w-4 text-slate-500" />;
        }
    };

    const handleReorder = (newOrder: ModuleItem[]) => {
        setItems(newOrder);
        setSaveStatus("Menyimpan urutan...");

        startTransition(async () => {
            const orderedIds = newOrder.map((m) => m.id);
            const res = await reorderModules(labId, orderedIds);
            if (res.success) {
                setSaveStatus("Urutan modul tersimpan otomatis!");
                setTimeout(() => setSaveStatus(null), 2500);
            } else {
                setSaveStatus("Gagal menyimpan urutan.");
            }
        });
    };

    const moveItem = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const newItems = [...items];
        const [moved] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, moved);
        handleReorder(newItems);
    };

    const handleDelete = async (moduleId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus modul ini?")) return;

        startTransition(async () => {
            await deleteModule(moduleId, labId);
            const updated = items.filter((m) => m.id !== moduleId);
            setItems(updated);
            setSaveStatus("Modul berhasil dihapus.");
            setTimeout(() => setSaveStatus(null), 2500);
        });
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Belum ada modul praktikum di lab ini</p>
                <p className="text-xs">Klik tombol <b>"Tambah Modul"</b> di atas atau upload modul PDF untuk memulai.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-indigo-500" />
                    <span>💡 <b>Tips:</b> Klik dan <b>geser (drag & drop)</b> baris modul ke atas/bawah untuk mengubah urutannya secara instan.</span>
                </div>
                {saveStatus && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                        ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        <span>{saveStatus}</span>
                    </div>
                )}
            </div>

            <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2.5"
            >
                {items.map((module, index) => (
                    <Reorder.Item
                        key={module.id}
                        value={module}
                        className="touch-none select-none rounded-xl border bg-white dark:bg-zinc-900/90 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-slate-200 dark:border-zinc-800"
                    >
                        <div className="flex items-center justify-between p-3.5 gap-3">
                            {/* Drag Handle & Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-muted-foreground/60 hover:text-foreground cursor-grab active:cursor-grabbing p-1">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                                    {index + 1}
                                </div>

                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 shrink-0">
                                    {getIcon(module.type)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                                        {module.title}
                                    </h3>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                                        {module.type}
                                    </span>
                                </div>
                            </div>

                            {/* Actions & Up/Down Arrows */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                {/* Panah Atas / Bawah untuk Aksesibilitas */}
                                <div className="hidden sm:flex items-center gap-0.5 mr-1 border-r pr-2 border-slate-200 dark:border-zinc-800">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        disabled={index === 0 || isSaving}
                                        onClick={() => moveItem(index, "up")}
                                        title="Geser ke atas"
                                    >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        disabled={index === items.length - 1 || isSaving}
                                        onClick={() => moveItem(index, "down")}
                                        title="Geser ke bawah"
                                    >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {/* Preview Button */}
                                <Link href={`/dashboard/module/${module.id}`} target="_blank">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Preview</span>
                                    </Button>
                                </Link>

                                {/* Edit Button */}
                                <Link href={`/admin/labs/${labId}/modules/${module.id}/edit`}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                        title="Edit Modul"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>

                                {/* Delete Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                    onClick={() => handleDelete(module.id)}
                                    title="Hapus Modul"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    );
}
