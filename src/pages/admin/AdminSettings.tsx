import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Save, Store, Truck, CreditCard, Loader2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
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

      toast({ title: "✅ تم حفظ الإعدادات بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-28">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground">الإعدادات</h2>
        <p className="text-sm text-muted-foreground mt-1">إدارة إعدادات متجرك وتخصيصه</p>
      </motion.div>

      {/* Store Info Card */}
      <motion.div
        className="admin-card"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="admin-icon-box">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">معلومات المتجر</h3>
            <p className="text-xs text-muted-foreground mt-0.5">اسم المتجر وبيانات الدعم</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">اسم المتجر</Label>
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="admin-input pr-10"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">بريد الدعم</Label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                dir="ltr"
                className="admin-input text-left"
                placeholder="support@store.com"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">هاتف الدعم</Label>
              <Input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                dir="ltr"
                className="admin-input text-left"
                placeholder="+966 5XX XXX XXXX"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shipping Card */}
      <motion.div
        className="admin-card"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="admin-icon-box">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">إعدادات الشحن</h3>
            <p className="text-xs text-muted-foreground mt-0.5">تكاليف وخيارات التوصيل</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">سعر الشحن الثابت (ر.س)</Label>
            <Input
              type="number"
              value={fixedRate}
              onChange={(e) => setFixedRate(e.target.value)}
              dir="ltr"
              className="admin-input text-left"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">حد الشحن المجاني (ر.س)</Label>
            <Input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              dir="ltr"
              className="admin-input text-left"
            />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
          💡 الطلبات فوق <span className="font-bold text-foreground">{freeThreshold} ر.س</span> ستحصل على شحن مجاني
        </div>
      </motion.div>

      {/* Payment Card */}
      <motion.div
        className="admin-card"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="admin-icon-box">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">إعدادات الدفع</h3>
            <p className="text-xs text-muted-foreground mt-0.5">طرق الدفع المتاحة في متجرك</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="text-base">💵</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">الدفع عند الاستلام</p>
              <p className="text-xs text-muted-foreground">يدفع العميل عند استلام الطلب</p>
            </div>
          </div>
          <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
        </div>
      </motion.div>

      {/* Sticky Save Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 lg:right-auto lg:left-0 z-30 p-4"
        style={{ maxWidth: "calc(100% - 16rem)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
