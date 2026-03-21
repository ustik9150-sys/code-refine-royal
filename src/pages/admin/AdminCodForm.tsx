import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, FileText, Sparkles, Shield, Type, Palette, BarChart3, Facebook } from "lucide-react";

interface CodFormSettings {
  form_title: string;
  form_subtitle: string;
  button_text: string;
  button_color: string;
  show_city_field: boolean;
  city_field_required: boolean;
  show_urgency_text: boolean;
  urgency_text: string;
  show_trust_badges: boolean;
  trust_badge_1: string;
  trust_badge_2: string;
  trust_badge_3: string;
  success_message: string;
  name_placeholder: string;
  phone_placeholder: string;
  city_placeholder: string;
}

interface PixelConfig {
  facebook_pixel_id: string;
  facebook_enabled: boolean;
  snapchat_pixel_id: string;
  snapchat_enabled: boolean;
  tiktok_pixel_id: string;
  tiktok_enabled: boolean;
  google_ads_id: string;
  google_ads_enabled: boolean;
}

const defaultPixels: PixelConfig = {
  facebook_pixel_id: "",
  facebook_enabled: false,
  snapchat_pixel_id: "",
  snapchat_enabled: false,
  tiktok_pixel_id: "",
  tiktok_enabled: false,
  google_ads_id: "",
  google_ads_enabled: false,
};

const DEFAULT_SETTINGS: CodFormSettings = {
  form_title: "للطلب ادخل معلوماتك في الخانات اسفله",
  form_subtitle: "الدفع عند الاستلام - توصيل سريع",
  button_text: "اضغط لتأكيد الطلب",
  button_color: "destructive",
  show_city_field: false,
  city_field_required: false,
  show_urgency_text: true,
  urgency_text: "⚡ بقيت كميات محدودة!",
  show_trust_badges: true,
  trust_badge_1: "الدفع عند الاستلام",
  trust_badge_2: "توصيل سريع",
  trust_badge_3: "ضمان الجودة",
  success_message: "تم تأكيد طلبك بنجاح!",
  name_placeholder: "ادخل اسمك هنا",
  phone_placeholder: "ادخل رقم هاتفك هنا",
  city_placeholder: "المدينة / العنوان",
};

