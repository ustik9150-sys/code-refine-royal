import { useState, useCallback } from "react";
import { User, Phone, Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface InlineOrderFormProps {
  productName: string;
  productId?: string;
  unitPrice: number;
  quantity: number;
}

const InlineOrderForm = ({ productName, productId, unitPrice, quantity }: InlineOrderFormProps) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = unitPrice * quantity;

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = "يرجى إدخال الاسم";
    if (!phone.trim()) errs.phone = "يرجى إدخال رقم الهاتف";
    else if (!/^[\+]?[0-9\s\-]{7,15}$/.test(phone.trim())) errs.phone = "رقم الهاتف غير صالح";
    return errs;
  }, [fullName, phone]);

  const handleSubmit = useCallback(async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          payment_method: "cod" as const,
          shipping_method: "standard" as const,
          subtotal: totalPrice,
          shipping_cost: 0,
          total: totalPrice,
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId || null,
        product_name: productName,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });

      navigate(`/thank-you?order=${order.order_number}`);
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrors({ fullName: "حدث خطأ، حاول مرة أخرى" });
    } finally {
      setSubmitting(false);
    }
  }, [validate, submitting, fullName, phone, totalPrice, productId, productName, quantity, unitPrice, navigate]);

  return (
    <div className="w-full animate-fade-in" dir="rtl">
      <div className="border-2 border-destructive rounded-2xl overflow-hidden bg-card">
        {/* Header */}
        <div className="px-5 py-4 text-center">
          <h3 className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
            للطلب ادخل معلوماتك في الخانات اسفله
          </h3>
        </div>

        {/* Form */}
        <div className="px-5 pb-5 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground text-right block">الاسم<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-r-xl bg-muted flex items-center justify-center border border-input border-r-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors((er) => ({ ...er, fullName: "" })); }}
                placeholder="ادخل اسمك هنا"
                className="w-full h-12 rounded-xl border border-input bg-background pr-14 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                style={{ fontSize: "16px" }}
              />
            </div>
            {errors.fullName && <p className="text-destructive text-xs font-medium animate-fade-in">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground text-right block">رقم الهاتف<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-r-xl bg-muted flex items-center justify-center border border-input border-r-0">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((er) => ({ ...er, phone: "" })); }}
                placeholder="ادخل رقم هاتفك هنا"
                dir="ltr"
                className="w-full h-12 rounded-xl border border-input bg-background pr-14 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all text-right"
                style={{ fontSize: "16px" }}
              />
            </div>
            {errors.phone && <p className="text-destructive text-xs font-medium animate-fade-in">{errors.phone}</p>}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 rounded-xl font-bold text-base text-destructive-foreground bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جارٍ إرسال الطلب...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>اضغط لتأكيد الطلب</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineOrderForm;
