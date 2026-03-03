import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-8 text-center">الشروط والأحكام</h1>

          <article className="space-y-8 text-store-primary leading-8 text-base">
            <p>مرحبًا بكم في موقع <strong>Saqrix</strong>. باستخدامكم لهذا الموقع وإتمام أي عملية شراء، فإنكم توافقون على الالتزام بالشروط والأحكام التالية:</p>

            <section>
              <h2 className="text-lg font-bold mb-3">1. التعريفات</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>"الموقع": يشير إلى منصة Saqrix الإلكترونية.</li>
                <li>"العميل": كل شخص يقوم باستخدام الموقع أو شراء المنتجات.</li>
                <li>"المنتجات": السلع المعروضة للبيع عبر الموقع.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">2. الأهلية القانونية</h2>
              <p className="mb-2">يشترط لاستخدام الموقع وإتمام عمليات الشراء:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>أن يكون العميل قد بلغ 18 عامًا أو أكثر.</li>
                <li>أن يمتلك الأهلية القانونية لإبرام العقود.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">3. الطلبات والدفع</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>جميع الأسعار تشمل ضريبة القيمة المضافة (إن وجدت).</li>
                <li>يتم تأكيد الطلب بعد إتمام عملية الدفع بنجاح.</li>
                <li>يحق لـ Saqrix إلغاء أي طلب في حال وجود خطأ في السعر أو توفر المنتج.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">4. الشحن والتوصيل</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>يتم شحن الطلبات وفق المدة الموضحة في سياسة التوصيل.</li>
                <li>لا تتحمل Saqrix مسؤولية التأخير الناتج عن ظروف خارجة عن الإرادة.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">5. الاستبدال والاسترجاع</h2>
              <p>تخضع جميع طلبات الاستبدال والاسترجاع للسياسة المنشورة في صفحة "سياسة الاستبدال والاسترجاع"، والمتوافقة مع نظام التجارة الإلكترونية السعودي.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">6. إخلاء المسؤولية</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>المعلومات المنشورة في الموقع هي لأغراض تعريفية فقط.</li>
                <li>لا يُعتبر المحتوى استشارة طبية أو علاجية.</li>
                <li>يتحمل العميل مسؤولية التأكد من ملاءمة المنتج لاحتياجاته قبل الاستخدام.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">7. الملكية الفكرية</h2>
              <p>جميع المحتويات، الشعارات، التصاميم، النصوص، والعلامات التجارية الخاصة بـ Saqrix محمية بموجب أنظمة الملكية الفكرية، ولا يجوز استخدامها أو إعادة نشرها دون إذن كتابي مسبق.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">8. الاستخدام غير المشروع</h2>
              <p>يُمنع استخدام الموقع لأي غرض غير قانوني أو بما يخالف أنظمة المملكة العربية السعودية.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">9. تعديل الشروط</h2>
              <p>يحق لـ Saqrix تعديل هذه الشروط في أي وقت، ويتم نشر التحديثات على هذه الصفحة، ويُعد استمرار الاستخدام موافقة على التعديلات.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">10. القانون المعمول به</h2>
              <p>تخضع هذه الشروط وتُفسر وفق أنظمة المملكة العربية السعودية، وتختص المحاكم السعودية بالنظر في أي نزاع ينشأ عنها.</p>
            </section>
          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default Terms;
