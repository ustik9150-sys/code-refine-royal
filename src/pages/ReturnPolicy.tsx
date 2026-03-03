import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-8 text-center">سياسة الاستبدال والاسترجاع والتوصيل</h1>

          <article className="space-y-8 text-store-primary leading-8 text-base">
            <p>في <strong>Saqrix</strong> نسعى لضمان رضا عملائنا وثقتهم.</p>

            <section>
              <h2 className="text-lg font-bold mb-3">أولاً: شروط الاستبدال والاسترجاع</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>يحق للعميل طلب الاستبدال أو الاسترجاع خلال 7 أيام من تاريخ استلام الطلب.</li>
                <li>يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، وفي عبوته الأصلية.</li>
                <li>لا يمكن استرجاع المنتجات التي تم فتحها أو استخدامها لأسباب تتعلق بالصحة والسلامة.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">ثانياً: الحالات المقبولة</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>وجود عيب مصنعي.</li>
                <li>استلام منتج مختلف عن الطلب.</li>
                <li>تلف المنتج أثناء الشحن.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">ثالثاً: آلية الاسترجاع</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>يتم التواصل مع خدمة العملاء عبر البريد الإلكتروني أو واتساب.</li>
                <li>بعد الموافقة، يتم ترتيب استلام المنتج.</li>
                <li>يتم إعادة المبلغ خلال 5–10 أيام عمل بعد استلام وفحص المنتج.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">رابعاً: رسوم الشحن</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>في حال وجود خطأ من طرفنا، نتحمل كامل تكاليف الشحن.</li>
                <li>في حال الاسترجاع لسبب شخصي، يتحمل العميل رسوم الشحن.</li>
              </ul>
            </section>

            <hr className="border-border" />

            <h2 className="text-xl font-bold text-center">سياسة التوصيل</h2>
            <p>في <strong>Saqrix</strong> نحرص على توصيل طلباتكم بسرعة وأمان.</p>

            <section>
              <h2 className="text-lg font-bold mb-3">مدة التوصيل</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>داخل الدولة: من 1 إلى 3 أيام عمل.</li>
                <li>خارج الدولة: من 5 إلى 10 أيام عمل حسب شركة الشحن.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">معالجة الطلبات</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>يتم تجهيز الطلب خلال 24 ساعة من تأكيده.</li>
                <li>يتم تزويد العميل برقم تتبع بمجرد شحن الطلب.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">ملاحظات</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>قد تتأخر الشحنات في المواسم أو الظروف الخارجة عن إرادتنا.</li>
                <li>يجب التأكد من صحة بيانات العنوان لتجنب أي تأخير.</li>
              </ul>
            </section>
          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default ReturnPolicy;
