import React, { useEffect, useRef } from 'react';

interface AdsenseBlockProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'display';
  responsive?: boolean;
}

export const AdsenseBlock: React.FC<AdsenseBlockProps> = ({ slot, format = 'auto', responsive = true }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This observer will trigger when the ad container becomes visible in the viewport.
    // This is a more robust way to prevent the "No slot size for availableWidth=0" error
    // than a fixed timeout, as it ensures the container is rendered and has dimensions.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error('AdSense error:', e);
          }
          // Once the ad is pushed, we don't need to observe anymore.
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the ad is visible
    );

    if (adContainerRef.current) {
      observer.observe(adContainerRef.current);
    }

    return () => {
      if (adContainerRef.current) {
        // Check if adContainerRef.current is not null before calling unobserve
        observer.unobserve(adContainerRef.current);
      }
    };
  }, [slot]);

  return (
    <div ref={adContainerRef} className="adsense-container text-center my-4 min-h-[50px] flex items-center justify-center bg-white/5 rounded-lg w-full">
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
