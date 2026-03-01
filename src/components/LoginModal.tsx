import React, { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

/* ─── Email Step ─── */
interface EmailStepProps {
  onSubmit: (email: string) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-foreground text-right">
        البريد الإلكتروني
      </label>
      <input
        ref={inputRef}
        type="email"
        dir="ltr"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
        className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm text-left placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition bg-white"
      />
      {error && <p className="text-red-500 text-xs text-right">{error}</p>}
      <button
        type="submit"
        className="w-full h-11 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
      >
        دخول
      </button>
    </form>
  );
};

/* ─── OTP Step ─── */
interface OtpStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const OtpStep: React.FC<OtpStepProps> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      digits.forEach((d, i) => { if (i < 4) next[i] = d; });
      setOtp(next);
      const focusIdx = Math.min(digits.length, 3);
      inputRefs.current[focusIdx]?.focus();
    } else {
      next[index] = value;
      setOtp(next);
      if (value && index < 3) inputRefs.current[index + 1]?.focus();
    }
    if (error) setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      const next = [...otp];
      pasted.split("").forEach((d, i) => { if (i < 4) next[i] = d; });
      setOtp(next);
      inputRefs.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  const isFilled = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isFilled) {
      setError("أدخل رمز التحقق بالكامل");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate OTP verification
    await new Promise((r) => setTimeout(r, 1200));
    const code = otp.join("");
    // For demo: accept any 4 digits
    if (code.length === 4) {
      setLoading(false);
      onVerified();
    } else {
      setError("رمز التحقق غير صحيح");
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(30);
    // Simulate resend
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins} : ${secs}`;
  };

  return (
    <div className="space-y-5">
      {/* Back arrow (top-right in RTL) */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
        aria-label="رجوع"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <p className="text-sm text-gray-500 text-center leading-relaxed">
        رقم التحقق مطلوب لإكمال العملية
        <br />
        لقد تم إرسال رمز التحقق في رسالة إليكم
      </p>
      <p className="text-sm font-bold text-foreground text-center" dir="ltr">{email}</p>

      {/* OTP Boxes */}
      <div className="flex justify-center gap-3" dir="ltr" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`رقم ${i + 1} من 4`}
            className="w-16 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground/50 transition bg-white"
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!isFilled || loading}
        className="w-full h-12 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "جاري التحقق..." : "تحقق"}
      </button>

      {/* Resend Timer */}
      <p className="text-sm text-gray-500 text-center">
        {countdown > 0 ? (
          <>يمكنك إعادة الإرسال بعد {formatTime(countdown)}</>
        ) : (
          <button onClick={handleResend} className="text-foreground font-medium underline">
            إعادة الإرسال
          </button>
        )}
      </p>
    </div>
  );
};

/* ─── Login Modal Shell ─── */
interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setStep("email");
      setEmail("");
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleEmailSubmit = useCallback((submittedEmail: string) => {
    setEmail(submittedEmail);
    localStorage.setItem("customer_email", submittedEmail);
    window.dispatchEvent(new CustomEvent("email_login_success", { detail: { email: submittedEmail } }));
    setStep("otp");
  }, []);

  const handleOtpVerified = useCallback(() => {
    window.dispatchEvent(new CustomEvent("otp_verified", { detail: { email } }));
    onSuccess(email);
  }, [email, onSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-6 pt-5 pb-8 animate-slide-up"
        style={{ animation: "login-slide-up 300ms ease-out forwards" }}
      >
        {/* Close button (top-left in RTL) */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-red-500 hover:text-red-600 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>

        {/* User icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="#9ca3af" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16c4.412 0 8-3.588 8-8s-3.588-8-8-8-8 3.588-8 8 3.588 8 8 8zM16 2.667c2.941 0 5.333 2.392 5.333 5.333s-2.392 5.333-5.333 5.333-5.333-2.392-5.333-5.333 2.392-5.333 5.333-5.333zM16 18.667c-7.476 0-13.333 3.66-13.333 8.333v3.667c0 0.736 0.597 1.333 1.333 1.333s1.333-0.597 1.333-1.333v-3.667c0-3.019 4.984-5.667 10.667-5.667s10.667 2.648 10.667 5.667v3.667c0 0.736 0.597 1.333 1.333 1.333s1.333-0.597 1.333-1.333v-3.667c0-4.673-5.857-8.333-13.333-8.333z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold text-foreground mb-5">تسجيل الدخول</h2>

        {step === "email" ? (
          <EmailStep onSubmit={handleEmailSubmit} />
        ) : (
          <OtpStep email={email} onVerified={handleOtpVerified} onBack={() => setStep("email")} />
        )}
      </div>

      <style>{`
        @keyframes login-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
