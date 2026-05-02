/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { React } from "@webpack/common";
import { Devs } from "@utils/constants";

const SERVER_URL = "https://equicord-server.onrender.com";

function getHWID(): string {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL ?? 0) ?? "";
    const vendor = gl?.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL ?? 0) ?? "";

    const raw = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.hardwareConcurrency,
        renderer,
        vendor,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join("|");

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return `EQ-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
}

function BlockScreen({ hwid }: { hwid: string; }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(hwid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            backgroundColor: "#1e1f22",
            zIndex: 99999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "gg sans, Noto Sans, sans-serif",
        }}>
            <div style={{
                backgroundColor: "#2b2d31",
                borderRadius: "16px",
                padding: "48px 64px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
                maxWidth: "480px",
                width: "90%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
                <div style={{
                    width: "80px", height: "80px",
                    backgroundColor: "#ec4144",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                }}>🔒</div>

                <div style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>
                    Not Activated
                </div>

                <div style={{ fontSize: "14px", color: "#b5bac1", textAlign: "center", lineHeight: 1.6 }}>
                    This version of Equicord is not activated on your device.<br />
                    Contact the developer to get access.
                </div>

                <div style={{
                    backgroundColor: "#1e1f22",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontFamily: "monospace",
                    fontSize: "16px",
                    color: "#5865f2",
                    letterSpacing: "2px",
                    border: "1px solid #3f4147",
                }}>{hwid}</div>

                <button
                    onClick={handleCopy}
                    style={{
                        backgroundColor: "#5865f2",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}>
                    {copied ? "✅ Copied!" : "Copy HWID"}
                </button>
            </div>
        </div>
    );
}

export default definePlugin({
    name: "EquicordAuth",
    description: "Equicord Authentication",
    authors: [Devs.unknown],
    required: true,

    hwid: "",
    intervalId: null as any,

    async start() {
        this.hwid = getHWID();
        await this.checkActivation();
        this.intervalId = setInterval(() => this.checkActivation(), 1000);
    },

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.removeBlockScreen();
    },

    async checkActivation() {
        try {
            const res = await fetch(`${SERVER_URL}/check/${this.hwid}`);
            const data = await res.json();
            if (data.activated) {
                this.removeBlockScreen();
            } else {
                this.showBlockScreen();
            }
        } catch {
            // لو السيرفر ما رد نفضل على الحالة الحالية
        }
    },

    showBlockScreen() {
        if (document.getElementById("equicord-auth-block")) return;
        const div = document.createElement("div");
        div.id = "equicord-auth-block";
        document.body.appendChild(div);

        const root = (window as any).ReactDOM.createRoot(div);
        root.render(React.createElement(BlockScreen, { hwid: this.hwid }));
    },

    removeBlockScreen() {
        const el = document.getElementById("equicord-auth-block");
        if (el) el.remove();
    },
});
