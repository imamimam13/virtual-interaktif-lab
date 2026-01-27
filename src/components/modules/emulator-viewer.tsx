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

            // Cleanup global EJS variables to prevent "Identifier already declared" errors
            if ((window as any).EJS_player) delete (window as any).EJS_player;
            if ((window as any).EJS_core) delete (window as any).EJS_core;
            if ((window as any).EJS_pathtodata) delete (window as any).EJS_pathtodata;
            if ((window as any).EJS_gameUrl) delete (window as any).EJS_gameUrl;
        };
    }, []);

    const initEmulator = () => {
        if (!containerRef.current) return;

        // cleanup previous instance if any
        const existingScript = document.getElementById("emulatorjs-script");
        if (existingScript) existingScript.remove();

        // Clear container
        containerRef.current.innerHTML = "";

        // Define EJS configuration
        // Use window assignment with unique scope handling if possible, but standard EJS requires global
        (window as any).EJS_player = "#game-container";
        // Map common system names to EJS core names if needed, but 'nes' is standard.
        // Special mapping for snes, gba, etc.
        (window as any).EJS_core = system;
        (window as any).EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/"; // Official CDN
        (window as any).EJS_gameUrl = romUrl;
        (window as any).EJS_biosUrl = ""; // Explicitly empty to prevent default lookup issues

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
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                    <button
                        onClick={initEmulator}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                        START GAME
                    </button>
                    <p className="absolute bottom-10 text-white text-xs opacity-70">
                        System: {system} | ROM: {romUrl.split('/').pop()}
                    </p>
                </div>
            )}
            <div id="game-container" ref={containerRef} className="w-full h-full"></div>
        </div>
    );
}
