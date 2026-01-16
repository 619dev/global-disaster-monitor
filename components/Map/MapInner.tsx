'use client'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DisasterEvent } from '../../types/disaster'
import { useEffect, useState } from 'react'

interface MapProps {
    events: DisasterEvent[];
}

function MapController({ center }: { center?: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 4, { duration: 2 });
        }
    }, [center, map]);
    return null;
}

export default function MapInner({ events }: MapProps) {
    const [activeEvent, setActiveEvent] = useState<DisasterEvent | null>(events[0] || null);

    useEffect(() => {
        if (events.length > 0) {
            // Optionally auto-center on newest event?
            // For now, let's just let user browse or center on significant ones.
        }
    }, [events]);

    return (
        <MapContainer
            center={[20, 0] as [number, number]}
            zoom={2}
            scrollWheelZoom={true}
            className="w-full h-full bg-[#050505] z-0"
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
            />

            {events.map((ev) => (
                <CircleMarker
                    key={ev.id}
                    center={[ev.latitude, ev.longitude]}
                    pathOptions={{
                        color: getEventColor(ev.type),
                        fillColor: getEventColor(ev.type),
                        fillOpacity: 0.7,
                        weight: 0
                    }}
                    radius={Math.max(5, (ev.magnitude || 0) * 2)} // Start simple
                >
                    <Popup className="disaster-popup">
                        <div className="font-mono text-slate-900">
                            <h3 className="font-bold text-sm border-b border-slate-300 pb-1 mb-1">{ev.title}</h3>
                            <p className="text-xs">{ev.time}</p>
                            <p className="text-xs">Mag: {ev.magnitude}</p>
                            <p className="text-xs">{ev.source}</p>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    )
}

function getEventColor(type: string): string {
    switch (type) {
        case 'earthquake': return '#ef4444'; // red-500
        case 'tsunami': return '#3b82f6'; // blue-500
        case 'weather': return '#eab308'; // yellow-500
        default: return '#ffffff';
    }
}
