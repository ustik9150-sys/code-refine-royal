import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VALID_SKUS: Record<string, string> = {
  BIOAQUA99: "كريم الخوخ لتبيض و تنعيم البشرة",
  TTEHRSOIN: "زيت اديفاسي لتطويل الشعر",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, sku } = await req.json();

    if (!order_id || typeof order_id !== "string" || order_id.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sku || !VALID_SKUS[sku]) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid gift SKU" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check order exists and no gift already selected
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("id, gift_sku")
      .eq("id", order_id)
      .maybeSingle();

    if (fetchErr || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.gift_sku) {
      return new Response(
        JSON.stringify({ success: false, error: "Gift already selected" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const giftName = VALID_SKUS[sku];

    // Save gift on order
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        gift_sku: sku,
        gift_name: giftName,
        gift_selected_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateErr) throw updateErr;

    // Add gift as order item with price 0
    const { error: itemErr } = await supabase
      .from("order_items")
      .insert({
        order_id,
        product_name: `🎁 ${giftName} (${sku})`,
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });

    if (itemErr) {
      console.error("Failed to insert gift order item:", itemErr);
      // Don't fail the whole request - gift is already saved on the order
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("select-gift error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
