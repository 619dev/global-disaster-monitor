'use client'
import { DisasterEvent } from '../../types/disaster'
import { useEffect, useState } from 'react'

export default function DisasterTicker({ events }: { events: DisasterEvent[] }) {
    return (
        <div className="fixed bottom-0 left-0 w-full h-12 bg-black/80 backdrop-blur-md border-t border-red-900/50 flex items-center overflow-hidden z-[1000]">
            <div className="flex items-center absolute whitespace-nowrap animate-marquee">
                {events.length === 0 && <span className="text-gray-500 mx-4">Connecting to Global Disaster Monitoring Network...</span>}
                {events.map((ev) => (
                    <div key={ev.id} className="inline-flex items-center mx-6">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getEventColorClass(ev.type)} animate-pulse`}></span>
                        <span className="text-red-50 font-mono text-sm">
                            <span className="font-bold text-red-400">[{ev.type.toUpperCase()}]</span> {ev.title} @ {ev.location} - {new Date(ev.time).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
                {/* Duplicate for seamless loop if needed, but CSS marquee usually needs double content or resets */}
                {events.length > 0 && events.map((ev) => (
                    <div key={`${ev.id}-dup`} className="inline-flex items-center mx-6">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getEventColorClass(ev.type)} animate-pulse`}></span>
                        <span className="text-red-50 font-mono text-sm">
                            <span className="font-bold text-red-400">[{ev.type.toUpperCase()}]</span> {ev.title} @ {ev.location} - {new Date(ev.time).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    )
}

function getEventColorClass(type: string) {
    switch (type) {
        case 'earthquake': return 'bg-red-500 shadow-red-500/50 shadow-lg';
        case 'tsunami': return 'bg-blue-500 shadow-blue-500/50 shadow-lg';
        case 'weather': return 'bg-yellow-500 shadow-yellow-500/50 shadow-lg';
        default: return 'bg-white';
    }
}
