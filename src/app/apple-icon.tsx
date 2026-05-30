import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  // Resolve base URL — VERCEL_URL in production, localhost in dev
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;

  const res = await fetch(`${base}/unhinged/logo-unhinged-green.png`);
  const buf = await res.arrayBuffer();
  const src = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#030303",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    ),
    { ...size }
  );
}
