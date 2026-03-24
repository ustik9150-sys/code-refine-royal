import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PUSHOVER_TOKEN = Deno.env.get("PUSHOVER_TOKEN");
    const PUSHOVER_USER = Deno.env.get("PUSHOVER_USER");

    if (!PUSHOVER_TOKEN || !PUSHOVER_USER) {
      console.error("Missing Pushover credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Pushover not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer_name, customer_phone, product_name, quantity, total } = await req.json();

    const message = `🛒 طلب جديد!
الاسم: ${customer_name}
الهاتف: ${customer_phone}
المنتج: ${product_name}
الكمية: ${quantity}
المبلغ: ${total}`;

    const res = await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: PUSHOVER_TOKEN,
        user: PUSHOVER_USER,
        message,
        priority: 1,
        sound: "cashregister",
        title: "طلب جديد 🔔",
      }),
    });

    const data = await res.json();
    console.log("Pushover response:", res.status, JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: res.ok, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-order error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
