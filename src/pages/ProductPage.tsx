import { useParams } from "react-router-dom";
import StoreHeader from "@/components/StoreHeader";
import ProductDetails from "@/components/ProductDetails";
import StoreFooter from "@/components/StoreFooter";
import TestimonialsSection from "@/components/TestimonialsSection";
import TrackingPixels from "@/components/TrackingPixels";
import { useTrackVisit } from "@/hooks/useTrackVisit";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  useTrackVisit(`/product/${id}`);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrackingPixels />
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
