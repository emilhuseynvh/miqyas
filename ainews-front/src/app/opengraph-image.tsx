import { ImageResponse } from "next/og";

export const alt = "Miqyas — xəbərlər bir yerdə";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f3d9",
          color: "#1b1a16",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 168, fontWeight: 900, letterSpacing: -6 }}>MİQYAS</div>
        <div style={{ marginTop: 24, width: 720, borderTop: "4px dashed #1b1a16" }} />
      </div>
    ),
    size,
  );
}
