import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COD_NETWORK_API = "https://api.cod.network/v1/seller/orders";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, api_token, order_data } = body;

    if (!api_token) {
      return new Response(JSON.stringify({ success: false, error: "Missing API token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test") {
      // Test connection by making a lightweight request
      const res = await fetch(COD_NETWORK_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      // Even a 422/400 means the token is valid (just invalid body)
      const success = res.status !== 401 && res.status !== 403;
      return new Response(JSON.stringify({ success, status: res.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_order" && order_data) {
      console.log("CodNetwork order_data:", JSON.stringify(order_data));
      const res = await fetch(COD_NETWORK_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order_data),
      });
      const data = await res.json().catch(() => ({}));
      console.log("CodNetwork response:", res.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: res.ok, status: res.status, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("cod-network-proxy error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
