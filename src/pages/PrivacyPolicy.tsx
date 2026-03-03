import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-8 text-center">سياسة الخصوصية</h1>

          <article className="space-y-8 text-store-primary leading-8 text-base">
            <p>
              في <strong>Saqrix</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا.
            </p>

            <section>
              <h2 className="text-lg font-bold mb-3">1. المعلومات التي نجمعها</h2>
              <p className="mb-2">قد نقوم بجمع المعلومات التالية:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>الاسم الكامل</li>
                <li>رقم الهاتف</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>عنوان الشحن</li>
                <li>معلومات الدفع (لا نقوم بتخزين بيانات البطاقة)</li>
                <li>بيانات الاستخدام وملفات تعريف الارتباط (Cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">2. كيفية استخدام المعلومات</h2>
              <p className="mb-2">نستخدم بياناتك من أجل:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>معالجة الطلبات وإتمام عمليات الشراء</li>
                <li>التواصل معك بخصوص الطلبات أو العروض</li>
                <li>تحسين تجربة المستخدم</li>
                <li>الامتثال للمتطلبات القانونية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">3. حماية المعلومات</h2>
              <p>نستخدم إجراءات أمان تقنية وإدارية لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">4. مشاركة المعلومات</h2>
              <p className="mb-2">لا نقوم ببيع أو تأجير بياناتك الشخصية لأي طرف ثالث. قد تتم مشاركة المعلومات فقط مع:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>شركات الشحن لتوصيل الطلبات</li>
                <li>مزودي خدمات الدفع</li>
                <li>الجهات القانونية عند الضرورة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">5. ملفات تعريف الارتباط (Cookies)</h2>
              <p>نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل أداء الموقع. يمكنك تعطيلها من إعدادات المتصفح.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">6. حقوقك</h2>
              <p className="mb-2">يحق لك:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>طلب الوصول إلى بياناتك</li>
                <li>طلب تصحيح أو حذف بياناتك</li>
                <li>إلغاء الاشتراك في الرسائل التسويقية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">7. التعديلات</h2>
              <p>قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر أي تحديث على هذه الصفحة.</p>
            </section>
          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default PrivacyPolicy;
