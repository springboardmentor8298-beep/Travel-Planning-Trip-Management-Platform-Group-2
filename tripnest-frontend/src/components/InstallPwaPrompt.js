import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

/**
 * PWA Install Prompt Banner
 * Works automatically across Desktop Chrome/Edge/Brave, Android, and iOS Safari.
 */
const InstallPwaPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return; // Already installed and open as PWA
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed prompt recently (in last 24h)
    const dismissedAt = localStorage.getItem('tripnest_pwa_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Capture standard PWA install prompt (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show after brief delay
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('tripnest_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div
      id="pwa-install-banner"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.2)',
        backdropFilter: 'blur(16px)',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        animation: 'slideUpPwa 0.4s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <img
          src="/favicon.png"
          alt="TripNest Icon"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
          }}
        />

        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
            Install TripNest App
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.3 }}>
            Fast offline access, fullscreen mode, & smart travel tools.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Close install banner"
        >
          <X size={18} />
        </button>
      </div>

      {showIOSGuide ? (
        <div
          style={{
            marginTop: '0.875rem',
            padding: '0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '10px',
            border: '1px dashed rgba(16, 185, 129, 0.4)',
            fontSize: '0.8rem',
            color: '#e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600 }}>
            <Share2 size={14} color="#10b981" /> 1. Tap the Share button in Safari
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <PlusSquare size={14} color="#10b981" /> 2. Select "Add to Home Screen"
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
          <button
            onClick={handleInstallClick}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Download size={15} /> Install App
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '0.55rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Not now
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUpPwa {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPwaPrompt;
