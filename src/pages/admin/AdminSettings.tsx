import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Facebook } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store info
  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

  // Shipping
  const [fixedRate, setFixedRate] = useState("30");
  const [freeThreshold, setFreeThreshold] = useState("200");

  // Payment
  const [codEnabled, setCodEnabled] = useState(true);

  // Pixel
  const [pixelId, setPixelId] = useState("");
  const [pixelEnabled, setPixelEnabled] = useState(false);

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
            setPixelId(v.facebook_pixel_id || "");
            setPixelEnabled(v.pixel_enabled ?? false);
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
        value: { facebook_pixel_id: pixelId.trim(), pixel_enabled: pixelEnabled },
      }, { onConflict: "key" });

      toast({ title: "تم حفظ الإعدادات" });
    } catch {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>;
  }

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

      {/* Facebook Pixel */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Facebook className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-foreground">فيسبوك بيكسل</h3>
        </div>
        <p className="text-sm text-muted-foreground">أضف معرف البيكسل لتتبع التحويلات والأحداث على متجرك</p>
        <div className="flex items-center gap-3">
          <Switch checked={pixelEnabled} onCheckedChange={setPixelEnabled} />
          <Label>تفعيل البيكسل</Label>
        </div>
        <div>
          <Label>معرف البيكسل (Pixel ID)</Label>
          <Input
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="مثال: 123456789012345"
            dir="ltr"
            className="mt-1 font-mono"
          />
        </div>
        {pixelId && pixelEnabled && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            البيكسل مفعل — المعرف: {pixelId}
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="w-4 h-4 ml-2" />
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </div>
  );
}
