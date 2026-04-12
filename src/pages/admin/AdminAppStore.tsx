import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Settings,
  Trash2,
  Check,
  Truck,
  BarChart3,
  MessageCircle,
  Globe,
  CreditCard,
  Shield,
  Zap,
  Mail,
  Share2,
  Eye,
  MousePointer,
  Tag,
  Star,
  TrendingUp,
  FileText,
  Bell,
  Users,
  Palette,
  ShoppingBag,
  Gift,
  Clock,
  Megaphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  category: string;
  provider: string;
  installed: boolean;
  badge?: string;
  route?: string;
}

const apps: AppItem[] = [
  // التتبع والتحليلات
  {
    id: "facebook-pixel",
    name: "Facebook Pixel",
    description: "أداة تتبع تراقب نشاط المستخدمين على موقعك لتحسين حملاتك الإعلانية على فيسبوك.",
    icon: Globe,
    iconBg: "#1877F2",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Facebook",
    installed: true,
  },
  {
    id: "facebook-api",
    name: "Facebook API Conversion",
    description: "إرسال بيانات التحويلات مباشرة من السيرفر إلى فيسبوك لتتبع أدق وأكثر أماناً.",
    icon: Globe,
    iconBg: "#1877F2",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Facebook",
    installed: false,
  },
  {
    id: "tiktok-pixel",
    name: "TikTok Pixel",
    description: "تتبع نشاط المستخدمين بعد تفاعلهم مع إعلانات تيك توك لتحسين حملاتك الإعلانية.",
    icon: MousePointer,
    iconBg: "#000",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "TikTok Inc.",
    installed: true,
  },
  {
    id: "tiktok-api",
    name: "TikTok API Conversion",
    description: "إرسال أحداث التحويل من السيرفر مباشرة إلى تيك توك لتتبع دقيق خارج المتصفح.",
    icon: MousePointer,
    iconBg: "#000",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "TikTok Inc.",
    installed: false,
  },
  {
    id: "snapchat-pixel",
    name: "Snapchat Pixel",
    description: "تتبع تفاعل المستخدمين القادمين من إعلانات سنابشات لتحسين أداء حملاتك.",
    icon: Eye,
    iconBg: "#FFFC00",
    iconColor: "#000",
    category: "التتبع والتحليلات",
    provider: "Snap Inc.",
    installed: true,
  },
  {
    id: "google-ads",
    name: "Google Ads Conversions",
    description: "تتبع التحويلات وإضافات السلة لتحسين حملات Google Ads الخاصة بك.",
    icon: TrendingUp,
    iconBg: "#4285F4",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Google",
    installed: false,
  },
  {
    id: "google-tag",
    name: "Google Tag Manager",
    description: "إدارة وإضافة أكواد التتبع والتحليل على موقعك بدون تعديل الكود مباشرة.",
    icon: Tag,
    iconBg: "#4285F4",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Google",
    installed: false,
  },
  {
    id: "microsoft-clarity",
    name: "Microsoft Clarity",
    description: "خرائط حرارية وتسجيلات فيديو للجلسات لفهم سلوك المستخدمين وتحسين تجربتهم.",
    icon: BarChart3,
    iconBg: "#0078D4",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Microsoft",
    installed: false,
  },
  {
    id: "hotjar",
    name: "Hotjar",
    description: "خرائط حرارية وتسجيلات جلسات وتحليلات مفصلة لفهم سلوك العملاء.",
    icon: Eye,
    iconBg: "#FF3C00",
    iconColor: "#fff",
    category: "التتبع والتحليلات",
    provider: "Hotjar",
    installed: false,
  },

  // الشحن والتوصيل
  {
    id: "cod-network",
    name: "COD Network",
    description: "ربط متجرك مع شبكة COD Network لإدارة الشحن والتوصيل والدفع عند الاستلام.",
    icon: Truck,
    iconBg: "#10B981",
    iconColor: "#fff",
    category: "الشحن والتوصيل",
    provider: "COD Network",
    installed: true,
    route: "/admin/cod-network",
  },

  // المراسلة والتواصل
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "إرسال رسائل تأكيد الطلبات وتحديثات الشحن تلقائياً عبر واتساب.",
    icon: MessageCircle,
    iconBg: "#25D366",
    iconColor: "#fff",
    category: "المراسلة والتواصل",
    provider: "Meta",
    installed: true,
    route: "/admin/whatsapp",
  },
  {
    id: "pushover",
    name: "Pushover Notifications",
    description: "تنبيهات فورية على هاتفك عند استلام طلبات جديدة.",
    icon: Bell,
    iconBg: "#2196F3",
    iconColor: "#fff",
    category: "المراسلة والتواصل",
    provider: "Pushover",
    installed: true,
  },

  // التكاملات
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "تصدير الطلبات تلقائياً إلى جداول بيانات Google لسهولة التقارير والمتابعة.",
    icon: FileText,
    iconBg: "#0F9D58",
    iconColor: "#fff",
    category: "التكاملات",
    provider: "Google",
    installed: true,
    route: "/admin/google-sheets",
  },

  // الدفع
  {
    id: "cod-payment",
    name: "الدفع عند الاستلام",
    description: "تمكين خيار الدفع عند الاستلام (COD) لعملائك بسهولة.",
    icon: CreditCard,
    iconBg: "#F59E0B",
    iconColor: "#fff",
    category: "الدفع",
    provider: "CodForm",
    installed: true,
    badge: "مفعل",
  },
  {
    id: "bank-transfer",
    name: "التحويل البنكي",
    description: "قبول المدفوعات عبر التحويل البنكي المباشر.",
    icon: CreditCard,
    iconBg: "#6366F1",
    iconColor: "#fff",
    category: "الدفع",
    provider: "CodForm",
    installed: true,
    badge: "مفعل",
  },

  // التسويق
  {
    id: "codform-pro",
    name: "CodForm PRO",
    description: "نموذج طلب متقدم مع خيارات الكمية والمتغيرات وتحسينات لزيادة معدل التحويل.",
    icon: Zap,
    iconBg: "#8B5CF6",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: true,
    badge: "PRO",
    route: "/admin/cod-form",
  },
  {
    id: "gift-system",
    name: "نظام الهدايا",
    description: "أضف هدايا مجانية للطلبات لزيادة معدل إتمام الشراء وقيمة السلة.",
    icon: Gift,
    iconBg: "#EC4899",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: true,
  },
  {
    id: "urgency-timer",
    name: "مؤقت العرض",
    description: "عداد تنازلي يخلق إحساس بالاستعجال لدى العملاء لتسريع قرار الشراء.",
    icon: Clock,
    iconBg: "#EF4444",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: false,
  },
  {
    id: "reviews",
    name: "التقييمات والمراجعات",
    description: "عرض تقييمات ومراجعات العملاء على صفحة المنتج لزيادة الثقة.",
    icon: Star,
    iconBg: "#F59E0B",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: true,
  },
  {
    id: "upsell",
    name: "Upsell & Cross-sell",
    description: "عرض منتجات إضافية ومكملة لزيادة قيمة السلة ومتوسط الطلب.",
    icon: ShoppingBag,
    iconBg: "#14B8A6",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: false,
  },
  {
    id: "abandoned-cart",
    name: "استرجاع السلات المتروكة",
    description: "إرسال رسائل تذكيرية للعملاء الذين لم يكملوا الشراء لاسترجاعهم.",
    icon: Megaphone,
    iconBg: "#F97316",
    iconColor: "#fff",
    category: "التسويق",
    provider: "CodForm",
    installed: false,
    badge: "قريباً",
  },
];

