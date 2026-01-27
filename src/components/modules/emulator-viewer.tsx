"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface EmulatorViewerProps {
    romUrl: string;
    system?: string; // e.g., 'nes', 'snes', 'gba', 'sega'
}

declare global {
    interface Window {
        EJS_player: any;
        EJS_core: string;
        EJS_pathtodata: string;
        EJS_gameUrl: string;
    }
}

export default function EmulatorViewer({ romUrl, system = "nes" }: EmulatorViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Cleanup function for when component unmounts
        return () => {
            const existingScript = document.getElementById("emulatorjs-script");
            if (existingScript) existingScript.remove();
        };
    }, []);

    const initEmulator = () => {
        if (!containerRef.current) return;

        // Clear container
        containerRef.current.innerHTML = "";

        // Define EJS configuration
        (window as any).EJS_player = "#game-container";
        (window as any).EJS_core = system; // 'nes', 'snes', etc.
        (window as any).EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/"; // Official CDN
        (window as any).EJS_gameUrl = romUrl;

        // Create script tag dynamically to ensure it runs after config
        const script = document.createElement("script");
        script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
        script.id = "emulatorjs-script";
        script.async = true;

        containerRef.current.appendChild(script);
        setIsLoaded(true);
    };

    return (
        <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden relative">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                        onClick={initEmulator}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                        START GAME
                    </button>
                </div>
            )}
            <div id="game-container" ref={containerRef} className="w-full h-full"></div>
        </div>
    );
}
