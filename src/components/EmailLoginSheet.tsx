import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface EmailLoginSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const EmailLoginSheet: React.FC<EmailLoginSheetProps> = ({ open, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

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
    localStorage.setItem("customer_email", trimmed);
    window.dispatchEvent(new CustomEvent("email_login_success", { detail: { email: trimmed } }));
    setError("");
    setEmail("");
    onSuccess(trimmed);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl px-6 pt-5 pb-8 animate-slide-up"
        style={{ animation: "slide-up 300ms ease-out forwards" }}
      >
        {/* Close button */}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <label className="block text-sm font-medium text-foreground text-right">
            البريد الإلكتروني
          </label>
          {/* Input */}
          <input
            ref={inputRef}
            type="email"
            dir="ltr"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm text-left placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition"
          />
          {error && (
            <p className="text-red-500 text-xs text-right">{error}</p>
          )}
          {/* Submit */}
          <button
            type="submit"
            className="w-full h-11 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            دخول
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmailLoginSheet;