const categories = [...new Set(apps.map((a) => a.category))];

export default function AdminAppStore() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = apps.filter((app) => {
    const matchesSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.includes(search);
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = categories
    .filter((cat) => filtered.some((a) => a.category === cat))
    .map((cat) => ({
      category: cat,
      apps: filtered.filter((a) => a.category === cat),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">متجر التطبيقات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          استكشف التطبيقات التي تساعدك على البيع أكثر والنمو بشكل أسرع
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن تطبيق..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-11 rounded-xl bg-background border-border/60"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* App Categories */}
      {grouped.map(({ category, apps: catApps }) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h2 className="text-base font-bold text-foreground">{category}</h2>
            <span className="text-xs text-muted-foreground">({catApps.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {catApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد تطبيقات مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
}

function AppCard({ app, index }: { app: AppItem; index: number }) {
  const Icon = app.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`group relative rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${
        app.installed
          ? "bg-primary/[0.03] border-primary/20 hover:border-primary/40"
          : "bg-card border-border/60 hover:border-border"
      }`}
    >
      {/* Top row: icon + name + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: app.iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: app.iconColor }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground truncate">{app.name}</h3>
              {app.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    app.badge === "PRO"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : app.badge === "قريباً"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {app.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-green-600 font-medium">مجاني</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {app.installed ? (
            <>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              {app.route ? (
                <a
                  href={app.route}
                  className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </a>
              ) : (
                <button className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </>
          ) : app.badge === "قريباً" ? (
            <span className="text-[11px] text-muted-foreground font-medium px-2">قريباً</span>
          ) : (
            <button className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/70">بواسطة {app.provider}</p>
        {app.installed && (
          <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
            <Check className="w-3 h-3" />
            مُثبت
          </div>
        )}
      </div>
    </motion.div>
  );
}
