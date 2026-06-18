'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID && !GTM_ID && !FB_PIXEL_ID) return;

    // GA4 - Page View
    if (GA_ID && typeof window !== 'undefined' && !(window as any).__ga_initialized) {
      (window as any).__ga_initialized = true;
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_ID);
    }

    // GTM
    if (GTM_ID && typeof window !== 'undefined' && !(window as any).__gtm_initialized) {
      (window as any).__gtm_initialized = true;
      const script = document.createElement('script');
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,'document','script','dataLayer','${GTM_ID}');`;
      document.head.appendChild(script);
      const noscript = document.createElement('noscript');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
      iframe.height = '0'; iframe.width = '0'; iframe.style.display = 'none'; iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.appendChild(noscript);
    }

    // Facebook Pixel
    if (FB_PIXEL_ID && typeof window !== 'undefined' && !(window as any).__fb_initialized) {
      (window as any).__fb_initialized = true;
      const script = document.createElement('script');
      script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`;
      document.head.appendChild(script);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if ((window as any).gtag) (window as any).gtag('event', 'page_view', { page_path: pathname });
    if ((window as any).fbq) (window as any).fbq('track', 'PageView');
  }, [pathname]);

  return <>{children}</>;
}
