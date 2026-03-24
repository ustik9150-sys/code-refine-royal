import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      city,
      address,
      payment_method = "cod",
      shipping_method = "standard",
      subtotal,
      shipping_cost = 0,
      total,
      user_id,
      items, // array of { product_id, product_name, quantity, unit_price, total_price }
    } = await req.json();

    // Validate required fields
    if (!customer_name || !customer_phone || !items?.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert order
    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        id: orderId,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        city: city || null,
        address: address || null,
        payment_method,
        shipping_method,
        subtotal: subtotal || total,
        shipping_cost,
        total,
        user_id: user_id || null,
      });

    if (orderError) {
      console.error("Order insert error:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity || 1,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Order was created, log but don't fail
    }

    // Send Pushover notification (fire-and-forget, order saved regardless)
    try {
      const PUSHOVER_TOKEN = Deno.env.get("PUSHOVER_TOKEN");
      const PUSHOVER_USER = Deno.env.get("PUSHOVER_USER");

      if (PUSHOVER_TOKEN && PUSHOVER_USER) {
        const firstItem = items[0];
        const message = `🔥 New Order\n\n👤 Name: ${customer_name}\n📞 Phone: ${customer_phone}\n📦 Product: ${firstItem.product_name}\n🔢 Qty: ${firstItem.quantity || 1}\n💰 Total: ${total}`;

        const pushRes = await fetch("https://api.pushover.net/1/messages.json", {
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

        console.log("Pushover response:", pushRes.status);
      } else {
        console.log("Pushover not configured, skipping notification");
      }
    } catch (pushErr) {
      console.error("Pushover notification failed:", pushErr);
      // Don't fail the order
    }

    console.log(`Order ${orderId} created successfully`);

    return new Response(
      JSON.stringify({ success: true, order_id: orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-order error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
