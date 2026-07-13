import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[BabyArtist PWA] App ready to work offline.');
  },
  onNeedRefresh() {
    // autoUpdate strategy — next navigation/refresh picks up the new SW
    console.info('[BabyArtist PWA] New version available; will update on reload.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
