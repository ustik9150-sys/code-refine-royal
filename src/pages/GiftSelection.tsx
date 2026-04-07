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
  { sku: "BIOAQUA99", name: "كريم الخوخ لتبيض و تنعيم البشرة", image: giftCreamImg },
  { sku: "TTEHRSOIN", name: "زيت اديفاسي لتطويل الشعر", image: giftHairOilImg },
];

const TIMEOUT_SECONDS = 120;

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

  useEffect(() => {
    if (!orderId) { navigate("/"); return; }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-order-status", {
          body: { order_id: orderId },
        });

        if (cancelled) return;
        if (error || !data?.success || !data?.order) {
          navigate("/");
          return;
        }

        if (data.order.gift_sku) {
          setAlreadySelected(true);
          setExistingGift(data.order.gift_name || data.order.gift_sku);
        }

        setOrderTotal(data.order.total ?? null);
      } catch (err) {
        console.error("Failed to load order status:", err);
        if (!cancelled) navigate("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, navigate]);

  useEffect(() => {
    if (loading || alreadySelected) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      {/* Main content — centered, compact */}
      <main className="flex-1 flex flex-col justify-center px-4 py-4 max-w-lg mx-auto w-full">
        
        {/* Header — compact */}
        <div className="text-center space-y-1 mb-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-pink-200/50"
          >
            <Gift className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-lg font-bold text-foreground">🎁 مبروك! لديك هدية مجانية</h1>
          <p className="text-muted-foreground text-sm">اختر هديتك الآن</p>
        </div>

        {/* Timer — subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mx-auto w-fit mb-4 ${
            timeLeft <= 30
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{formatTime(timeLeft)}</span>
        </motion.div>

        {/* Gift Options — 2 column grid, equal sizing */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {GIFT_OPTIONS.map((gift, idx) => {
            const isSelected = selectedSku === gift.sku;
            return (
              <motion.button
                key={gift.sku}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                onClick={() => setSelectedSku(gift.sku)}
                className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 text-right bg-card ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {/* Image — controlled aspect ratio */}
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1.5">
                  <p className="font-semibold text-foreground text-xs leading-snug line-clamp-2">
                    {gift.name}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    🎁 مجاناً
                  </span>
                </div>

                {/* Selection check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 left-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 max-w-lg mx-auto w-full">
        <Button
          onClick={() => handleSubmit()}
          disabled={!selectedSku || submitting}
          className="w-full rounded-xl h-12 text-base gap-2 font-bold"
          size="lg"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Gift className="w-5 h-5" />
          )}
          {submitting ? "جاري التأكيد..." : "تأكيد اختيار الهدية 🎁"}
        </Button>
      </div>

      <StoreFooter />
    </div>
  );
};

export default GiftSelection;
