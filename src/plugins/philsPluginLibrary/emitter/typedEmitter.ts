/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import EventEmitter from "events";

type EventMap = Record<string, (...args: any[]) => any>;

type TypedEmitter<T extends EventMap> = {
    on<K extends keyof T>(event: K, listener: T[K]): TypedEmitter<T>;
    once<K extends keyof T>(event: K, listener: T[K]): TypedEmitter<T>;
    off<K extends keyof T>(event: K, listener: T[K]): TypedEmitter<T>;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
    removeListener<K extends keyof T>(event: K, listener: T[K]): TypedEmitter<T>;
    removeAllListeners<K extends keyof T>(event?: K): TypedEmitter<T>;
    addListener<K extends keyof T>(event: K, listener: T[K]): TypedEmitter<T>;
    listeners<K extends keyof T>(event: K): T[K][];
    listenerCount<K extends keyof T>(event: K): number;
} & EventEmitter;

export default TypedEmitter;
