import { DisasterEvent } from '../types/disaster';

type DisasterCallback = (event: DisasterEvent) => void;

class DisasterStreamService {
    private callbacks: Set<DisasterCallback> = new Set();
    private connections: Map<string, WebSocket> = new Map();
    private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        this.connectAll();
    }

    public on(callback: DisasterCallback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    private emit(event: DisasterEvent) {
        this.callbacks.forEach(cb => cb(event));
    }

    private connectAll() {
        this.connectToWolfxJMA();
        this.connectToWolfxCENC();
        this.connectToP2PQuake();
    }

    private setupConnection(name: string, url: string, handler: (data: any) => void) {
        if (this.connections.has(name)) return;

        console.log(`[DisasterStream] Connecting to ${name}...`);
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log(`[DisasterStream] Connected to ${name}`);
                if (this.reconnectTimers.has(name)) {
                    clearTimeout(this.reconnectTimers.get(name));
                    this.reconnectTimers.delete(name);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data as string);
                    handler(data);
                } catch (e) {
                    console.error(`[DisasterStream] Error parsing message from ${name}`, e);
                }
            };

            ws.onclose = () => {
                console.log(`[DisasterStream] Disconnected from ${name}, reconnecting in 5s...`);
                this.connections.delete(name);
                const timer = setTimeout(() => this.setupConnection(name, url, handler), 5000);
                this.reconnectTimers.set(name, timer);
            };

            ws.onerror = (err) => {
                console.error(`[DisasterStream] Error in ${name}:`, err);
                ws.close(); // Trigger onclose
            };

            this.connections.set(name, ws);
        } catch (e) {
            console.error(`[DisasterStream] Failed to connect to ${name}`, e);
        }
    }

    private connectToWolfxJMA() {
        this.setupConnection('Wolfx-JMA-EEW', 'wss://ws-api.wolfx.jp/jma_eew', (data) => {
            // Logic to parse Wolfx JMA EEW
            // Note: Data structure varies. Assuming standard fields based on common JMA formats.
            if (data.type === 'heartbeat' || data.type === 'pong') return;

            // Basic mapping - refine as needed
            if (data.Control && data.Control.Title) {
                this.emit({
                    id: `wolfx-jma-${Date.now()}`,
                    type: 'earthquake',
                    title: data.Control.Title,
                    location: data.Earthquake?.Hypocenter?.Name || 'Japan Region',
                    latitude: parseFloat(data.Earthquake?.Hypocenter?.Latitude || '0'),
                    longitude: parseFloat(data.Earthquake?.Hypocenter?.Longitude || '0'),
                    magnitude: parseFloat(data.Earthquake?.Hypocenter?.Magnitude || '0'),
                    depth: parseInt(data.Earthquake?.Hypocenter?.Depth || '0'),
                    time: data.Head?.ReportDateTime || new Date().toISOString(),
                    source: 'Wolfx (JMA)',
                    description: data.Head?.Headline?.Text || 'Earthquake Early Warning'
                });
            }
        });
    }

    private connectToWolfxCENC() {
        this.setupConnection('Wolfx-CENC-EEW', 'wss://ws-api.wolfx.jp/cenc_eew', (data) => {
            if (data.type === 'heartbeat' || data.type === 'pong') return;

            // CENC format is often just simple JSON
            if (data.type === 'cenc_eew' || data.Hypocenter) {
                this.emit({
                    id: `wolfx-cenc-${Date.now()}`,
                    type: 'earthquake',
                    title: `Earthquake Warning (China)`,
                    location: data.Hypocenter?.Location || 'China Region',
                    latitude: parseFloat(data.Hypocenter?.Latitude || '0'),
                    longitude: parseFloat(data.Hypocenter?.Longitude || '0'),
                    magnitude: parseFloat(data.Hypocenter?.Magnitude || '0'),
                    time: data.Hypocenter?.Time || new Date().toISOString(),
                    source: 'Wolfx (CENC)',
                    description: `M${data.Hypocenter?.Magnitude} Earthquake at ${data.Hypocenter?.Location}`
                });
            }
        });
    }

    private connectToP2PQuake() {
        this.setupConnection('P2P-Quake', 'wss://api.p2pquake.net/v2/ws', (data) => {
            // P2P Quake Format: https://www.p2pquake.net/json_api_v2/
            if (data.code === 551) { // 551 is Earthquake Information
                const info = data.earthquake;
                const hypo = info.hypocenter;
                this.emit({
                    id: data.id,
                    type: 'earthquake',
                    title: 'Earthquake Information (P2P)',
                    location: hypo.name,
                    latitude: hypo.latitude === -200 ? 0 : hypo.latitude, // -200 means unknown
                    longitude: hypo.longitude === -200 ? 0 : hypo.longitude,
                    magnitude: hypo.magnitude === -1 ? undefined : hypo.magnitude,
                    depth: hypo.depth === -1 ? undefined : hypo.depth,
                    time: info.time,
                    source: 'P2P Quake',
                    description: `Max Scale: ${info.maxScale / 10}`
                });
            } else if (data.code === 556) { // EEW
                if (data.test) return;
                this.emit({
                    id: data.id,
                    type: 'earthquake',
                    title: 'Earthquake Early Warning (P2P)',
                    location: data.area_conf || 'Unknown',
                    latitude: 0, // P2P EEW often doesn't have exact lat/long immediately
                    longitude: 0,
                    time: data.time,
                    source: 'P2P Quake (EEW)',
                    description: 'EEW Received'
                });
            }
        });
    }
}

// Singleton instance
let instance: DisasterStreamService;

export function getDisasterStream() {
    if (typeof window === 'undefined') return null; // Client-side only
    if (!instance) {
        instance = new DisasterStreamService();
    }
    return instance;
}
