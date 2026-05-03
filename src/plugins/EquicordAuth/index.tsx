/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
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

function showBlockScreen(hwid: string) {
    if (document.getElementById("equicord-auth-block")) return;

    // منع أي تفاعل مع Discord
    document.documentElement.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
    document.body.style.userSelect = "none";

    const div = document.createElement("div");
    div.id = "equicord-auth-block";
    div.style.pointerEvents = "all";
    div.style.userSelect = "auto";

    div.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background-color: #1e1f22;
            z-index: 99999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: gg sans, Noto Sans, sans-serif;
            pointer-events: all;
            user-select: none;
        ">
            <div style="
                background-color: #2b2d31;
                border-radius: 16px;
                padding: 48px 64px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            ">
                <div style="
                    width: 80px; height: 80px;
                    background-color: #ec4144;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                ">🔒</div>

                <div style="font-size: 24px; font-weight: 700; color: #ffffff;">
                    Not Activated
                </div>

                <div style="font-size: 14px; color: #b5bac1; text-align: center; line-height: 1.6;">
                    This version of Equicord is not activated on your device.<br/>
                    Contact the developer to get access.
                </div>

                <div style="
                    background-color: #1e1f22;
                    border-radius: 8px;
                    padding: 12px 20px;
                    font-family: monospace;
                    font-size: 16px;
                    color: #5865f2;
                    letter-spacing: 2px;
                    border: 1px solid #3f4147;
                ">${hwid}</div>

                <button id="equicord-copy-btn" style="
                    background-color: #5865f2;
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    pointer-events: all;
                ">Copy HWID</button>
            </div>
        </div>
    `;

    document.body.appendChild(div);

    document.getElementById("equicord-copy-btn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(hwid);
        const btn = document.getElementById("equicord-copy-btn");
        if (btn) {
            btn.textContent = "✅ Copied!";
            setTimeout(() => { btn.textContent = "Copy HWID"; }, 2000);
        }
    });
}

function removeBlockScreen() {
    const el = document.getElementById("equicord-auth-block");
    if (el) {
        el.remove();
        document.documentElement.style.overflow = "";
        document.body.style.pointerEvents = "";
        document.body.style.userSelect = "";
    }
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
        removeBlockScreen();
    },

    async checkActivation() {
        try {
            const res = await fetch(`${SERVER_URL}/check/${this.hwid}`);
            const data = await res.json();
            if (data.activated) {
                removeBlockScreen();
            } else {
                showBlockScreen(this.hwid);
            }
        } catch {
            // لو السيرفر ما رد نفضل على الحالة الحالية
        }
    },
});
