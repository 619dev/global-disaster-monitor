# Global Disaster Monitor

A real-time global disaster visualization platform inspired by AstrBot's disaster warning plugin.

## Features

- **Real-time Monitoring**: Connects to Wolfx and P2P Quake networks via WebSocket.
- **2D World Map**: Interactive dark-themed map using Leaflet.
- **Live Alerts**: Scrolling ticker for immediate updates.
- **Data Sources**:
  - Wolfx (JMA, CENC, CWA EEW & Reports)
  - P2P Quake (Japan EEW & Reports)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Deployment

This project is optimized for [Vercel](https://vercel.com).
Simply import the project repository into Vercel and deploy.
