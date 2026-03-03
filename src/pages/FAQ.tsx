import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "ما هي Saqrix؟", a: "Saqrix علامة تجارية تعكس الثقة والحضور القوي، ونسعى لتقديم تجربة مميزة لعملائنا من حيث الجودة والخدمة." },
  { q: "كم تستغرق مدة التوصيل؟", a: "داخل المملكة العربية السعودية: من 1 إلى 3 أيام عمل. قد تختلف المدة حسب المدينة وشركة الشحن." },
  { q: "هل يمكنني تتبع طلبي؟", a: "نعم، سيتم تزويدك برقم تتبع فور شحن الطلب لمتابعة حالته مباشرة." },
  { q: "هل يمكن الاستبدال أو الاسترجاع؟", a: "نعم، يمكنك طلب الاستبدال أو الاسترجاع خلال 7 أيام من استلام الطلب، وفقًا لسياسة الاستبدال والاسترجاع المنشورة في الموقع." },
  { q: "هل بياناتي آمنة؟", a: "نعم، نلتزم بحماية بيانات العملاء وفق سياسة الخصوصية، ولا يتم مشاركة معلوماتك مع أي طرف ثالث إلا لأغراض تنفيذ الطلب." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نوفر وسائل دفع آمنة تشمل الدفع الإلكتروني، كما قد تتوفر خدمة الدفع عند الاستلام حسب المنطقة." },
  { q: "هل الأسعار تشمل الضريبة؟", a: "جميع الأسعار المعروضة تشمل ضريبة القيمة المضافة (إن وجدت) وفق أنظمة المملكة العربية السعودية." },
  { q: "كيف يمكنني التواصل مع خدمة العملاء؟", a: "يمكنك التواصل معنا عبر البريد الإلكتروني أو رقم خدمة العملاء الموضح في صفحة \"اتصل بنا\"." },
  { q: "ماذا أفعل إذا استلمت منتجًا غير مطابق؟", a: "يرجى التواصل معنا خلال 48 ساعة من الاستلام، وسيتم معالجة الطلب فورًا." },
  { q: "هل يمكن تعديل أو إلغاء الطلب بعد تأكيده؟", a: "يمكن طلب التعديل أو الإلغاء قبل شحن الطلب فقط، وبعد الشحن يخضع الأمر لسياسة الاسترجاع." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-8 text-center">الأسئلة الشائعة</h1>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-start text-store-primary font-medium text-sm hover:bg-secondary/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-7">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default FAQ;
