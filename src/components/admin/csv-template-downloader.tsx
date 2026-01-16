"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadTemplate() {
    const handleDownload = () => {
        const headers = ["LabTitle", "Description", "Department (Exact Name)", "ModuleTitle", "Type (VIDEO/PDF/QUIZ)", "Content (URL or Quiz JSON)"];
        const rows = [
            ["Lab Audit Digital", "Simulasi Audit", "Akuntansi (S1)", "Intro Audit", "VIDEO", "https://youtube.com/watch?v=..."],
            ["Lab Audit Digital", "Simulasi Audit", "Akuntansi (S1)", "Manajemen Kas", "PDF", "https://example.com/modul.pdf"],
            ["Lab Audit Digital", "Simulasi Audit", "Akuntansi (S1)", "Kuis Harian", "QUIZ", JSON.stringify([{ question: "1+1?", options: ["1", "2"], answer: 1 }])]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(item => `"${item.toString().replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_lab_import.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download Template CSV
        </Button>
    );
}
