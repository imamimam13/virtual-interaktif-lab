"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SsoLoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<"verifying" | "signing_in" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const token = searchParams.get("token");
    const redirectUrl = searchParams.get("redirectUrl") || "/dashboard";

    useEffect(() => {
        let isMounted = true;

        async function processSso() {
            if (!token) {
                if (isMounted) {
                    setStatus("error");
                    setErrorMessage("Token otentikasi SSO tidak ditemukan.");
                }
                return;
            }

            try {
                if (isMounted) setStatus("signing_in");

                const result = await signIn("credentials", {
                    ssoToken: token,
                    isSso: "true",
                    redirect: false,
                });

                if (!isMounted) return;

                if (result?.ok) {
                    setStatus("success");
                    // Short delay for smooth visual transition
                    setTimeout(() => {
                        const target = redirectUrl.startsWith("/") ? redirectUrl : "/dashboard";
                        router.replace(target);
                    }, 800);
                } else {
                    setStatus("error");
                    setErrorMessage(result?.error || "Verifikasi SSO SIAKAD gagal atau sesi telah kedaluwarsa.");
                }
            } catch (err: any) {
                if (isMounted) {
                    setStatus("error");
                    setErrorMessage(err?.message || "Terjadi kesalahan saat menghubungkan dengan SIAKAD.");
                }
            }
        }

        processSso();

        return () => {
            isMounted = false;
        };
    }, [token, redirectUrl, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/10 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl text-center relative z-10 text-white">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-inner">
                        <Sparkles className="h-8 w-8 text-indigo-300 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    SIAKAD Single Sign-On
                </h1>
                <p className="text-sm text-indigo-200/80 mb-6">
                    Menghubungkan sesi Anda dari Sistem Informasi Akademik
                </p>

                {status === "verifying" && (
                    <div className="space-y-4 py-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mx-auto" />
                        <p className="text-sm text-slate-300 font-medium">Memverifikasi tanda tangan digital SSO...</p>
                    </div>
                )}

                {status === "signing_in" && (
                    <div className="space-y-4 py-4">
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mx-auto" />
                        <p className="text-sm text-slate-300 font-medium">Membuka sesi Virtual Interaktif Lab...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-emerald-300">Autentikasi Berhasil!</p>
                            <p className="text-xs text-slate-300 mt-1">Mengalihkan ke modul praktikum...</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-5 py-2 animate-in fade-in duration-300">
                        <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center mx-auto">
                            <AlertCircle className="h-7 w-7 text-red-400" />
                        </div>
                        <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3 text-left">
                            <p className="text-xs font-medium text-red-300">Gagal Masuk via SSO</p>
                            <p className="text-xs text-red-200/80 mt-1">{errorMessage}</p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            <Link href="/auth/login">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                                    Masuk Manual via Login Page <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SsoLoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
            }
        >
            <SsoLoginContent />
        </Suspense>
    );
}
