import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Mail, Phone, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import celebrationSvg from "@/assets/celebration.svg";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const generateTrackingCode = (orderId: string): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  // Use a simple hash from the UUID string
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash * 31 + orderId.charCodeAt(i)) >>> 0;
  }
  const prefix = chars[hash % chars.length] + chars[(hash >> 5) % chars.length];
  const middle = String(hash % 10000).padStart(4, "0");
  const suffix = chars[(hash >> 10) % chars.length];
  return `${prefix}-${middle}-${suffix}`;
};

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawOrder = searchParams.get("order") || "";
  const trackingCode = rawOrder ? generateTrackingCode(rawOrder) : "N/A";
  const email = searchParams.get("email") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <StoreHeader />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="bg-muted/40 py-8 sm:py-12 px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
          {/* Celebration Illustration */}
          <div className="flex justify-center">
            <img src={celebrationSvg} alt="احتفال" className="w-28 sm:w-40 h-auto" />
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
            شكرًا لتسوقكم عبر متجرنا 😊
          </h1>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>رقم التتبع:</span>
            <span className="font-semibold text-foreground tracking-wider" dir="ltr">{trackingCode}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(trackingCode)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="نسخ رقم التتبع"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* Phone Call Notice - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 120 }}
            className="relative max-w-sm mx-auto"
          >
            {/* Pulsing ring behind */}
            <div className="absolute inset-0 rounded-2xl bg-accent/10 animate-[ping_2.5s_ease-in-out_infinite] opacity-30" />
            
            <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-background to-accent/10 px-4 py-4 sm:px-5 sm:py-5 text-center shadow-lg">
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -inset-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent/8 to-transparent skew-x-12" />
              </div>

              <div className="relative space-y-2 sm:space-y-3">
                {/* Animated phone icon */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center mx-auto"
                >
                  <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </motion.div>

                <h3 className="text-sm sm:text-base font-black text-foreground">
                  📱 انتبه لهاتفك!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  سيتصل بك فريقنا قريبًا <strong className="text-foreground">لتأكيد طلبك</strong> والإجابة على أي استفسارات لديك
                </p>
                
                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <StepDot step={1} label="تأكيد الطلب" delay={1} />
                  <div className="w-4 sm:w-6 h-px bg-border" />
                  <StepDot step={2} label="تجهيز الشحن" delay={1.4} />
                  <div className="w-4 sm:w-6 h-px bg-border" />
                  <StepDot step={3} label="التوصيل" delay={1.8} />
                </div>
              </div>
            </div>
          </motion.div>

          <button
            onClick={() => navigate("/")}
            className="inline-block bg-foreground text-background px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            العودة للمتجر
          </button>
        </section>

        {/* ── Email Notification ── */}
        {email && (
          <section className="bg-muted/30 mx-4 my-3 sm:my-4 rounded-xl py-6 sm:py-8 px-4 sm:px-6 text-center space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              قمنا بإرسال فاتورة الطلب على البريد الإلكتروني
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium" dir="ltr">
              {email}
            </p>
          </section>
        )}

        {/* ── Customer Service ── */}
        <section className="bg-muted/30 mx-4 mb-4 sm:mb-6 rounded-xl py-6 sm:py-8 px-4 sm:px-6 text-center space-y-2 sm:space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">خدمة العملاء</p>
          <a
            href="mailto:inovad19@gmail.com"
            className="text-xs sm:text-sm text-muted-foreground font-medium"
            dir="ltr"
          >
            inovad19@gmail.com
          </a>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
};
function StepDot({ step, label, delay }: { step: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[10px] font-bold text-accent">
        {step}
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

export default ThankYou;
