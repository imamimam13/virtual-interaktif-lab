import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, GraduationCap, Users } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b container mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
                <section className="space-y-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Tentang Virtual Lab UWB</h1>
                    <p className="text-xl text-muted-foreground">
                        Mewujudkan pembelajaran praktis tanpa batas ruang dan waktu.
                    </p>
                </section>

                <section className="grid gap-8 md:grid-cols-3">
                    <div className="p-6 border rounded-xl bg-card space-y-3">
                        <Building2 className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-lg">Fasilitas Modern</h3>
                        <p className="text-sm text-muted-foreground">
                            Simulasi laboratorium lengkap yang mencerminkan kondisi industri nyata.
                        </p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card space-y-3">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-lg">Kurikulum Terintegrasi</h3>
                        <p className="text-sm text-muted-foreground">
                            Modul praktikum yang selaras dengan mata kuliah program studi.
                        </p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card space-y-3">
                        <Users className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-lg">Kolaborasi</h3>
                        <p className="text-sm text-muted-foreground">
                            Fitur yang memungkinkan mahasiswa berdiskusi dan belajar bersama dosen.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Visi & Misi</h2>
                    <div className="prose dark:prose-invert">
                        <p>
                            Universitas Wira Bhakti berkomitmen untuk menghadirkan teknologi pendidikan
                            terdepan. Virtual Lab ini dibangun untuk memastikan setiap mahasiswa
                            mendapatkan pengalaman praktikum yang berkualitas, aman, dan dapat diakses
                            dari mana saja.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
