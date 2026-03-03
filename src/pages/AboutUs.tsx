import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import logo from "@/assets/logo.png";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4">
          <div className="flex flex-col items-center text-center mb-10">
            <img src={logo} alt="ساكريكس | SAQRIX" className="h-20 mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold text-store-primary mb-2">من نحن</h1>
          </div>

          <article className="space-y-6 text-store-primary leading-8 text-base md:text-lg">
            <p>
              في <strong>Saqrix</strong> نؤمن أن الحضور الحقيقي لا يُفرض، بل يُشعر به.
            </p>
            <p>
              نستلهم هويتنا من روح الصقر — رمز القوة، التركيز، والسيطرة الهادئة — لنقدم رؤية تعكس ثقة الرجل بذاته ووعيه بقيمته.
            </p>
            <p>
              نحن علامة تجارية تمثل الثبات في المواقف، والهيبة في الحضور، والاتزان في كل خطوة.
            </p>
            <p>
              <strong>Saqrix</strong> ليست مجرد اسم، بل فلسفة تعبر عن رجال يعرفون من هم، ويسيرون بثقة نحو ما يريدون.
            </p>
            <p className="text-accent font-bold text-lg md:text-xl mt-8">
              Saqrix — حضور يتكلم عنك.
            </p>
          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default AboutUs;
