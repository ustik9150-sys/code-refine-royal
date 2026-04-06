import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COD_NETWORK_API_BASE = "https://api.cod.network/v1/seller";

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

    const authHeaders = {
      Authorization: `Bearer ${api_token}`,
      "Content-Type": "application/json",
    };

    if (action === "test") {
      const res = await fetch(`${COD_NETWORK_API_BASE}/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({}),
      });
      const success = res.status !== 401 && res.status !== 403;
      return new Response(JSON.stringify({ success, status: res.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_products") {
      // Fetch ALL pages of products
      const allProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(`${COD_NETWORK_API_BASE}/products?page=${page}`, {
          method: "GET",
          headers: authHeaders,
        });
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
          return new Response(JSON.stringify({ success: false, status: res.status, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const products = data?.data || [];
        allProducts.push(...products);

        // Check pagination
        const pagination = data?.meta?.pagination;
        if (pagination && pagination.current_page < pagination.total_pages) {
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`CodNetwork: fetched ${allProducts.length} products across ${page} pages`);
      return new Response(JSON.stringify({ 
        success: true, 
        data: { data: allProducts, total: allProducts.length } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_lead" && body.lead_id) {
      const res = await fetch(`${COD_NETWORK_API_BASE}/leads/${body.lead_id}`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ success: res.ok, status: res.status, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_order" && order_data) {
      console.log("CodNetwork lead_data:", JSON.stringify(order_data));
      const res = await fetch(`${COD_NETWORK_API_BASE}/leads`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(order_data),
      });
      const data = await res.json().catch(() => ({}));
      console.log("CodNetwork lead response:", res.status, JSON.stringify(data));
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
