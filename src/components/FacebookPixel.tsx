import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function FacebookPixel() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "tracking")
        .maybeSingle();

      if (!data) return;
      const v = data.value as any;
      const pixelId = v?.facebook_pixel_id;
      const enabled = v?.pixel_enabled;

      if (!pixelId || !enabled || initialized) return;

      // Inject Facebook Pixel
      const script = document.createElement("script");
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Noscript fallback
      const noscript = document.createElement("noscript");
      const img = document.createElement("img");
      img.height = 1;
      img.width = 1;
      img.style.display = "none";
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);

      setInitialized(true);
    })();
  }, [initialized]);

  return null;
}
