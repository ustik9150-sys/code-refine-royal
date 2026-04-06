import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Gift, CheckCircle2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoreFooter from "@/components/StoreFooter";
import giftCreamImg from "@/assets/gift-cream.jpg";
import giftHairOilImg from "@/assets/gift-hair-oil.webp";

const GIFT_OPTIONS = [
  { sku: "BIOAQUA99", name: "كريم مرطب بخلاصة الخوخ", image: giftCreamImg },
  { sku: "TTEHRSOIN", name: "زيت أعشاب للشعر", image: giftHairOilImg },
];

const TIMEOUT_SECONDS = 120; // 2 minutes

const GiftSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id") || "";

  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySelected, setAlreadySelected] = useState(false);
  const [existingGift, setExistingGift] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  // Validate order & check existing gift
  useEffect(() => {
    if (!orderId) { navigate("/"); return; }
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, gift_sku, gift_name, total")
        .eq("id", orderId)
        .maybeSingle();

      if (!data) { navigate("/"); return; }
      if (data.gift_sku) {
        setAlreadySelected(true);
        setExistingGift(data.gift_name || data.gift_sku);
      }
      setOrderTotal(data.total);
      setLoading(false);
    })();
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (loading || alreadySelected) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-select first gift
          handleSubmit(GIFT_OPTIONS[0].sku);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, alreadySelected]);

  const handleSubmit = async (sku?: string) => {
    const finalSku = sku || selectedSku;
    if (!finalSku || submitting) return;
    setSubmitting(true);

    const gift = GIFT_OPTIONS.find((g) => g.sku === finalSku);
    if (!gift) return;

    try {
      const { data, error } = await supabase.functions.invoke("select-gift", {
        body: { order_id: orderId, sku: finalSku },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed");

      navigate(`/thank-you?order=${encodeURIComponent(orderId)}&total=${orderTotal || 0}`);
    } catch (err) {
      console.error("Gift selection failed:", err);
      // Navigate anyway to not block the customer
      navigate(`/thank-you?order=${encodeURIComponent(orderId)}&total=${orderTotal || 0}`);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (alreadySelected) {
    return (
      <div className="min-h-screen flex flex-col bg-background" dir="rtl">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">تم اختيار هديتك مسبقاً</h2>
            <p className="text-muted-foreground">هديتك: <strong>{existingGift}</strong></p>
            <Button onClick={() => navigate(`/thank-you?order=${encodeURIComponent(orderId)}&total=${orderTotal || 0}`)} className="rounded-xl">
              الذهاب لصفحة الشكر
            </Button>
          </motion.div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-pink-200"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">🎉 مبروك! لديك هدية مجانية</h1>
            <p className="text-muted-foreground text-sm">اختر هديتك المجانية مع طلبك</p>
          </div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto w-fit ${
              timeLeft <= 30
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>الوقت المتبقي: {formatTime(timeLeft)}</span>
          </motion.div>

          {/* Gift Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GIFT_OPTIONS.map((gift, idx) => (
              <motion.button
                key={gift.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                onClick={() => setSelectedSku(gift.sku)}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 text-right ${
                  selectedSku === gift.sku
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-semibold text-foreground text-sm">{gift.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {gift.sku}</p>
                  <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    مجاناً 🎁
                  </span>
                </div>
                {selectedSku === gift.sku && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Submit */}
          <Button
            onClick={() => handleSubmit()}
            disabled={!selectedSku || submitting}
            className="w-full rounded-xl h-12 text-base gap-2"
            size="lg"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            {submitting ? "جاري التأكيد..." : "تأكيد اختيار الهدية"}
          </Button>
        </motion.div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default GiftSelection;
