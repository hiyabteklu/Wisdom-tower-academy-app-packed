import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  APPWRITE_PATH_PREFIX,
  isAppwriteStoragePath,
  parseAppwriteFileId,
} from "@/lib/content";

/**
 * Proxy a learning-content PDF through our origin so the in-app reader
 * can use a same-origin blob (mobile-friendly).
 * Query: ?path=<storage_path>
 *
 * Supports:
 * - appwrite:FILE_ID (all packages)
 * - legacy Supabase storage paths (if any remain)
 *
 * HEAD: returns Content-Length when possible (size probe before download).
 */

function appwriteConfig() {
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
  const bucketId =
    process.env.APPWRITE_BUCKET_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ||
    "";
  return { endpoint, projectId, bucketId };
}

function appwriteViewUrl(fileId: string) {
  const { endpoint, projectId, bucketId } = appwriteConfig();
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/** HEAD: size probe only; do not download body when possible. */
export async function HEAD(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || path.includes("..")) {
    return new NextResponse(null, { status: 400 });
  }

  if (isAppwriteStoragePath(path) || path.startsWith(APPWRITE_PATH_PREFIX)) {
    const fileId =
      parseAppwriteFileId(path) || path.replace(/^appwrite:/i, "").trim();
    if (!fileId) return new NextResponse(null, { status: 400 });

    const { projectId, bucketId } = appwriteConfig();
    if (!projectId || !bucketId) return new NextResponse(null, { status: 500 });

    const viewUrl = appwriteViewUrl(fileId);
    try {
      // Prefer upstream HEAD
      let upstream = await fetch(viewUrl, {
        method: "HEAD",
        headers: { Accept: "application/pdf,*/*" },
        cache: "no-store",
      });
      let len = upstream.headers.get("Content-Length");

      // Some Appwrite setups ignore HEAD: try Range
      if ((!len || !upstream.ok) && upstream.status !== 404) {
        upstream = await fetch(viewUrl, {
          method: "GET",
          headers: { Accept: "application/pdf,*/*", Range: "bytes=0-0" },
          cache: "no-store",
        });
        const cr = upstream.headers.get("Content-Range");
        const m = cr?.match(/\/(\d+)\s*$/);
        if (m) len = m[1];
        else len = upstream.headers.get("Content-Length");
        // Drain tiny body so connection can close
        await upstream.arrayBuffer().catch(() => null);
      }

      if (!upstream.ok && upstream.status !== 206) {
        return new NextResponse(null, {
          status: upstream.status === 404 ? 404 : 502,
        });
      }

      const headers = new Headers({
        "Content-Type": "application/pdf",
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      });
      if (len) headers.set("Content-Length", len);
      return new NextResponse(null, { status: 200, headers });
    } catch {
      return new NextResponse(null, { status: 502 });
    }
  }

  // Legacy Supabase: no cheap HEAD; return 200 without length
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "private, max-age=60",
    },
  });
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // --- Appwrite ---
  if (isAppwriteStoragePath(path) || path.startsWith(APPWRITE_PATH_PREFIX)) {
    const fileId =
      parseAppwriteFileId(path) || path.replace(/^appwrite:/i, "").trim();
    if (!fileId) {
      return NextResponse.json({ error: "Invalid Appwrite file id" }, { status: 400 });
    }

    const { projectId, bucketId } = appwriteConfig();

    if (!projectId || !bucketId) {
      return NextResponse.json(
        {
          error:
            "Appwrite env missing. Set NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_BUCKET_ID on the host.",
        },
        { status: 500 }
      );
    }

    const viewUrl = appwriteViewUrl(fileId);

    try {
      const upstream = await fetch(viewUrl, {
        headers: { Accept: "application/pdf,*/*" },
        cache: "no-store",
      });

      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => "");
        return NextResponse.json(
          {
            error: `Appwrite file not readable (${upstream.status}). Check bucket id, file id, and that role "Any" has READ.`,
            detail: detail.slice(0, 200),
          },
          { status: upstream.status === 404 ? 404 : 502 }
        );
      }

      const buf = await upstream.arrayBuffer();
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(buf.byteLength),
          "Content-Disposition": 'inline; filename="document.pdf"',
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
          "Accept-Ranges": "bytes",
        },
      });
    } catch (e) {
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : "Failed to fetch Appwrite file",
        },
        { status: 502 }
      );
    }
  }

  // --- Legacy Supabase path (if any files remain) ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.storage
    .from("learning-content")
    .download(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 404 }
    );
  }

  const buf = await data.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.byteLength),
      "Content-Disposition": 'inline; filename="document.pdf"',
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
