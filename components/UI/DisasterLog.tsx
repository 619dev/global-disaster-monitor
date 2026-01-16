'use client'
import { DisasterEvent } from '../../types/disaster'
import { useEffect, useRef } from 'react'

export default function DisasterLog({ events }: { events: DisasterEvent[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new events arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div className="fixed bottom-14 left-4 w-96 h-64 bg-black/90 border border-red-500/30 rounded-lg p-2 overflow-hidden z-[900] shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur font-mono text-xs">
            <div className="absolute top-0 left-0 w-full bg-red-900/20 border-b border-red-500/30 p-1 px-2 text-red-400 font-bold tracking-wider flex justify-between items-center">
                <span>SYSTEM_LOG</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div ref={scrollRef} className="mt-6 h-[calc(100%-1.5rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                {events.slice().reverse().map((ev) => (
                    <div key={ev.id} className="mb-1 border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 transition-colors p-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-gray-500">[{new Date(ev.time).toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={`font-bold ${getTypeColor(ev.type)}`}>{ev.type.toUpperCase()}</span>
                        </div>
                        <div className="text-gray-300 break-words pl-[4.5rem] -mt-5">
                             {ev.title} <span className="text-gray-500">@ {ev.location}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function getTypeColor(type: string) {
    switch (type) {
        case 'earthquake': return 'text-red-500';
        case 'tsunami': return 'text-blue-500';
        case 'weather': return 'text-yellow-500';
        default: return 'text-white';
    }
}
