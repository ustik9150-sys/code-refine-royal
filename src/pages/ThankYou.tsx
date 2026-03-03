import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Mail, Phone } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get("order") || "000000";
  const email = searchParams.get("email") || "";

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <StoreHeader />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="bg-muted/40 py-12 px-6 text-center space-y-5">
          {/* Celebration Illustration */}
          <div className="flex justify-center">
            <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Streamers */}
              <path d="M80 90 C75 60, 65 40, 60 20" stroke="#222" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M80 90 C85 55, 90 35, 95 15" stroke="#222" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M80 90 C70 70, 55 55, 45 45" stroke="#222" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M80 90 C90 65, 100 50, 115 40" stroke="#222" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Stars */}
              <polygon points="60,15 63,25 73,25 65,31 68,41 60,35 52,41 55,31 47,25 57,25" fill="#F5A623" />
              <polygon points="105,10 107,17 114,17 108,22 110,29 105,25 100,29 102,22 96,17 103,17" fill="#F5A623" />
              <polygon points="120,35 122,40 127,40 123,44 124,49 120,46 116,49 117,44 113,40 118,40" fill="#222" />
              {/* Dots and flowers */}
              <circle cx="40" cy="55" r="5" fill="#E85D75" />
              <circle cx="35" cy="70" r="3" fill="#E85D75" />
              <circle cx="50" cy="40" r="4" fill="#F5A623" />
              <circle cx="125" cy="55" r="4" fill="#4ECDC4" />
              <circle cx="130" cy="70" r="3" fill="#F5A623" />
              <circle cx="45" cy="80" r="3" fill="#4ECDC4" />
              {/* Small flower shapes */}
              <circle cx="30" cy="85" r="4" fill="#E85D75" />
              <circle cx="26" cy="85" r="2.5" fill="#FFB6C1" />
              <circle cx="34" cy="85" r="2.5" fill="#FFB6C1" />
              <circle cx="30" cy="81" r="2.5" fill="#FFB6C1" />
              <circle cx="30" cy="89" r="2.5" fill="#FFB6C1" />
              <circle cx="135" cy="80" r="4" fill="#F5A623" />
              <circle cx="50" cy="68" r="2" fill="#4ECDC4" />
              <circle cx="110" cy="65" r="2" fill="#E85D75" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-foreground leading-relaxed">
            شكرًا لتسوقكم عبر متجرنا 😊
          </h1>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>رقم الطلب:</span>
            <span className="font-semibold text-foreground" dir="ltr">#{orderNumber}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(orderNumber)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="نسخ رقم الطلب"
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
            <Phone className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">خدمة العملاء</p>
          <a
            href="tel:+966566994244"
            className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5"
            dir="ltr"
          >
            +966566994244
          </a>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
};

export default ThankYou;
