import { useParams } from "react-router-dom";
import StoreHeader from "@/components/StoreHeader";
import ProductDetails from "@/components/ProductDetails";
import StoreFooter from "@/components/StoreFooter";
import TestimonialsSection from "@/components/TestimonialsSection";
import TrackingPixels from "@/components/TrackingPixels";
import { useTrackVisit } from "@/hooks/useTrackVisit";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  useTrackVisit(`/product/${slug}`);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <TrackingPixels />

      {/* Announcement Bar */}
      <div className="bg-foreground text-background py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-sm">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span>✦</span> توصيل مجاني في جميع أنحاء المملكة
              <span className="mx-4">✦</span> توصيل سريع لجميع المناطق
              <span className="mx-4">✦</span> الدفع عند الاستلام
            </span>
          ))}
        </div>
      </div>

      <StoreHeader />
      <main className="flex-1">
        <div className="container">
          <ProductDetails productId={id} />
        </div>
        <TestimonialsSection />
      </main>
      <StoreFooter />
    </div>
  );
};

export default ProductPage;
