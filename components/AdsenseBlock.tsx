import React, { useEffect } from 'react';

interface AdsenseBlockProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'display';
  responsive?: boolean;
}

export const AdsenseBlock: React.FC<AdsenseBlockProps> = ({ slot, format = 'auto', responsive = true }) => {
  useEffect(() => {
    // A small delay allows the container to be measured before the ad is requested.
    // This helps prevent the "No slot size for availableWidth=0" error which can happen
    // if the ad script runs before the component's layout is fully calculated.
    const timeoutId = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [slot]);

  return (
    <div className="adsense-container text-center my-4 min-h-[50px] flex items-center justify-center bg-white/5 rounded-lg w-full">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8050638035807727"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      ></ins>
    </div>
  );
};