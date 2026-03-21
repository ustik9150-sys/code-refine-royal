import StoreHeader from "@/components/StoreHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductDetails from "@/components/ProductDetails";
import StoreFooter from "@/components/StoreFooter";
import TrackingPixels from "@/components/TrackingPixels";
import { useTrackVisit } from "@/hooks/useTrackVisit";

const breadcrumbItems = [
  { label: "الرئيسية", href: "/" },
  { label: "عروض رمضان المبارك", href: "#" },
  { label: "منتجات جديدة" },
];

const Index = () => {
  useTrackVisit("/");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrackingPixels />
      <StoreHeader />
      
      <main className="flex-1">
        <div className="container">
          <Breadcrumbs items={breadcrumbItems} />
          <ProductDetails />
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default Index;
