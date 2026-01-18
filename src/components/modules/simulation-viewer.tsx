"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SimulationViewerProps {
    url: string;
}

export default function SimulationViewer({ url }: SimulationViewerProps) {
    const [src, setSrc] = useState(url);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let finalUrl = url;

        // PhET Localization Logic
        if (url.includes("phet.colorado.edu")) {
            const urlObj = new URL(url);
            // Append ?locale=in if not present
            if (!urlObj.searchParams.has("locale")) {
                urlObj.searchParams.set("locale", "in");
            }
            finalUrl = urlObj.toString();
        }

        setSrc(finalUrl);
    }, [url]);

    return (
        <div className="w-full h-[calc(100vh-12rem)] min-h-[500px] bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-900 z-10 transition-opacity duration-500">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Memuat Simulasi...</p>
                    </div>
                </div>
            )}
            <iframe
                src={src}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
