import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Mail, Phone } from "lucide-react";
import celebrationSvg from "@/assets/celebration.svg";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const generateTrackingCode = (orderNum: string): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = parseInt(orderNum) || Date.now();
  const prefix = chars[num % chars.length] + chars[(num * 7 + 3) % chars.length];
  const suffix = chars[(num * 13 + 5) % chars.length];
  const padded = String(num).padStart(4, "0");
  return `${prefix}-${padded}-${suffix}`;
};

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawOrder = searchParams.get("order") || "";
  const trackingCode = rawOrder ? generateTrackingCode(rawOrder) : "N/A";
  const email = searchParams.get("email") || "";

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

          <button
            onClick={() => navigate("/")}
            className="inline-block bg-foreground text-background px-8 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            عرض تفاصيل الفاتورة
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
