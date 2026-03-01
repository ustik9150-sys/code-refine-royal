import { useState, useCallback } from "react";
import { Heart, Share2, CheckCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import EmailLoginSheet from "@/components/EmailLoginSheet";
import productImage from "@/assets/product-main.jpg";
import SaveBadge from "@/components/SaveBadge";
import barcodeIcon from "@/assets/barcode-icon.png";
import applePayIcon from "@/assets/apple_pay_mini.avif";
import bankIcon from "@/assets/bank_mini.avif";
import codIcon from "@/assets/cod_mini.avif";
import sbcIcon from "@/assets/sbc.avif";
import madeInKsaIcon from "@/assets/made-in-ksa.svg";

const SarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M745.4 512.5c-1.5-1.1-3-2.1-4.6-3.1 48.3-42 78.2-104.2 78.2-173.4 0-126.8-103.2-230-230-230-84.2 0-158.1 45.4-198.2 113H230c-19.9 0-36 16.1-36 36s16.1 36 36 36h124.7c-2.9 18.3-4.4 37-4.4 56 0 11.7.6 23.2 1.6 34.6-37.7 11.7-74.4 32.1-106.1 62.4-17.3 16.6-32.5 36.6-44.4 60.6-11.4 22.9-19.2 48.1-23 75.4-6.1 43.7-.7 91.2 18.8 136.5 1.4 3.2 3 6.3 4.7 9.4 31.3 57.3 88.3 96 157.5 96 24.2 0 47-5 67.5-14 2.3-1 4.6-2.1 6.8-3.2.5-.2.9-.5 1.4-.7 2.7-1.5 5.3-3 7.8-4.7 1.4-.9 2.7-1.9 4.1-2.8 1.6-1.1 3.3-2.2 4.9-3.4 6.5-4.8 12.5-10.2 18-16.1 3-3.2 5.8-6.5 8.4-10 .3-.3.5-.7.8-1 3-4 5.7-8.2 8.2-12.5.4-.7.8-1.5 1.2-2.2 36 17.2 76.2 26.8 118.7 26.8 2.7 0 5.4-.1 8.1-.2l-42.1-67.2c-64.8-3.5-121.2-38.6-153.8-89.4l19.2-12.1c3.1-2 6.1-4 9.1-6.2 2.1-1.5 4.2-3.1 6.2-4.7 2.2-1.7 4.3-3.5 6.4-5.3 4-3.5 7.8-7.2 11.4-11.1 14.2-15.4 24.6-33 31.4-51.5 15.9 4.8 32.7 7.3 50.1 7.3 41.5 0 79.7-14.5 109.7-38.7l-43.5-69.5c-17.7 14.7-40.4 23.5-65.2 23.5-24 0-46-8.3-63.4-22.1 0-.1.1-.2.1-.3 10.7-34.9 12.5-70.3 7.3-102.7h56.1c55.5 0 106-22.8 142.2-59.6l-50.2-55.3c-24.5 24.9-58.5 40.3-96.1 40.3h-74.9c-11.6-30.3-30.1-57.1-53.8-78.4h128.7c87.1 0 158 70.9 158 158s-70.9 158-158 158h-6.1zm-291.7 74.2c-2.1 1.2-4.3 2.4-6.4 3.5-24.2 12.2-44 29.7-58.2 52.1-6.4 10.2-11.5 21.2-15 33-4.5 15.3-6.5 31.7-5.3 48.7 1.2 17.3 6.2 33.9 14.1 48.4.6 1.1 1.2 2.2 1.9 3.2 16.3 26.2 44.3 44.3 77.7 44.3 11.2 0 22.2-2.5 32.4-7 1.1-.5 2.1-1 3.2-1.5-3 2.8-6.1 5.5-9.4 7.9-1.2.9-2.4 1.7-3.7 2.5-.6.4-1.2.8-1.8 1.2-1.8 1.1-3.6 2.2-5.5 3.2-1.2.6-2.4 1.2-3.7 1.8-1.7.8-3.4 1.5-5.1 2.1-13.1 5.3-27.3 8.1-42.2 8.1-47.7 0-85.9-27.6-107-66.4-.6-1.2-1.2-2.3-1.8-3.5-14.5-33.5-18.6-68.9-13.8-103.3 3-21.4 9.1-40.7 18.1-57.8 9.4-17.8 21.6-33.1 36.1-45.5 25.2-21.6 53.4-35.1 80.9-43.5-.6 10.5-1.1 20.7-1.5 30.5 5.4 12.3 12.3 24 20.5 34.8-1.1.8-2.3 1.4-3.4 2.2z" />
  </svg>
);

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLoginSheet, setShowLoginSheet] = useState(false);

  const handleBuyNow = useCallback(() => {
    const savedEmail = localStorage.getItem("customer_email");
    if (savedEmail) {
      // Already logged in, proceed with purchase
      console.log("Proceeding with purchase for:", savedEmail);
      return;
    }
    setShowLoginSheet(true);
  }, []);

  const handleLoginSuccess = useCallback((email: string) => {
    setShowLoginSheet(false);
    // Resume purchase action
    console.log("Login successful, proceeding with purchase for:", email);
  }, []);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Product Image */}
      <div className="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
        <div className="relative rounded-md overflow-hidden bg-secondary">
          <img
            src={productImage}
            alt="باقة المسك"
            className="w-full h-auto object-contain"
          />
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label="مشاركة"
            >
              <Share2 className="w-4 h-4 text-store-primary" />
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label="إضافة للمفضلة"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-sale text-sale" : "text-store-primary"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2">
        <h1 className="text-xl md:text-2xl font-bold text-store-primary leading-10">
          باقة المسك
        </h1>

        {/* Price */}
        <div className="flex items-center gap-4 my-2 flex-wrap">
          <span className="font-bold text-xl text-sale flex items-center gap-1">222 ر.س</span>
          <span className="text-store-secondary line-through flex items-center gap-1">1,119 ر.س</span>
          <SaveBadge amount={897} />
        </div>

        <small className="text-store-secondary mb-3 block text-sm">السعر شامل الضريبة</small>

        {/* Availability */}
        <div className="flex items-center gap-1.5 mb-5 text-green-600">
          <span className="relative flex items-center justify-center">
            <span className="absolute w-5 h-5 rounded-full bg-green-500/40 animate-availability-ping" />
            <CheckCircle className="w-5 h-5 relative z-10" />
          </span>
          <span className="text-sm">متوفر</span>
        </div>

        {/* Description */}
        <div className="mb-5">
          <article
            className={`relative overflow-hidden transition-all duration-300 ${
              showFullDescription ? "max-h-[2000px]" : "max-h-[84px]"
            }`}
          >
            <p className="font-bold mb-2">مجموعة متكاملة صُممت خصيصًا لعشّاق المسك.</p>
            <p className="mb-2">
              تمزج بين النعومة والانتعاش والنقاء، لتمنحك إحساسًا دائمًا بالنظافة والصفاء
            </p>
            <p className="mb-2">
              تشمل عطور مسك أيقونية بأحجام كاملة، ومجموعة مني عملية، إضافة إلى زيوت مسك مركّزة لعشّاق العطور العميقة، مما يجعلها مثالية للاستخدام اليومي، للتنسيق العطري، أو كهدية أنيقة وراقية.
            </p>

            <p className="font-bold mt-4 mb-2">العطور الرئيسية (75 مل):</p>
            <ul className="list-disc pr-5 mb-4 space-y-1">
              <li>مسك خاص</li>
              <li>مسك باودر</li>
              <li>مسك عبق الرمان</li>
              <li>مسك الفجر</li>
            </ul>

            <p className="font-bold mb-2">مجموعة ميني مسك (10 مل):</p>
            <ul className="list-disc pr-5 mb-4 space-y-1">
              <li>مسك خاص</li>
              <li>مسك باودر</li>
              <li>مسك عبق الرمان</li>
              <li>مسك البلوبيري</li>
              <li>مسك الشمس</li>
              <li>مسك الفجر</li>
            </ul>

            <p className="font-bold mb-2">مجموعة زيوت المسك (4 × 6 مل):</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>مسك الفجر</li>
              <li>مسك الشمس</li>
              <li>مسك القمر</li>
              <li>مسك الليل</li>
            </ul>
          </article>
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-primary text-sm mt-2 hover:text-accent transition-colors font-medium"
          >
            {showFullDescription ? "عرض أقل" : "قراءة المزيد"}
          </button>
        </div>

        {/* Model number */}
        <section className="bg-background p-4 rounded-md mb-5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-store-primary text-sm flex items-center gap-1">
              <img src={barcodeIcon} alt="باركود" className="w-5 h-5" />
              <span>رقم الموديل</span>
            </span>
            <span className="text-xs text-store-secondary">7287120302040</span>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="flex items-center justify-center gap-3 mb-5">
          <img src={madeInKsaIcon} alt="صنع في السعودية" className="h-8" />
          <img src={applePayIcon} alt="Apple Pay" className="h-8" />
          <img src={bankIcon} alt="تحويل بنكي" className="h-8" />
          <img src={codIcon} alt="الدفع عند الاستلام" className="h-8" />
          <img src={sbcIcon} alt="SBC" className="h-8" />
        </section>

      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
        {/* Quantity Row */}
        <div className="flex items-center border-b border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-11 flex items-center justify-center text-store-primary border-l border-border text-lg"
            aria-label="تقليل الكمية"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="flex-1 text-center text-store-primary font-medium text-base">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-11 flex items-center justify-center text-store-primary border-r border-border text-lg"
            aria-label="زيادة الكمية"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Action Buttons Row */}
        <div className="flex gap-2 px-2 py-2">
          <button className="flex-1 py-2.5 bg-foreground text-background font-normal text-[11px] flex items-center justify-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>إضافة للسلة</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2.5 bg-background text-foreground font-normal text-[11px] flex items-center justify-center gap-2 border border-foreground/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M29 12h-26c-0.668-0.008-1.284-0.226-1.787-0.59l0.009 0.006c-0.744-0.552-1.222-1.428-1.222-2.416 0-1.657 1.343-3 2.999-3h6c0.552 0 1 0.448 1 1s-0.448 1-1 1v0h-6c-0.552 0-1 0.448-1 1 0 0.326 0.156 0.616 0.397 0.798l0.002 0.002c0.167 0.12 0.374 0.194 0.599 0.2l0.001 0h26c0.552 0 1 0.448 1 1s-0.448 1-1 1v0zM27 12c-0.552 0-1-0.448-1-1v0-3h-3c-0.552 0-1-0.448-1-1s0.448-1 1-1v0h4c0.552 0 1 0.448 1 1v0 4c0 0.552-0.448 1-1 1v0zM29 30h-26c-1.657 0-3-1.343-3-3v0-18c0-0.552 0.448-1 1-1s1 0.448 1 1v0 18c0 0.552 0.448 1 1 1v0h25v-5c0-0.552 0.448-1 1-1s1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM29 18c-0.552 0-1-0.448-1-1v0-6c0-0.552 0.448-1 1-1s1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM31 24h-7c-2.209 0-4-1.791-4-4s1.791-4 4-4v0h7c0.552 0 1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM24 18c-1.105 0-2 0.895-2 2s0.895 2 2 2v0h6v-4zM25 12c-0.001 0-0.001 0-0.002 0-0.389 0-0.726-0.222-0.891-0.546l-0.003-0.006-3.552-7.106-2.306 1.152c-0.13 0.066-0.284 0.105-0.447 0.105-0.552 0-1-0.448-1-1 0-0.39 0.223-0.727 0.548-0.892l0.006-0.003 3.2-1.6c0.13-0.067 0.284-0.106 0.447-0.106 0.39 0 0.727 0.223 0.892 0.548l0.003 0.006 4 8c0.067 0.13 0.106 0.285 0.106 0.448 0 0.552-0.448 1-1 1v0zM21 12c-0.001 0-0.001 0-0.002 0-0.389 0-0.726-0.222-0.891-0.546l-0.003-0.006-3.552-7.106-15.104 7.552c-0.13 0.066-0.284 0.105-0.447 0.105-0.552 0-1-0.448-1-1 0-0.39 0.223-0.727 0.548-0.892l0.006-0.003 16-8c0.13-0.067 0.284-0.106 0.447-0.106 0.39 0 0.727 0.223 0.892 0.548l0.003 0.006 4 8c0.067 0.13 0.106 0.285 0.106 0.448 0 0.552-0.448 1-1 1-0.001 0-0.001 0-0.002 0h0z"></path></svg>
            <span>اشتري الآن</span>
          </button>
        </div>
      </div>

      {/* Spacer for sticky bar on mobile */}
      <div className="h-24 lg:hidden" />

      {/* Email Login Bottom Sheet */}
      <EmailLoginSheet
        open={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default ProductDetails;
