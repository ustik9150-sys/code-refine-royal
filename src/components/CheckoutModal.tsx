import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import avatarMale from "@/assets/avatar_male.png";
import codIcon from "@/assets/cod-icon.png";

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

    // Save payment method
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: "checkout-slide-up 300ms ease-out forwards" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-red-500 hover:text-red-600 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <p className="text-base font-bold text-foreground">مرحباً، {firstName} {lastName}</p>
              <p className="text-sm text-gray-500">إتمام الدفع</p>
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 order-first">
              <img src={avatarMale} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {orderComplete ? (
          /* Success State */
          <div className="px-6 py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground">تم تأكيد طلبك بنجاح!</h3>
            <p className="text-sm text-gray-500">سيتم التواصل معك لتأكيد موعد التوصيل</p>
            <p className="text-sm text-gray-500">طريقة الدفع: الدفع عند الاستلام</p>
            <button
              onClick={onClose}
              className="w-full h-12 bg-foreground text-background rounded-lg font-medium text-sm mt-4"
            >
              إغلاق
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="px-5 py-5 space-y-5">
            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-foreground">{totalAmount} ﷼</p>
                <p className="text-base font-bold text-foreground">الإجمالي</p>
              </div>
              <p className="text-left text-sm text-teal-600 mt-1 cursor-pointer hover:underline">لديك كوبون تخفيض؟</p>
              <button className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-3 w-full">
                <ChevronDown className="w-4 h-4" />
                <span>تفاصيل الفاتورة</span>
              </button>
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <button className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
                  <span className="text-lg leading-none">⊕</span> عنوان جديد
                </button>
                <h3 className="text-sm font-bold text-foreground">عنوان الشحن</h3>
              </div>
              <div className="relative">
                <select
                  value={shippingAddress}
                  onChange={(e) => { setShippingAddress(e.target.value); setErrors((er) => ({ ...er, address: undefined })); }}
                  className="w-full h-12 rounded-lg border border-gray-300 px-3 text-sm text-right appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="">لا توجد لديك عناوين شحن مسجلة...</option>
                  <option value="home">المنزل - الرياض</option>
                  <option value="work">العمل - جدة</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.address && <p className="text-red-500 text-xs text-right mt-1">{errors.address}</p>}
            </div>

            {/* Shipping Company */}
            <div>
              <h3 className="text-sm font-bold text-foreground text-right mb-2">شركة الشحن</h3>
              <div className="relative">
                <select
                  value={shippingCompany}
                  onChange={(e) => { setShippingCompany(e.target.value); setErrors((er) => ({ ...er, company: undefined })); }}
                  className="w-full h-12 rounded-lg border border-gray-300 px-3 text-sm text-right appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="">لا توجد شركات شحن متاحة، يرجى اختيار عنوان اخر</option>
                  <option value="aramex">أرامكس</option>
                  <option value="smsa">SMSA</option>
                  <option value="dhl">DHL</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.company && <p className="text-red-500 text-xs text-right mt-1">{errors.company}</p>}
            </div>

            {/* Payment Method - COD Only */}
            <div>
              <h3 className="text-sm font-bold text-foreground text-right mb-2">طريقة الدفع</h3>
              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={codIcon} alt="COD" className="w-7 h-7 object-contain opacity-60" />
                  <span className="text-sm font-medium text-foreground">دفع عند الاستلام</span>
                </div>
              </div>
            </div>

            {/* Submit */}
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
