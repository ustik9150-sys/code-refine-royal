import { useState } from "react";
import { Heart, Share2, Check, Minus, Plus } from "lucide-react";
import productImage from "@/assets/product-main.jpg";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
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
          <span className="font-bold text-xl text-sale">222 ر.س</span>
          <span className="text-store-secondary line-through">1,119 ر.س</span>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-sale">🔥</span>
            <span className="font-bold text-store-primary">
              وفر <strong>897 ر.س</strong>
            </span>
          </div>
        </div>

        <small className="text-store-secondary mb-3 block text-sm">السعر شامل الضريبة</small>

        {/* Availability */}
        <div className="flex items-center gap-1.5 mb-5 text-green-600">
          <Check className="w-4 h-4" />
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
        <section className="bg-secondary p-5 rounded-md mb-5">
          <div className="flex items-center justify-between">
            <span className="text-store-primary font-bold flex items-center gap-1">
              <span className="text-store-secondary">📦</span>
              <span>رقم الموديل</span>
            </span>
            <span className="text-sm text-store-secondary">7287120302040</span>
          </div>
        </section>

        {/* Price bottom section */}
        <div className="bg-secondary p-5 rounded-md rounded-b-none">
          <div className="flex items-center justify-between">
            <label className="text-store-primary font-bold">السعر</label>
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl text-sale">222 ر.س</span>
              <span className="text-store-secondary line-through">1,119 ر.س</span>
            </div>
          </div>
        </div>

        {/* Quantity & Add to cart */}
        <section className="bg-secondary p-5 rounded-md rounded-t-none border-t border-border">
          <div className="flex items-center justify-between mb-5">
            <label className="font-bold text-store-primary">الكمية</label>
            <div className="flex items-center border border-border rounded-md bg-background">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-store-secondary hover:text-store-primary transition-colors"
                aria-label="تقليل الكمية"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-store-primary font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-store-secondary hover:text-store-primary transition-colors"
                aria-label="زيادة الكمية"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2.5">
            <span>🛒</span>
            <span>إضافة للسلة</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
