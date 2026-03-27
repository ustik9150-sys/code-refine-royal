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
        <section className="bg-muted/40 py-12 px-6 text-center space-y-5">
          {/* Celebration Illustration */}
          <div className="flex justify-center">
            <img src={celebrationSvg} alt="احتفال" className="w-40 h-auto" />
          </div>

          <h1 className="text-xl font-bold text-foreground leading-relaxed">
            شكرًا لتسوقكم عبر متجرنا 😊
          </h1>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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

          {/* Phone Call Notice */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-5 py-4 max-w-md mx-auto text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm font-bold text-foreground">يرجى الانتباه لهاتفك 📱</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              سيتصل بك فريق مركز الاتصال الخاص بنا قريبًا لتأكيد طلبك والإجابة على استفساراتك
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-block bg-foreground text-background px-8 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            العودة للمتجر
          </button>
        </section>

        {/* ── Email Notification ── */}
        {email && (
          <section className="bg-muted/30 mx-4 my-4 rounded-xl py-8 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              قمنا بإرسال فاتورة الطلب على البريد الإلكتروني
            </p>
            <p className="text-sm text-muted-foreground font-medium" dir="ltr">
              {email}
            </p>
          </section>
        )}

        {/* ── Customer Service ── */}
        <section className="bg-muted/30 mx-4 mb-6 rounded-xl py-8 px-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">خدمة العملاء</p>
          <a
            href="mailto:inovad19@gmail.com"
            className="text-sm text-muted-foreground font-medium"
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

export default ThankYou;
