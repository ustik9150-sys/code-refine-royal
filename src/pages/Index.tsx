import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, Plus, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import TestimonialsSection from "@/components/TestimonialsSection";
import TrackingPixels from "@/components/TrackingPixels";
import { useTrackVisit } from "@/hooks/useTrackVisit";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  images: { url: string; is_main: boolean }[];
};

const Index = () => {
  useTrackVisit("/");
  const { currency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [heroTitle, setHeroTitle] = useState("عروض ما تتفوت");
  const [announcementText, setAnnouncementText] = useState("توصيل مجاني للطلبات فوق 200 ريال");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name_ar, description_ar, price, compare_at_price, inventory, product_images(url, is_main)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(
          productsData.map((p: any) => ({
            ...p,
            images: p.product_images || [],
          }))
        );
      }

      // Fetch store info
      const { data: settings } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "store_info")
        .maybeSingle();

      if (settings?.value) {
        const v = settings.value as any;
        if (v.name) setStoreName(v.name);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <TrackingPixels />
      
      {/* Announcement Bar */}
      <div className="bg-foreground text-background py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-sm">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span>✦</span> {announcementText}
              <span className="mx-4">✦</span> توصيل سريع لجميع المناطق
              <span className="mx-4">✦</span> الدفع عند الاستلام
            </span>
          ))}
        </div>
      </div>

      <StoreHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-10 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              {heroTitle}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[2px] w-16 md:w-24 bg-foreground/20" />
              <div className="w-3 h-3 rounded-full border-2 border-foreground/30" />
              <div className="h-[2px] w-16 md:w-24 bg-foreground/20" />
            </div>
          </motion.div>
        </section>

        {/* Products Grid */}
        <section className="container pb-16">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground">لا توجد منتجات حالياً</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} currencySymbol={currency.symbol} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Testimonials */}
        <TestimonialsSection />
      </main>

      <StoreFooter />
    </div>
  );
};

function ProductCard({ product, index, currencySymbol }: { product: Product; index: number; currencySymbol: string }) {
  const [liked, setLiked] = useState(false);
  const thumb = product.images.find(i => i.is_main)?.url || product.images[0]?.url || null;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const description = product.description_ar?.replace(/<[^>]*>/g, "").slice(0, 60) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden mb-3">
        <Link to={`/product/${product.id}`}>
          {thumb ? (
            <img
              src={thumb}
              alt={product.name_ar}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/20" />
            </div>
          )}
        </Link>

        {/* Action buttons */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-foreground/60"}`} />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <Eye className="w-4 h-4 text-foreground/60" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="text-center space-y-1.5 px-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name_ar}
          </h3>
        </Link>
        
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-5">
            {description}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 pt-0.5">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.compare_at_price?.toLocaleString("en-US")} {currencySymbol}
            </span>
          )}
          <span className={`text-base font-bold ${hasDiscount ? "text-red-600" : "text-foreground"}`}>
            {product.price.toLocaleString("en-US")} {currencySymbol}
          </span>
        </div>
      </div>

      {/* Add to cart button */}
      <Link
        to={`/product/${product.id}`}
        className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة للسلة</span>
      </Link>
    </motion.div>
  );
}

// --- Testimonials ---
const testimonials = [
  {
    name: "علي الخرمي",
    text: "منتجات رائعة وجودة عالية، التوصيل كان سريع جداً والتغليف ممتاز. أنصح الجميع بالتجربة!",
    rating: 5,
    avatar: avatar1,
  },
  {
    name: "سارة المالكي",
    text: "تجربة شراء مميزة من البداية للنهاية. المنتج طابق الوصف تماماً وخدمة العملاء ممتازة.",
    rating: 5,
    avatar: avatar2,
  },
  {
    name: "محمد العتيبي",
    text: "أفضل متجر تعاملت معه، الأسعار مناسبة والمنتجات أصلية. راح أكرر الطلب بإذن الله.",
    rating: 4,
    avatar: avatar3,
  },
  {
    name: "نورة الشمري",
    text: "طلبت كهدية وكانت التجربة رائعة، التغليف فاخر والمنتج وصل بحالة ممتازة.",
    rating: 5,
    avatar: avatar4,
  },
  {
    name: "خالد الدوسري",
    text: "سرعة في التوصيل وجودة ممتازة. المنتج فاق توقعاتي بصراحة!",
    rating: 5,
    avatar: avatar5,
  },
];

function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  return (
    <section className="py-12 md:py-20">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4">آراء العملاء</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[2px] w-16 md:w-24 bg-foreground/20" />
          <div className="w-3 h-3 rounded-full border-2 border-foreground/30" />
          <div className="h-[2px] w-16 md:w-24 bg-foreground/20" />
        </div>
      </div>

      {/* Carousel */}
      <div className="container overflow-hidden">
        {/* Mobile: single card auto-slide */}
        <div className="md:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4 }}
            >
              <TestimonialCard t={testimonials[current]} />
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-foreground w-5" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 3 cards visible */}
        <div className="hidden md:block relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 gap-6"
            >
              {[0, 1, 2].map((offset) => {
                const idx = (current + offset) % testimonials.length;
                return <TestimonialCard key={idx} t={testimonials[idx]} />;
              })}
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-foreground w-5" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-muted-foreground/15 absolute top-5 right-5" />
      <Quote className="w-8 h-8 text-muted-foreground/15 absolute top-5 left-5 scale-x-[-1]" />

      {/* Review text */}
      <p className="text-sm md:text-base text-foreground/80 leading-7 mt-6 mb-8 min-h-[60px]">
        {t.text}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 justify-end">
        <div className="text-right">
          <p className="font-bold text-foreground text-sm">{t.name}</p>
          <div className="flex gap-0.5 mt-1 justify-end">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
        <img
          src={t.avatar}
          alt={t.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-border"
        />
      </div>
    </div>
  );
}

export default Index;
