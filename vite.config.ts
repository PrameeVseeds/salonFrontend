import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const backendProxy = {
'/api': 'http://localhost:5000',
'/uploads': 'http://localhost:5000',
}

export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: 'autoUpdate',
includeAssets: ['apple-touch-icon.png'],
manifest: {
name: 'Salon A-Line',
short_name: 'A-Line',
description: 'Book your salon services with A-Line Salon.',
theme_color: '#b58a00',
background_color: '#111111',
display: 'standalone',
start_url: '/',
scope: '/',
icons: [
{
src: '/icons/icon-192.png',
sizes: '192x192',
type: 'image/png',
},
{
src: '/icons/icon-512.png',
sizes: '512x512',
type: 'image/png',
},
],
},
}),
],
server: {
proxy: backendProxy,
},
preview: {
proxy: backendProxy,
},
})
