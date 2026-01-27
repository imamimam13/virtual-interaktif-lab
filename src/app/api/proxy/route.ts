import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const selector = req.nextUrl.searchParams.get("selector");

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();

        // 1. Inject <base> tag to fix relative links
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/'))}/`;

        let modifiedHtml = html.replace('<head>', `<head><base href="${baseUrl}" />`);

        // 2. Inject CSS to hide everything except the selector
        if (selector) {
            const css = `
                <style>
                    body > *:not(${selector}) { display: none !important; }
                    ${selector}, ${selector} * { display: block !important; visibility: visible !important; opacity: 1 !important; }
                    ${selector} { 
                        position: fixed !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100vw !important; 
                        height: 100vh !important; 
                        z-index: 9999 !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: black !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    /* Ensure iframes or game canvases fill the screen */
                    ${selector} iframe, ${selector} canvas {
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                    }
                </style>
            `;
            modifiedHtml = modifiedHtml.replace('</head>', `${css}</head>`);
        }

        return new NextResponse(modifiedHtml, {
            headers: {
                "Content-Type": "text/html",
            },
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
