import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map CodNetwork lead statuses to our order statuses
const LEAD_STATUS_MAP: Record<string, string> = {
  lead: "pending",
  confirmed: "confirmed",
  delivered: "delivered",
  return: "refunded",
  call_later: "pending",
  call_later_scheduled: "pending",
  no_reply: "pending",
  cancelled: "cancelled",
  wrong: "cancelled",
  expired: "cancelled",
};

// Map CodNetwork order statuses to our order statuses
const ORDER_STATUS_MAP: Record<string, string> = {
  new: "pending",
  "assigned(order sent to shipping company)": "shipped",
  shipped: "shipped",
  delivered: "delivered",
  returned: "refunded",
  cancelled: "cancelled",
  on_hold: "pending",
  scheduled: "pending",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Verify webhook secret
    const webhookSecret = Deno.env.get("COD_NETWORK_WEBHOOK_SECRET");
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      const querySecret = url.searchParams.get("secret");
      const providedSecret = querySecret || authHeader?.replace("Bearer ", "");
      if (providedSecret !== webhookSecret) {
        console.log("CodNetwork webhook: invalid secret");
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Determine webhook type: "lead" or "order" via query param
    const webhookType = url.searchParams.get("type") || "lead";

    const body = await req.json();
    console.log(`CodNetwork webhook [${webhookType}] received:`, JSON.stringify(body));

    const codStatus = body.status;
    if (!codStatus) {
      return new Response(JSON.stringify({ success: false, error: "Missing status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract identifiers based on webhook type
    const leadId = body.lead_id || body.id;
    const phone = body.phone;
    const reference = body.reference; // order webhooks may include reference

    // Try to find matching order
    let orderId: string | null = null;

    // 1. Match by lead_id
    if (leadId) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("cod_network_lead_id", String(leadId))
        .maybeSingle();
      if (data) orderId = data.id;
    }

    // 2. Match by phone (most recent)
    if (!orderId && phone) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("customer_phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) orderId = data.id;
    }

    if (!orderId) {
      console.log("CodNetwork webhook: no matching order found for", { leadId, phone, reference });
      return new Response(JSON.stringify({ success: false, error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map status based on webhook type
    const statusMap = webhookType === "order" ? ORDER_STATUS_MAP : LEAD_STATUS_MAP;
    const mappedStatus = statusMap[codStatus] || null;

    const updateData: Record<string, any> = {
      cod_network_status: `${webhookType}:${codStatus}`,
    };
    if (leadId) updateData.cod_network_lead_id = String(leadId);
    if (mappedStatus) updateData.status = mappedStatus;

    const { error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      console.error("CodNetwork webhook update error:", error);
      return new Response(JSON.stringify({ success: false, error: "Update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`CodNetwork webhook [${webhookType}]: updated order ${orderId} → ${codStatus} (mapped: ${mappedStatus})`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("CodNetwork webhook error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
