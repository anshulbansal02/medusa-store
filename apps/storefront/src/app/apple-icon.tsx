import { ImageResponse } from "next/og";

export const size = {
  height: 180,
  width: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f8f3ec",
        color: "#3b221d",
        display: "flex",
        fontFamily: "serif",
        fontSize: 118,
        height: "100%",
        justifyContent: "center",
        lineHeight: 1,
        width: "100%",
      }}
    >
      T
    </div>,
    size,
  );
}
