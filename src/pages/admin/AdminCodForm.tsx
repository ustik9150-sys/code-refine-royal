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
  const [activeTab, setActiveTab] = useState<"builder" | "design" | "messages">("builder");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .eq("key", "cod_form")
        .maybeSingle();
      if (data?.value) {
        setSettings({ ...DEFAULT_SETTINGS, ...(data.value as any) });
      }
      setLoading(false);
    })();
  }, []);

  const update = (key: keyof CodFormSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
