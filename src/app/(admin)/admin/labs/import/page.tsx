"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { bulkImportLabs } from "@/lib/import-actions";
import DownloadTemplate from "@/components/admin/csv-template-downloader";
import { Loader2, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("IDLE");
            parseFile(e.target.files[0]);
        }
    };

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setPreview(results.data);
            },
            error: (error) => {
                console.error(error);
                alert("Error parsing CSV");
            }
        });
    };

    const handleImport = async () => {
        if (!preview.length) return;
        setIsLoading(true);

        // Map CSV headers to internal keys
        const formattedData = preview.map((row: any) => ({
            labTitle: row["LabTitle"] || row["labTitle"],
            description: row["Description"] || row["description"],
            departmentName: row["Department (Exact Name)"] || row["Department"],
            moduleTitle: row["ModuleTitle"] || row["moduleTitle"],
            moduleType: row["Type (VIDEO/PDF/QUIZ)"] || row["Type"],
            content: row["Content (URL or Quiz JSON)"] || row["Content"]
        }));

        const res = await bulkImportLabs(formattedData);
        setIsLoading(false);

        if (res.success) {
            setStatus("SUCCESS");
            setTimeout(() => router.push("/admin/labs"), 2000);
        } else {
            setStatus("ERROR");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Import Lab & Modul</h1>
                <p className="text-muted-foreground">Upload file CSV untuk membuat banyak lab sekaligus.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. Download Template</CardTitle>
                    <CardDescription>Gunakan template ini agar format data sesuai.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DownloadTemplate />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Upload CSV</CardTitle>
                    <CardDescription>Pilih file CSV yang sudah diisi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="max-w-sm"
                        />
                        {file && (
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                {preview.length} baris data terdeteksi
                            </div>
                        )}
                    </div>

                    {preview.length > 0 && (
                        <div className="border rounded-md p-4 bg-muted/50 max-h-[300px] overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="font-bold border-b">
                                    <tr>
                                        <th className="p-2">Lab Title</th>
                                        <th className="p-2">Department</th>
                                        <th className="p-2">Module</th>
                                        <th className="p-2">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.slice(0, 5).map((row: any, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted">
                                            <td className="p-2">{row["LabTitle"] || row["LabTitle"]}</td>
                                            <td className="p-2">{row["Department (Exact Name)"]}</td>
                                            <td className="p-2">{row["ModuleTitle"]}</td>
                                            <td className="p-2">{row["Type (VIDEO/PDF/QUIZ)"]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {preview.length > 5 && (
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    ...dan {preview.length - 5} baris lainnya.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={handleImport}
                    disabled={!file || isLoading || status === "SUCCESS"}
                    className={status === "SUCCESS" ? "bg-green-600" : ""}
                >
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : status === "SUCCESS" ? (
                        <><CheckCircle className="mr-2 h-4 w-4" /> Berhasil! Redirecting...</>
                    ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Start Import</>
                    )}
                </Button>
            </div>

            {status === "ERROR" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" /> Gagal melakukan import. Pastikan nama Prodi sesuai dengan database.
                </div>
            )}
        </div>
    );
}
