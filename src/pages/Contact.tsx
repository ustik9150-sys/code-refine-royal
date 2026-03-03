import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-8 text-center">اتصل بنا</h1>

          <article className="space-y-8 text-store-primary leading-8 text-base">
            <p>يسعدنا تواصلكم معنا في أي وقت، ونحن هنا لخدمتكم والرد على جميع استفساراتكم.</p>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-1 text-accent shrink-0" />
              <div>
                <h2 className="font-bold mb-1">البريد الإلكتروني</h2>
                <a href="mailto:inovad19@gmail.com" className="text-accent hover:underline" dir="ltr">inovad19@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 text-accent shrink-0" />
              <div>
                <h2 className="font-bold mb-1">أوقات العمل</h2>
                <p>من الأحد إلى الخميس</p>
                <p>من الساعة 9:00 صباحًا حتى 6:00 مساءً</p>
              </div>
            </div>

            <p className="text-muted-foreground">نسعى للرد على جميع الرسائل خلال 24 ساعة عمل.</p>

            <p className="text-accent font-bold text-lg mt-8">Saqrix — حضور يتكلم عنك.</p>
          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default Contact;
