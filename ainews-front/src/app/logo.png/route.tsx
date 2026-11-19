import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b1a16",
          color: "#f7f3d9",
          fontSize: 300,
          fontWeight: 900,
          fontFamily: "serif",
        }}
      >
        M
      </div>
    ),
    { width: 512, height: 512 },
  );
}
