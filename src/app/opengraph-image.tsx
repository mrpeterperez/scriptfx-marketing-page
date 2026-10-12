import { ImageResponse } from "next/og";
export const alt = "ScriptFX — Writing. Production. Market.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{ background: "#101010", color: "#f5f4ef", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70 }}><div style={{ fontSize: 42 }}>ScriptFX</div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ fontSize: 70, letterSpacing: -2 }}>One story. Every chapter.</div><div style={{ fontSize: 28, marginTop: 30, color: "#aaa" }}>Writing. Production. Market.</div></div><div style={{ fontSize: 20, color: "#aaa" }}>Screenwriting software for your next chapter.</div></div>, size); }
