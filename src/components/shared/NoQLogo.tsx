'use client';
import React, { useEffect, useState } from 'react';

interface NoQLogoProps {
  variant?: 'full' | 'icon' | 'white' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  customLogoUrl?: string;
}

export default function NoQLogo({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className = '',
  customLogoUrl,
}: NoQLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(customLogoUrl || null);

  useEffect(() => {
    const loadStoredLogo = () => {
      const stored = localStorage.getItem('iq_custom_logo');
      if (stored) {
        setLogoUrl(stored);
      } else {
        setLogoUrl(null);
      }
    };

    loadStoredLogo();

    // Fetch initial custom logo setting if not set
    const fetchLogoSetting = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.settings?.CUSTOM_APP_LOGO_URL) {
          const url = data.settings.CUSTOM_APP_LOGO_URL;
          setLogoUrl(url);
          localStorage.setItem('iq_custom_logo', url);
        }
      } catch (e) {}
    };

    fetchLogoSetting();

    window.addEventListener('storage', loadStoredLogo);
    window.addEventListener('logo-updated', loadStoredLogo);
    return () => {
      window.removeEventListener('storage', loadStoredLogo);
      window.removeEventListener('logo-updated', loadStoredLogo);
    };
  }, []);

  const activeLogoUrl = customLogoUrl || logoUrl;

  // Dimensions mapping
  const sizeMap = {
    sm: { icon: 32, title: 'text-xl', subtitle: 'text-[10px]', letterN: 'text-base', letterQ: 'text-lg' },
    md: { icon: 42, title: 'text-2xl', subtitle: 'text-xs', letterN: 'text-lg', letterQ: 'text-xl' },
    lg: { icon: 52, title: 'text-3xl', subtitle: 'text-sm', letterN: 'text-2xl', letterQ: 'text-3xl' },
    xl: { icon: 68, title: 'text-4xl', subtitle: 'text-base', letterN: 'text-3xl', letterQ: 'text-4xl' },
  };

  const currentSize = sizeMap[size];

  // Render Badge Icon
  const renderBadge = () => (
    <div
      className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-0.5 shadow-md shadow-blue-500/20 shrink-0 overflow-hidden"
      style={{ width: currentSize.icon, height: currentSize.icon }}
      dir="ltr"
    >
      {activeLogoUrl ? (
        <img
          src={activeLogoUrl}
          alt="NoQ Iraq Logo"
          className="w-full h-full object-cover rounded-[14px] bg-white"
        />
      ) : (
        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center font-extrabold tracking-tighter" dir="ltr">
          <span className={`text-white font-black font-sans drop-shadow-sm ${currentSize.letterN}`}>N</span>
          <span className={`text-blue-200 font-black font-sans -ml-0.5 drop-shadow-sm ${currentSize.letterQ}`}>Q</span>
        </div>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`} dir="ltr">
        {renderBadge()}
      </div>
    );
  }

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} dir="ltr">
      {/* Icon Badge */}
      {renderBadge()}

      {/* Text Identity */}
      <div className="flex flex-col leading-none" dir="ltr">
        <div className="flex items-center gap-1.5">
          <span className={`font-black font-sans tracking-tight ${currentSize.title} ${isWhite ? 'text-white' : 'text-slate-900'}`}>
            No<span className="text-blue-600">Q</span>
          </span>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
            Iraq
          </span>
        </div>
        
        {showTagline && (
          <span className={`text-[11px] font-bold mt-1 ${isWhite ? 'text-blue-200' : 'text-slate-500'}`} dir="rtl">
            — احجز قبل لا توصل —
          </span>
        )}
      </div>
    </div>
  );
}
