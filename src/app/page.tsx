import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight, Atom, BookOpen, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between backdrop-blur-md bg-white/30 dark:bg-black/30 sticky top-0 z-50 border-b container mx-auto">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Atom className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">VirtualLab<span className="text-primary">.UWB</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            Labs
          </Link>
          <Link href="/auth/login">
            <Button size="sm" variant="default">Login</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                  Laboratorium Virtual <br /> Universitas Wira Bhakti
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Platform pembelajaran interaktif dan praktikum virtual untuk mahasiswa.
                  Jelajahi lab Manajemen Pemasaran, SDM, dan lainnya secara real-time.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button className="h-12 px-8 text-lg rounded-full" size="lg">
                    Mulai Belajar <MoveRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo/labs">
                  <Button variant="secondary" className="h-12 px-8 text-lg rounded-full">
                    Lihat Demo
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="h-12 px-8 text-lg rounded-full">
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3">
              <div className="space-y-4 text-center">
                <div className="inline-block p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Atom className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Virtual Labs</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Praktikum simulasi yang mendalam untuk berbagai program studi, tersedia kapan saja.
                </p>
              </div>
              <div className="space-y-4 text-center">
                <div className="inline-block p-3 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Trophy className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Gamified Learning</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Raih poin dan penghargaan saat Anda menyelesaikan modul dan kuis interaktif.
                </p>
              </div>
              <div className="space-y-4 text-center">
                <div className="inline-block p-3 rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Materi Lengkap</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Akses modul pembelajaran, pdf, dan video tutorial yang disusun oleh dosen ahli.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-sm text-gray-500">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 mx-auto">
          <p>© 2026 Universitas Wira Bhakti. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
