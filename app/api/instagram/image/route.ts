import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const isAllowedHost = (hostname: string) => {
    const host = hostname.toLowerCase();
    const allowedSuffixes = ["instagram.com", "fbcdn.net", "cdninstagram.com"];
    return allowedSuffixes.some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
};

const isAllowedImageUrl = (url: URL) => {
    return url.protocol === "https:" && isAllowedHost(url.hostname);
};

const fetchWithValidatedRedirects = async (
    initialUrl: URL,
    maxRedirects = 5
): Promise<Response> => {
    let currentUrl = initialUrl;

    for (let i = 0; i <= maxRedirects; i++) {
        if (!isAllowedImageUrl(currentUrl)) {
            throw new Error("Invalid redirect host");
        }

        const response = await fetch(currentUrl.toString(), { redirect: "manual" });

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (!location) {
                throw new Error("Redirect missing location");
            }
            currentUrl = new URL(location, currentUrl);
            continue;
        }

        return response;
    }

    throw new Error("Too many redirects");
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get("src");

    if (!src) {
        return NextResponse.json({ error: "Missing src" }, { status: 400 });
    }

    let url: URL;
    try {
        url = new URL(src);
    } catch {
        return NextResponse.json({ error: "Invalid src" }, { status: 400 });
    }

    if (url.protocol !== "https:" || !isAllowedHost(url.hostname)) {
        return NextResponse.json({ error: "Invalid image host" }, { status: 400 });
    }

    try {
        const response = await fetchWithValidatedRedirects(url);
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
            return NextResponse.json({ error: "Invalid image response" }, { status: 502 });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(new Uint8Array(arrayBuffer));
        let output: Buffer = buffer;
        let outputType = contentType;

        if (contentType.includes("image/webp")) {
            output = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
            outputType = "image/jpeg";
        }

        const outputBytes = new Uint8Array(output);
        return new NextResponse(outputBytes, {
            headers: {
                "Content-Type": outputType,
                "Cache-Control": "public, max-age=3600, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Instagram image proxy error:", error);
        return NextResponse.json({ error: "Image proxy failed" }, { status: 502 });
    }
}
