import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map CodNetwork statuses to our order statuses
const STATUS_MAP: Record<string, string> = {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get("COD_NETWORK_WEBHOOK_SECRET");
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      const url = new URL(req.url);
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

    const body = await req.json();
    console.log("CodNetwork webhook received:", JSON.stringify(body));

    // CodNetwork sends: { id, phone, status, customer_name, total_price, ... }
    const leadId = body.id || body.lead_id;
    const phone = body.phone;
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

    // Try to find order by lead_id first, then by phone
    let orderId: string | null = null;

    if (leadId) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("cod_network_lead_id", String(leadId))
        .maybeSingle();
      if (data) orderId = data.id;
    }

    if (!orderId && phone) {
      // Match by phone - get the most recent order with this phone
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
      console.log("CodNetwork webhook: no matching order found for", { leadId, phone });
      return new Response(JSON.stringify({ success: false, error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with CodNetwork status
    const mappedStatus = STATUS_MAP[codStatus] || null;
    const updateData: Record<string, any> = {
      cod_network_status: codStatus,
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

    console.log(`CodNetwork webhook: updated order ${orderId} → status: ${codStatus} (mapped: ${mappedStatus})`);

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
