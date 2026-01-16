'use client'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 animate-pulse text-white flex items-center justify-center tracking-widest font-mono">INITIALIZING SATELLITE LINK...</div>
})

export default function Map(props: any) {
    return <MapInner {...props} />
}
