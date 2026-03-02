import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import avatarMale from "@/assets/avatar_male.png";
import codIcon from "@/assets/cod-icon.png";
import paymentMethodIcon from "@/assets/payment-method-icon.png";
import shippingIcon from "@/assets/shipping-icon.svg";
import locationIcon from "@/assets/location-icon.svg";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  totalAmount?: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onClose, totalAmount = 222 }) => {
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [errors, setErrors] = useState<{ address?: string; company?: string }>({});
  const [orderComplete, setOrderComplete] = useState(false);

  const firstName = localStorage.getItem("customer_first_name") || "";
  const lastName = localStorage.getItem("customer_last_name") || "";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setErrors({});
      setOrderComplete(false);
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

  const handleSubmit = useCallback(() => {
    const errs: typeof errors = {};
    if (!shippingAddress) errs.address = "يرجى اختيار عنوان الشحن";
    if (!shippingCompany) errs.company = "يرجى اختيار شركة الشحن";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    localStorage.setItem("payment_method", "cod");
    window.dispatchEvent(new CustomEvent("payment_method_selected", { detail: { method: "cod" } }));
    window.dispatchEvent(new CustomEvent("order_completed", {
      detail: {
        paymentMethod: "cod",
        shippingAddress,
        shippingCompany,
        total: totalAmount,
        firstName,
        lastName,
      },
    }));
    setOrderComplete(true);
  }, [shippingAddress, shippingCompany, totalAmount, firstName, lastName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute bottom-0 inset-x-0 bg-background rounded-t-2xl max-h-[90vh] flex flex-col"
        style={{ animation: "checkout-slide-up 300ms ease-out forwards" }}
      >
        {/* ── Header ── */}
        <div className="relative px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          {/* Close – top left (in RTL: left = visual left) */}
          <button
            onClick={onClose}
            className="absolute top-4 start-4 text-destructive hover:opacity-80 transition-opacity"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Avatar + greeting – aligned to end (right in RTL) */}
          <div className="flex items-center gap-3 justify-end pe-1">
            <div className="text-end">
              <p className="text-base font-bold text-foreground leading-snug">
                مرحباً، {firstName} {lastName}
              </p>
              <p className="text-sm text-muted-foreground">إتمام الدفع</p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
              <img src={avatarMale} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          {orderComplete ? (
            /* ── Success State ── */
            <div className="px-6 py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">تم تأكيد طلبك بنجاح!</h3>
              <p className="text-sm text-muted-foreground">سيتم التواصل معك لتأكيد موعد التوصيل</p>
              <p className="text-sm text-muted-foreground">طريقة الدفع: الدفع عند الاستلام</p>
              <button
                onClick={onClose}
                className="w-full h-12 bg-foreground text-background rounded-lg font-medium text-sm mt-4"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <div className="px-5 pt-5 pb-24 space-y-5">
              {/* ── Total Summary ── */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">الإجمالي</p>
                  <p className="text-lg font-bold text-foreground">{totalAmount} ﷼</p>
                </div>
                <p className="text-sm text-teal-600 cursor-pointer hover:underline text-end">لديك كوبون تخفيض؟</p>
                <button className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground w-full pt-1">
                  <span>تفاصيل الفاتورة</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* ── Shipping Address ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <img src={locationIcon} alt="" className="w-5 h-5" />
                    <span>عنوان الشحن</span>
                  </h3>
                  <button className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
                    <span className="text-base leading-none">+</span>
                    <span>عنوان جديد</span>
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={shippingAddress}
                    onChange={(e) => { setShippingAddress(e.target.value); setErrors((er) => ({ ...er, address: undefined })); }}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                  >
                    <option value="">لا توجد لديك عناوين شحن مسجلة...</option>
                    <option value="home">المنزل - الرياض</option>
                    <option value="work">العمل - جدة</option>
                  </select>
                  <ChevronDown className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
              </div>

              {/* ── Shipping Company ── */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <img src={shippingIcon} alt="" className="w-5 h-5" />
                  <span>شركة الشحن</span>
                </h3>
                <div className="relative">
                  <select
                    value={shippingCompany}
                    onChange={(e) => { setShippingCompany(e.target.value); setErrors((er) => ({ ...er, company: undefined })); }}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                  >
                    <option value="">اختر شركة الشحن</option>
                    <option value="aramex">أرامكس</option>
                    <option value="smsa">SMSA</option>
                    <option value="dhl">DHL</option>
                  </select>
                  <ChevronDown className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {!shippingAddress && (
                  <p className="text-xs text-muted-foreground">يرجى اختيار عنوان الشحن أولاً لعرض شركات الشحن المتاحة</p>
                )}
                {errors.company && <p className="text-destructive text-xs mt-1">{errors.company}</p>}
              </div>

              {/* ── Payment Method – COD Only ── */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <img src={paymentMethodIcon} alt="" className="w-5 h-5 object-contain" />
                  <span>طريقة الدفع</span>
                </h3>
                <div className="border-2 border-foreground rounded-lg px-4 py-3 flex items-center gap-3">
                  {/* Radio – far right in RTL (first in DOM) */}
                  <div className="w-5 h-5 rounded-full border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
                  </div>
                  {/* Label */}
                  <span className="text-sm font-medium text-foreground flex-1">دفع عند الاستلام</span>
                  {/* Icon – far left in RTL (last in DOM) */}
                  <img src={codIcon} alt="COD" className="w-7 h-7 object-contain opacity-70 flex-shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky CTA ── */}
        {!orderComplete && (
          <div className="sticky bottom-0 inset-x-0 bg-background border-t border-border px-5 py-4 flex-shrink-0">
            <button
              onClick={handleSubmit}
              className="w-full h-12 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              إتمام الطلب
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes checkout-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;