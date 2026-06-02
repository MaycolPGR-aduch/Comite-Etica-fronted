import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://comite-backend.onrender.com/api/v1";

const buildBackendUrl = (path: string) => {
  const base = BACKEND_BASE_URL.endsWith("/") ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/`;
  const relative = path.startsWith("/") ? path.slice(1) : path;
  return new URL(relative, base).toString();
};

const pickHeader = (headers: Headers, key: string) => {
  const value = headers.get(key);
  return value ?? undefined;
};

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      expedienteId: string;
      documentoId: string;
      mode: string;
    }>;
  },
) {
  const { expedienteId, documentoId, mode } = await context.params;
  if (mode !== "preview" && mode !== "descargar") {
    return NextResponse.json({ detail: "Modo no válido." }, { status: 400 });
  }

  const token = (await cookies()).get("ce_auth_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const backendUrl = buildBackendUrl(
    `/expedientes/${encodeURIComponent(expedienteId)}/documentos/${encodeURIComponent(documentoId)}/${mode}`,
  );

  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    redirect: "follow",
  });

  if (!backendResponse.ok) {
    let detail = `No se pudo ${mode === "preview" ? "previsualizar" : "descargar"} el documento.`;
    try {
      const errorBody = (await backendResponse.json()) as { detail?: string };
      if (typeof errorBody.detail === "string" && errorBody.detail.trim().length > 0) {
        detail = errorBody.detail;
      }
    } catch {
      // Ignorado: puede venir respuesta no JSON.
    }

    return NextResponse.json({ detail }, { status: backendResponse.status });
  }

  const outputHeaders = new Headers();
  const contentType = pickHeader(backendResponse.headers, "content-type");
  const contentDisposition = pickHeader(backendResponse.headers, "content-disposition");
  const contentLength = pickHeader(backendResponse.headers, "content-length");
  const cacheControl = pickHeader(backendResponse.headers, "cache-control");

  if (contentType) outputHeaders.set("content-type", contentType);
  if (contentDisposition) outputHeaders.set("content-disposition", contentDisposition);
  if (contentLength) outputHeaders.set("content-length", contentLength);
  if (cacheControl) outputHeaders.set("cache-control", cacheControl);

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: outputHeaders,
  });
}
