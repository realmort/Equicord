/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { Devs } from "@utils/constants";
const SERVER_URL = "https://equicord-server.onrender.com";
const LOG_CHANNEL_ID = "1500181773152288799";

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

async function sendHWIDToBot(hwid: string) {
    try {
        await fetch(`${SERVER_URL}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hwid, channelId: LOG_CHANNEL_ID })
        });
    } catch { }
}

function showBlockScreen(hwid: string) {
    if (document.getElementById("equicord-auth-block")) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
    document.body.style.userSelect = "none";

    // CSS للخلفية المتحركة
    const style = document.createElement("style");
    style.id = "equicord-auth-style";
    style.textContent = `
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        #equicord-auth-block {
            pointer-events: all !important;
            user-select: auto !important;
        }
        #equicord-copy-btn:hover {
            background-color: #4752c4 !important;
            transform: translateY(-1px);
            transition: all 0.2s;
        }
        #equicord-send-btn:hover {
            background-color: #2d7c46 !important;
            transform: translateY(-1px);
            transition: all 0.2s;
        }
    `;
    document.head.appendChild(style);

    const maskedHwid = hwid.slice(0, 3) + "•".repeat(hwid.length - 3);

    const div = document.createElement("div");
    div.id = "equicord-auth-block";

    div.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: linear-gradient(-45deg, #1a1b1e, #2b2d31, #1e1f22, #23252a);
            background-size: 400% 400%;
            animation: gradientBG 8s ease infinite;
            z-index: 99999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: gg sans, Noto Sans, sans-serif;
            pointer-events: all;
        ">
            <div style="
                background-color: rgba(43, 45, 49, 0.95);
                border-radius: 20px;
                padding: 48px 64px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                border: 1px solid rgba(255,255,255,0.05);
                animation: fadeIn 0.4s ease;
            ">
                <!-- أيقونة القفل SVG -->
                <div style="animation: pulse 3s ease-in-out infinite;">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="40" fill="#EC4144"/>
                        <rect x="24" y="38" width="32" height="22" rx="4" fill="#FEE75C"/>
                        <path d="M28 38V30C28 22.268 34.268 16 42 16C42 16 52 16 52 30V38" stroke="#FEE75C" stroke-width="4" stroke-linecap="round" fill="none"/>
                        <circle cx="40" cy="49" r="3" fill="#EC4144"/>
                        <rect x="39" y="49" width="2" height="5" rx="1" fill="#EC4144"/>
                    </svg>
                </div>

                <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Not Activated
                </div>

                <div style="font-size: 14px; color: #b5bac1; text-align: center; line-height: 1.7;">
                    This version of Equicord is not activated on your device.<br/>
                    Contact the developer to get access.
                </div>

                <div style="
                    background-color: #1e1f22;
                    border-radius: 10px;
                    padding: 14px 24px;
                    font-family: monospace;
                    font-size: 18px;
                    color: #5865f2;
                    letter-spacing: 3px;
                    border: 1px solid #3f4147;
                    width: 100%;
                    text-align: center;
                ">${maskedHwid}</div>

                <div style="display: flex; gap: 12px; width: 100%;">
                    <button id="equicord-copy-btn" style="
                        background-color: #5865f2;
                        color: #ffffff;
                        border: none;
                        border-radius: 10px;
                        padding: 12px 0;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        flex: 1;
                        pointer-events: all;
                        transition: all 0.2s;
                    ">Copy HWID</button>

                    <button id="equicord-send-btn" style="
                        background-color: #248046;
                        color: #ffffff;
                        border: none;
                        border-radius: 10px;
                        padding: 12px 0;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        flex: 1;
                        pointer-events: all;
                        transition: all 0.2s;
                    ">Send to Developer</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(div);

    // زر Copy
    document.getElementById("equicord-copy-btn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(hwid);
        const btn = document.getElementById("equicord-copy-btn");
        if (btn) {
            btn.textContent = "✅ Copied!";
            setTimeout(() => { btn.textContent = "Copy HWID"; }, 2000);
        }
    });

    // زر Send to Developer
    document.getElementById("equicord-send-btn")?.addEventListener("click", async () => {
        const btn = document.getElementById("equicord-send-btn");
        if (btn) {
            btn.textContent = "Sending...";
            btn.setAttribute("disabled", "true");
            await sendHWIDToBot(hwid);
            btn.textContent = "✅ Sent!";
            setTimeout(() => {
                btn.textContent = "Send to Developer";
                btn.removeAttribute("disabled");
            }, 3000);
        }
    });
}

function removeBlockScreen() {
    const el = document.getElementById("equicord-auth-block");
    const style = document.getElementById("equicord-auth-style");
    if (el) {
        el.remove();
        style?.remove();
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
                // لو حد حذف الشاشة نعيدها
                if (!document.getElementById("equicord-auth-block")) {
                    showBlockScreen(this.hwid);
                    document.body.style.pointerEvents = "none";
                    document.documentElement.style.overflow = "hidden";
                }
            }
        } catch {
            // لو السيرفر ما رد نفضل على الحالة الحالية
        }
    },
});
