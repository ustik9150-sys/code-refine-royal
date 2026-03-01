import { useState } from "react";
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Globe } from "lucide-react";
import logo from "@/assets/logo.png";

const menuItems = [
  { label: "عروض يوم التأسيس", href: "#" },
  {
    label: "العطور",
    href: "#",
    children: [
      { label: "عطور 75 مل", href: "#" },
      { label: "عطور 100 مل", href: "#" },
      { label: "عطور 150 مل", href: "#" },
      { label: "عطور 200 مل", href: "#" },
      { label: "جميع العطور", href: "#" },
    ],
  },
  { label: "منتجات أقل من 100 ريال", href: "#" },
  { label: "جديدنا", href: "#" },
  {
    label: "مجموعات مميزة",
    href: "#",
    children: [
      { label: "مجموعة الدايموند", href: "#" },
      { label: "مجموعة التوباكو", href: "#" },
      { label: "مجموعة المسك", href: "#" },
      { label: "مجموعة سمر", href: "#" },
      { label: "مجموعة دوز", href: "#" },
      { label: "مجموعة ليذر", href: "#" },
      { label: "مجموعة مون", href: "#" },
      { label: "مجموعة إرث", href: "#" },
      { label: "مجموعة سيجنتشر", href: "#" },
      { label: "للسفر والإهداء", href: "#" },
    ],
  },
  { label: "زيوت عطرية", href: "#" },
  {
    label: "بخور ومباخر",
    href: "#",
    children: [
      { label: "البخور", href: "#" },
      { label: "مباخر", href: "#" },
    ],
  },
  { label: "عطور منزلية", href: "#" },
  { label: "توزيعات", href: "#" },
  { label: "هدايا", href: "#" },
];

const StoreHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <header className="bg-background sticky top-0 z-50 shadow-sm">
      {/* Top navbar */}
      <div className="border-b border-border">
        <div className="container flex justify-between items-center py-2 text-sm">
          <button className="flex items-center gap-1 text-store-secondary hover:text-store-primary transition-colors">
            <Globe className="w-4 h-4" />
            <span>العربية</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="text-store-secondary text-xs">
            تواصل معنا
          </div>
        </div>
      </div>

      {/* Main nav - Mobile */}
      <div className="lg:hidden">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-store-primary"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button className="text-store-primary" aria-label="تسجيل الدخول">
              <User className="w-5 h-5" />
            </button>
          </div>
          <a href="/" className="flex items-center justify-center">
            <img src={logo} alt="إبراق | IBRAQ Logo" className="h-12" />
          </a>
          <div className="flex items-center gap-3">
            <button className="text-store-primary" aria-label="بحث">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-store-primary relative" aria-label="سلة التسوق">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main nav - Desktop */}
      <div className="hidden lg:block">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <a href="/" className="shrink-0">
              <img src={logo} alt="إبراق | IBRAQ Logo" className="h-12" />
            </a>
            <nav>
              <ul className="flex items-center gap-5 text-sm">
                {menuItems.map((item) => (
                  <li key={item.label} className="relative group">
                    <a
                      href={item.href}
                      className="text-store-primary hover:text-accent transition-colors py-4 inline-flex items-center gap-1"
                    >
                      <span>{item.label}</span>
                      {item.children && <ChevronDown className="w-3 h-3" />}
                    </a>
                    {item.children && (
                      <div className="absolute top-full right-0 bg-background border border-border rounded-md shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <ul className="py-2">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <a
                                href={child.href}
                                className="block px-4 py-2 text-sm text-store-primary hover:bg-secondary transition-colors"
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-store-primary hover:text-accent transition-colors" aria-label="بحث">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-store-primary hover:text-accent transition-colors" aria-label="تسجيل الدخول">
              <User className="w-5 h-5" />
            </button>
            <button className="text-store-primary relative hover:text-accent transition-colors" aria-label="سلة التسوق">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-background z-40 overflow-y-auto">
          <ul className="container py-4">
            {menuItems.map((item) => (
              <li key={item.label} className="border-b border-border">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between py-3 text-sm font-bold text-store-primary"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {openSubmenu === item.label && (
                      <ul className="pr-4 pb-2">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a href={child.href} className="block py-2 text-sm text-store-secondary">
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a href={item.href} className="block py-3 text-sm font-bold text-store-primary">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default StoreHeader;
