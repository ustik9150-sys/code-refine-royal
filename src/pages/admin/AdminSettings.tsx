import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Facebook, BarChart3 } from "lucide-react";

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

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [fixedRate, setFixedRate] = useState("30");
  const [freeThreshold, setFreeThreshold] = useState("200");
  const [codEnabled, setCodEnabled] = useState(true);
  const [pixels, setPixels] = useState<PixelConfig>(defaultPixels);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("store_settings").select("*");
      if (data) {
        for (const row of data) {
          const v = row.value as any;
          if (row.key === "store_info") {
            setStoreName(v.name || "");
            setSupportEmail(v.support_email || "");
            setSupportPhone(v.support_phone || "");
          } else if (row.key === "shipping") {
            setFixedRate(String(v.fixed_rate ?? 30));
            setFreeThreshold(String(v.free_shipping_threshold ?? 200));
          } else if (row.key === "payment") {
            setCodEnabled(v.cod_enabled ?? true);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("store_settings").update({
        value: { name: storeName, support_email: supportEmail, support_phone: supportPhone },
      }).eq("key", "store_info");

      await supabase.from("store_settings").update({
        value: { fixed_rate: parseFloat(fixedRate) || 0, free_shipping_threshold: parseFloat(freeThreshold) || 0 },
      }).eq("key", "shipping");

      await supabase.from("store_settings").update({
        value: { cod_enabled: codEnabled },
      }).eq("key", "payment");

      await supabase.from("store_settings").upsert({
        key: "tracking",
        value: pixels as any,
      }, { onConflict: "key" });

      toast({ title: "تم حفظ الإعدادات" });
    } catch {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updatePixel = (key: keyof PixelConfig, value: string | boolean) => {
    setPixels((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>;
  }

  const pixelSections = [
    {
      title: "فيسبوك بيكسل",
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      enabledKey: "facebook_enabled" as const,
      idKey: "facebook_pixel_id" as const,
      placeholder: "مثال: 123456789012345",
      color: "#1877F2",
    },
    {
      title: "سناب شات بيكسل",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FFFC00"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.603.603 0 0 1 .272-.067c.12 0 .24.03.34.09.18.09.3.27.3.48a.602.602 0 0 1-.36.54c-.12.06-.63.27-1.35.42-.06.016-.12.03-.18.045-.012.002-.024.006-.036.008l-.012.003c-.006 0-.12.03-.18.045a.376.376 0 0 0-.27.315c-.006.06 0 .12.015.18.39.9.9 1.74 1.53 2.43.81.87 1.83 1.47 2.97 1.71a.588.588 0 0 1 .48.57.6.6 0 0 1-.12.36c-.39.54-1.14.93-2.25 1.17-.06.012-.09.045-.12.09l-.015.06c-.03.12-.06.27-.105.39a.583.583 0 0 1-.57.39c-.12 0-.24-.015-.36-.06-.27-.075-.57-.105-.87-.105-.18 0-.36.015-.54.045-.36.06-.69.195-1.05.345-.51.21-1.08.45-1.86.45h-.06c-.78 0-1.35-.24-1.86-.45-.36-.15-.69-.285-1.05-.345a3.34 3.34 0 0 0-.54-.045c-.3 0-.6.03-.87.105a1.2 1.2 0 0 1-.36.06.59.59 0 0 1-.57-.39c-.045-.12-.075-.27-.105-.39l-.015-.06c-.03-.045-.06-.075-.12-.09-1.11-.24-1.86-.63-2.25-1.17a.59.59 0 0 1-.12-.36.588.588 0 0 1 .48-.57c1.14-.24 2.16-.84 2.97-1.71.63-.69 1.14-1.53 1.53-2.43a.394.394 0 0 0 .015-.18.376.376 0 0 0-.27-.315c-.06-.015-.174-.045-.18-.045l-.012-.003a1.478 1.478 0 0 1-.036-.008c-.06-.015-.12-.03-.18-.045-.72-.15-1.23-.36-1.35-.42a.602.602 0 0 1-.36-.54c0-.21.12-.39.3-.48a.58.58 0 0 1 .34-.09c.09 0 .18.015.27.067.374.18.733.317 1.033.301.198 0 .326-.045.401-.09a9.3 9.3 0 0 1-.03-.51l-.003-.06c-.105-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793Z"/></svg>,
      enabledKey: "snapchat_enabled" as const,
      idKey: "snapchat_pixel_id" as const,
      placeholder: "مثال: abc123-def456",
      color: "#FFFC00",
    },
    {
      title: "تيك توك بيكسل",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16Z"/></svg>,
      enabledKey: "tiktok_enabled" as const,
      idKey: "tiktok_pixel_id" as const,
      placeholder: "مثال: C1234567890",
      color: "#000000",
    },
    {
      title: "Google Ads",
      icon: <BarChart3 className="w-5 h-5 text-[#4285F4]" />,
      enabledKey: "google_ads_enabled" as const,
      idKey: "google_ads_id" as const,
      placeholder: "مثال: AW-123456789",
      color: "#4285F4",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-foreground">الإعدادات</h2>

      {/* Store Info */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">معلومات المتجر</h3>
        <div>
          <Label>اسم المتجر</Label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>بريد الدعم</Label>
          <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} dir="ltr" className="mt-1" />
        </div>
        <div>
          <Label>هاتف الدعم</Label>
          <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} dir="ltr" className="mt-1" />
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">إعدادات الشحن</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>سعر الشحن الثابت (ر.س)</Label>
            <Input type="number" value={fixedRate} onChange={(e) => setFixedRate(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label>حد الشحن المجاني (ر.س)</Label>
            <Input type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} dir="ltr" className="mt-1" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">إعدادات الدفع</h3>
        <div className="flex items-center gap-3">
          <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
          <Label>الدفع عند الاستلام</Label>
        </div>
      </div>

      {/* Tracking Pixels */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">أكواد التتبع (Pixels)</h3>
        </div>
        <p className="text-sm text-muted-foreground">أضف معرفات البيكسل لتتبع التحويلات والأحداث على متجرك</p>

        <div className="space-y-5">
          {pixelSections.map((section) => (
            <div key={section.idKey} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium text-sm text-foreground">{section.title}</span>
                </div>
                <Switch
                  checked={pixels[section.enabledKey] as boolean}
                  onCheckedChange={(v) => updatePixel(section.enabledKey, v)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">معرف البيكسل</Label>
                <Input
                  value={pixels[section.idKey] as string}
                  onChange={(e) => updatePixel(section.idKey, e.target.value)}
                  placeholder={section.placeholder}
                  dir="ltr"
                  className="mt-1 font-mono text-sm"
                />
              </div>
              {pixels[section.idKey] && pixels[section.enabledKey] && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  مفعل
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="w-4 h-4 ml-2" />
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </div>
  );
}
