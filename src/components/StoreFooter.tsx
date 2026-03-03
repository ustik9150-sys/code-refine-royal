import logo from "@/assets/logo.png";
import commercialRegister from "@/assets/commercial-register.avif";

const footerLinks = [
  { label: "من نحن", href: "/about" },
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "سياسة الاستبدال والاسترجاع و التوصيل", href: "/return-policy" },
  { label: "البنود والقوانين", href: "/terms" },
  { label: "الاسئلة الشائعه", href: "/faq" },
  { label: "مواقعنا", href: "#" },
  { label: "كن من فريقنا", href: "#" },
];

const StoreFooter = () => {
  return (
    <footer className="bg-footer-bg relative mt-10">
      {/* Curved top */}
      <svg
        className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-footer-bg z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 54"
      >
        <path
          fill="currentColor"
          d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
        />
      </svg>

      <div className="pt-10 pb-0">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {/* Links */}
          <div className="text-center order-1">
            <h3 className="font-bold text-store-primary mb-4">روابط مهمة</h3>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-footer-text hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Center - Logo & Description */}
          <div className="text-center order-first lg:order-none relative z-[1] lg:-mt-[45px]">
            <a href="/" className="inline-block mb-3">
              <img src={logo} alt="ساكريكس | SAQRIX" className="h-16 mx-auto" />
            </a>
            <p className="text-sm text-footer-text leading-6 mb-6">
              ساكريكس علامة تجارية تجسد جوهر الثقة والهيبة في أبسط صورها، مستوحاة من روح الصقر
            </p>
            <div className="flex items-center justify-center gap-6">
              <img src={commercialRegister} alt="السجل التجاري" className="h-14" />
              <div>
                <p className="text-sm text-store-secondary mb-1">السجل التجاري</p>
                <b className="text-sm text-store-primary">7007030076</b>
              </div>
              <div>
                <p className="text-sm text-store-secondary mb-1">الرقم الضريبي</p>
                <b className="text-sm text-store-primary">300213684208886</b>
              </div>
            </div>
          </div>

          {/* App Download */}
          <div className="text-center order-2">
            <h3 className="font-bold text-store-primary mb-4">تحميل تطبيق الجوال</h3>
            <div className="flex justify-center gap-4 my-3">
              <a href="#" aria-label="App Store" className="hover:opacity-80 transition-opacity">
                <img
                  width="135"
                  height="40"
                  alt="App Store"
                  src="https://cdn.salla.network/images/appstore.png?v=2.0.5"
                />
              </a>
              <a href="#" aria-label="Google Play" className="hover:opacity-80 transition-opacity">
                <img
                  width="135"
                  height="40"
                  alt="Google Play"
                  src="https://cdn.salla.network/images/googleplay.png?v=2.0.5"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8">
          <div className="container flex flex-col md:flex-row items-center justify-between py-4 text-center">
            <span className="text-sm text-store-secondary mb-2 md:mb-0">
              الحقوق محفوظة | 2026{" "}
               <a href="/" className="hover:text-primary transition-colors">
                ساكريكس | SAQRIX
               </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
