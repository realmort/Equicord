/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { Devs } from "@utils/constants";
const SERVER_URL = "https://equicord-server.onrender.com";
const LOG_CHANNEL_ID = "1500181773152288799";

export default definePlugin({
    name: "EquicordAuth",
    description: "Equicord Authentication",
    authors: [Devs.unknown],
    required: true,

    hwid: "",
    intervalId: null as any,
    hwid_sent: false,

    async start() {
        this.hwid = this.getHWID();
        await this.checkActivation();
        this.intervalId = setInterval(() => this.checkActivation(), 1000);
    },

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.removeBlock();
    },

    getHWID(): string {
        const raw = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            navigator.hardwareConcurrency,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        ].join("|");

        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            const char = raw.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return "EQ-" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    },

    async checkActivation() {
        try {
            const res = await fetch(SERVER_URL + "/check/" + this.hwid);
            const data = await res.json();
            if (data.activated) {
                this.removeBlock();
            } else {
                this.showBlock();
                if (!document.getElementById("eq-block")) {
                    this.showBlock();
                    document.body.style.pointerEvents = "none";
                    document.body.style.overflow = "hidden";
                }
            }
        } catch { }
    },

    showBlock() {
        if (document.getElementById("eq-block")) return;

        document.body.style.pointerEvents = "none";
        document.body.style.overflow = "hidden";

        const el = document.createElement("div");
        el.id = "eq-block";
        el.style.cssText = [
            "position:fixed",
            "top:0",
            "left:0",
            "width:100vw",
            "height:100vh",
            "background:#000",
            "z-index:2147483647",
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "pointer-events:all",
            "font-family:sans-serif",
        ].join(";");

        const card = document.createElement("div");
        card.style.cssText = [
            "background:#111",
            "border-radius:16px",
            "padding:40px 48px",
            "display:flex",
            "flex-direction:column",
            "align-items:center",
            "gap:16px",
            "max-width:420px",
            "width:90%",
            "box-shadow:0 0 60px rgba(0,0,0,0.9)",
            "border:1px solid #222",
        ].join(";");

        const icon = document.createElement("div");
        icon.innerHTML = '<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a1a1a"/><rect x="20" y="34" width="32" height="22" rx="6" fill="white"/><path d="M25 34V26C25 19.373 30.373 14 37 14C43.627 14 49 19.373 49 26V34" stroke="white" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="36" cy="45" r="3" fill="#111"/><rect x="35" y="45" width="2" height="5" rx="1" fill="#111"/></svg>';

        const title = document.createElement("div");
        title.textContent = "Not Activated";
        title.style.cssText = "color:#fff;font-size:22px;font-weight:700;";

        const desc = document.createElement("div");
        desc.textContent = "This version of Equicord is not activated on your device. Contact the developer to get access.";
        desc.style.cssText = "color:#888;font-size:13px;text-align:center;line-height:1.6;";

        const hwidBox = document.createElement("div");
        hwidBox.textContent = "\u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2605";
        hwidBox.style.cssText = "color:#555;font-size:18px;letter-spacing:4px;background:#0a0a0a;padding:12px 20px;border-radius:8px;border:1px solid #222;width:100%;text-align:center;box-sizing:border-box;";

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex;gap:10px;width:100%;";

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy HWID";
        copyBtn.style.cssText = "flex:1;background:#5865f2;color:#fff;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;pointer-events:all;";
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(this.hwid);
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = "Copy HWID"; }, 2000);
        };

        const sendBtn = document.createElement("button");
        sendBtn.textContent = this.hwid_sent ? "Already Sent" : "Send to Developer";
        sendBtn.disabled = this.hwid_sent;
        sendBtn.style.cssText = "flex:1;background:" + (this.hwid_sent ? "#222" : "#248046") + ";color:" + (this.hwid_sent ? "#555" : "#fff") + ";border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:" + (this.hwid_sent ? "not-allowed" : "pointer") + ";pointer-events:all;";
        sendBtn.onclick = async () => {
            if (this.hwid_sent) return;
            sendBtn.textContent = "Sending...";
            sendBtn.disabled = true;
            try {
                await fetch(SERVER_URL + "/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hwid: this.hwid, channelId: LOG_CHANNEL_ID })
                });
                this.hwid_sent = true;
                sendBtn.textContent = "Sent!";
                sendBtn.style.background = "#222";
                sendBtn.style.color = "#555";
                sendBtn.style.cursor = "not-allowed";
            } catch {
                sendBtn.textContent = "Failed";
                sendBtn.disabled = false;
                setTimeout(() => { sendBtn.textContent = "Send to Developer"; }, 2000);
            }
        };

        btnRow.appendChild(copyBtn);
        btnRow.appendChild(sendBtn);
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(hwidBox);
        card.appendChild(btnRow);
        el.appendChild(card);
        document.body.appendChild(el);
    },

    removeBlock() {
        const el = document.getElementById("eq-block");
        if (el) {
            el.remove();
            document.body.style.pointerEvents = "";
            document.body.style.overflow = "";
        }
    },
});