export default function AdminCodForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CodFormSettings>(DEFAULT_SETTINGS);
  const [pixels, setPixels] = useState<PixelConfig>(defaultPixels);
  const [activeTab, setActiveTab] = useState<"builder" | "design" | "messages" | "pixels">("builder");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .in("key", ["cod_form", "tracking"]);
      if (data) {
        for (const row of data) {
          const v = row.value as any;
          if (row.key === "cod_form") {
            setSettings({ ...DEFAULT_SETTINGS, ...v });
          } else if (row.key === "tracking") {
            setPixels({
              facebook_pixel_id: v.facebook_pixel_id || "",
              facebook_enabled: v.facebook_enabled ?? v.pixel_enabled ?? false,
              snapchat_pixel_id: v.snapchat_pixel_id || "",
              snapchat_enabled: v.snapchat_enabled ?? false,
              tiktok_pixel_id: v.tiktok_pixel_id || "",
              tiktok_enabled: v.tiktok_enabled ?? false,
              google_ads_id: v.google_ads_id || "",
              google_ads_enabled: v.google_ads_enabled ?? false,
            });
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  const update = (key: keyof CodFormSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updatePixel = (key: keyof PixelConfig, value: string | boolean) => {
    setPixels((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("key", "cod_form")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("store_settings")
          .update({ value: settings as any })
          .eq("key", "cod_form");
      } else {
        await supabase
          .from("store_settings")
          .insert({ key: "cod_form", value: settings as any });
      }

      await supabase.from("store_settings").upsert({
        key: "tracking",
        value: pixels as any,
      }, { onConflict: "key" });

      toast({ title: "تم حفظ إعدادات الفورم" });
    } catch {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>;
  }

  const tabs = [
    { id: "builder" as const, label: "بناء الفورم", icon: FileText },
    { id: "design" as const, label: "التصميم", icon: Palette },
    { id: "messages" as const, label: "الرسائل", icon: Type },
    { id: "pixels" as const, label: "البيكسلات", icon: BarChart3 },
  ];

  const pixelSections = [
    {
      title: "فيسبوك بيكسل",
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      enabledKey: "facebook_enabled" as const,
      idKey: "facebook_pixel_id" as const,
      placeholder: "مثال: 123456789012345",
    },
    {
      title: "سناب شات بيكسل",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FFFC00"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.603.603 0 0 1 .272-.067c.12 0 .24.03.34.09.18.09.3.27.3.48a.602.602 0 0 1-.36.54c-.12.06-.63.27-1.35.42-.06.016-.12.03-.18.045-.012.002-.024.006-.036.008l-.012.003c-.006 0-.12.03-.18.045a.376.376 0 0 0-.27.315c-.006.06 0 .12.015.18.39.9.9 1.74 1.53 2.43.81.87 1.83 1.47 2.97 1.71a.588.588 0 0 1 .48.57.6.6 0 0 1-.12.36c-.39.54-1.14.93-2.25 1.17-.06.012-.09.045-.12.09l-.015.06c-.03.12-.06.27-.105.39a.583.583 0 0 1-.57.39c-.12 0-.24-.015-.36-.06-.27-.075-.57-.105-.87-.105-.18 0-.36.015-.54.045-.36.06-.69.195-1.05.345-.51.21-1.08.45-1.86.45h-.06c-.78 0-1.35-.24-1.86-.45-.36-.15-.69-.285-1.05-.345a3.34 3.34 0 0 0-.54-.045c-.3 0-.6.03-.87.105a1.2 1.2 0 0 1-.36.06.59.59 0 0 1-.57-.39c-.045-.12-.075-.27-.105-.39l-.015-.06c-.03-.045-.06-.075-.12-.09-1.11-.24-1.86-.63-2.25-1.17a.59.59 0 0 1-.12-.36.588.588 0 0 1 .48-.57c1.14-.24 2.16-.84 2.97-1.71.63-.69 1.14-1.53 1.53-2.43a.394.394 0 0 0 .015-.18.376.376 0 0 0-.27-.315c-.06-.015-.174-.045-.18-.045l-.012-.003a1.478 1.478 0 0 1-.036-.008c-.06-.015-.12-.03-.18-.045-.72-.15-1.23-.36-1.35-.42a.602.602 0 0 1-.36-.54c0-.21.12-.39.3-.48a.58.58 0 0 1 .34-.09c.09 0 .18.015.27.067.374.18.733.317 1.033.301.198 0 .326-.045.401-.09a9.3 9.3 0 0 1-.03-.51l-.003-.06c-.105-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793Z"/></svg>,
      enabledKey: "snapchat_enabled" as const,
      idKey: "snapchat_pixel_id" as const,
      placeholder: "مثال: abc123-def456",
    },
    {
      title: "تيك توك بيكسل",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16Z"/></svg>,
      enabledKey: "tiktok_enabled" as const,
      idKey: "tiktok_pixel_id" as const,
      placeholder: "مثال: C1234567890",
    },
    {
      title: "Google Ads",
      icon: <BarChart3 className="w-5 h-5 text-[#4285F4]" />,
      enabledKey: "google_ads_enabled" as const,
      idKey: "google_ads_id" as const,
      placeholder: "مثال: AW-123456789",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            CodForm by Elbekay
          </h2>
          <p className="text-sm text-muted-foreground mt-1">تحكم في نموذج الطلب وتخصيصه</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 ml-2" />
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Builder Tab */}
      {activeTab === "builder" && (
        <div className="space-y-6">
          {/* Form Fields Config */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              حقول الفورم
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="font-medium text-foreground">الاسم الكامل</p>
                  <p className="text-xs text-muted-foreground">حقل مطلوب دائماً</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">مطلوب</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="font-medium text-foreground">رقم الهاتف</p>
                  <p className="text-xs text-muted-foreground">حقل مطلوب دائماً</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">مطلوب</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="font-medium text-foreground">المدينة / العنوان</p>
                  <p className="text-xs text-muted-foreground">حقل إضافي اختياري</p>
                </div>
                <div className="flex items-center gap-3">
                  {settings.show_city_field && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.city_field_required}
                        onCheckedChange={(v) => update("city_field_required", v)}
                      />
                      <Label className="text-xs">مطلوب</Label>
                    </div>
                  )}
                  <Switch
                    checked={settings.show_city_field}
                    onCheckedChange={(v) => update("show_city_field", v)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Placeholders */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">نصوص الحقول</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>placeholder الاسم</Label>
                <Input value={settings.name_placeholder} onChange={(e) => update("name_placeholder", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>placeholder الهاتف</Label>
                <Input value={settings.phone_placeholder} onChange={(e) => update("phone_placeholder", e.target.value)} className="mt-1" />
              </div>
              {settings.show_city_field && (
                <div>
                  <Label>placeholder المدينة</Label>
                  <Input value={settings.city_placeholder} onChange={(e) => update("city_placeholder", e.target.value)} className="mt-1" />
                </div>
              )}
            </div>
          </div>

          {/* Conversion Boosters */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              تعزيز التحويلات
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>نص الاستعجال</Label>
                <Switch checked={settings.show_urgency_text} onCheckedChange={(v) => update("show_urgency_text", v)} />
              </div>
              {settings.show_urgency_text && (
                <Input value={settings.urgency_text} onChange={(e) => update("urgency_text", e.target.value)} />
              )}

              <div className="flex items-center justify-between">
                <Label>شارات الثقة</Label>
                <Switch checked={settings.show_trust_badges} onCheckedChange={(v) => update("show_trust_badges", v)} />
              </div>
              {settings.show_trust_badges && (
                <div className="grid gap-3 md:grid-cols-3">
                  <Input value={settings.trust_badge_1} onChange={(e) => update("trust_badge_1", e.target.value)} />
                  <Input value={settings.trust_badge_2} onChange={(e) => update("trust_badge_2", e.target.value)} />
                  <Input value={settings.trust_badge_3} onChange={(e) => update("trust_badge_3", e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Design Tab */}
      {activeTab === "design" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              عنوان الفورم
            </h3>
            <div>
              <Label>العنوان الرئيسي</Label>
              <Input value={settings.form_title} onChange={(e) => update("form_title", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>العنوان الفرعي</Label>
              <Input value={settings.form_subtitle} onChange={(e) => update("form_subtitle", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">زر التأكيد</h3>
            <div>
              <Label>نص الزر</Label>
              <Input value={settings.button_text} onChange={(e) => update("button_text", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>لون الزر</Label>
              <div className="flex gap-3 mt-2">
                {[
                  { id: "destructive", label: "أحمر", className: "bg-destructive" },
                  { id: "primary", label: "أساسي", className: "bg-primary" },
                  { id: "green", label: "أخضر", className: "bg-emerald-600" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => update("button_color", c.id)}
                    className={`w-10 h-10 rounded-xl ${c.className} border-2 transition-all ${
                      settings.button_color === c.id ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              معاينة
            </h3>
            <div className="max-w-sm mx-auto" dir="rtl">
              <div className="border-2 border-destructive rounded-2xl overflow-hidden bg-card">
                <div className="px-5 py-4 text-center">
                  <h3 className="text-lg font-bold text-foreground">{settings.form_title}</h3>
                  {settings.form_subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{settings.form_subtitle}</p>
                  )}
                </div>
                <div className="px-5 pb-5 space-y-3">
                  <div className="h-11 rounded-xl border border-input bg-background flex items-center px-4">
                    <span className="text-sm text-muted-foreground">{settings.name_placeholder}</span>
                  </div>
                  <div className="h-11 rounded-xl border border-input bg-background flex items-center px-4">
                    <span className="text-sm text-muted-foreground">{settings.phone_placeholder}</span>
                  </div>
                  {settings.show_city_field && (
                    <div className="h-11 rounded-xl border border-input bg-background flex items-center px-4">
                      <span className="text-sm text-muted-foreground">{settings.city_placeholder}</span>
                    </div>
                  )}
                  {settings.show_urgency_text && (
                    <p className="text-center text-xs font-bold text-destructive">{settings.urgency_text}</p>
                  )}
                  <div
                    className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                      settings.button_color === "primary"
                        ? "bg-primary"
                        : settings.button_color === "green"
                        ? "bg-emerald-600"
                        : "bg-destructive"
                    }`}
                  >
                    {settings.button_text}
                  </div>
                  {settings.show_trust_badges && (
                    <div className="flex justify-center gap-3 text-[10px] text-muted-foreground">
                      <span>✓ {settings.trust_badge_1}</span>
                      <span>✓ {settings.trust_badge_2}</span>
                      <span>✓ {settings.trust_badge_3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              رسائل النموذج
            </h3>
            <div>
              <Label>رسالة النجاح بعد الطلب</Label>
              <Textarea
                value={settings.success_message}
                onChange={(e) => update("success_message", e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
