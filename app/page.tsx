'use client'

import { useEffect, useState } from 'react'
import Map from '../components/Map/Map'
import DisasterTicker from '../components/UI/DisasterTicker'
import { getDisasterStream } from '../services/DisasterStream'
import { DisasterEvent } from '../types/disaster'
import { AlertTriangle, Radio } from 'lucide-react'

export default function Home() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [status, setStatus] = useState('OFFLINE');

  useEffect(() => {
    const stream = getDisasterStream();
    if (!stream) return;

    setStatus('CONNECTED');

    const unsubscribe = stream.on((event) => {
      setEvents(prev => {
        // Dedup by ID
        if (prev.find(e => e.id === event.id)) return prev;
        return [event, ...prev].slice(0, 50); // Keep last 50 events
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update "now" every minute to refresh the 12h filter
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter events for map: Only show events from last 12 hours
  const mapEvents = events
    .filter(ev => {
      const eventTime = new Date(ev.time).getTime();
      return (now - eventTime) < 12 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Ticker gets recent 20 events, regardless of age (or maybe same filter?)
  // Let's keep ticker showing what the map shows, or just latest 20.
  const tickerEvents = events
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-[1000] pointer-events-none p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-widest text-red-500 font-mono flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              GLOBAL DISASTER MONITOR
            </h1>
            <p className="text-xs text-red-400/70 font-mono mt-1">REAL-TIME SURVEILLANCE SYSTEM // ASTRBOT-PLUGIN REF</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-green-400">SYSTEM STATUS: {status}</span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              LAT: {0.00} LONG: {0.00}
            </div>
          </div>
        </div>
      </div>

      {/* Map Layer */}
      <div className="flex-grow w-full relative z-0 h-screen">
        <Map events={mapEvents} />
      </div>

      {/* Ticker Layer */}
      <DisasterTicker events={tickerEvents} />

      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none z-[999] opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none z-[999] bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-1 w-full animate-scanline"></div>

      <style jsx global>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>
    </main>
  )
}
