const isDev = import.meta.env.MODE === 'development';
const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

export const API_BASE_URL = isDev 
  ? 'http://127.0.0.1:8000/api' 
  : import.meta.env.VITE_API_URL || '/api';

export const WS_BASE_URL = isDev 
  ? 'ws://127.0.0.1:8000' 
  : import.meta.env.VITE_WS_URL || `${wsProtocol}://${window.location.host}`;

export const API_URL = API_BASE_URL;
export const WS_URL = `${WS_BASE_URL}/ws`;

export const USE_WEBSOCKET = true;
