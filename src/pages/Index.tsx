import StoreHeader from "@/components/StoreHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductDetails from "@/components/ProductDetails";
import StoreFooter from "@/components/StoreFooter";

const breadcrumbItems = [
  { label: "الرئيسية", href: "/" },
  { label: "عروض يوم التأسيس", href: "#" },
  { label: "باقة المسك" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
