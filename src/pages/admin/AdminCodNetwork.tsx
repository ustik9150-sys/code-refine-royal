import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Send, Key, Globe, MapPin, RefreshCw } from "lucide-react";


interface CodNetworkSettings {
  enabled: boolean;
  api_token: string;
  default_country: string;
  default_city: string;
}

const DEFAULT: CodNetworkSettings = {
  enabled: false,
  api_token: "",
  default_country: "SA",
  default_city: "",
};

export default function AdminCodNetwork() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CodNetworkSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "cod_network")
        .maybeSingle();
      if (data?.value) {
        setSettings({ ...DEFAULT, ...(data.value as any) });
        if ((data.value as any).api_token) setConnected(true);
      }
      setLoaded(true);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("store_settings")
      .upsert({ key: "cod_network", value: settings as any }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: "فشل الحفظ", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ بنجاح ✅" });
    }
  };

  const testConnection = async () => {
    if (!settings.api_token) {
      toast({ title: "أدخل API Token أولاً", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      const res = await supabase.functions.invoke("cod-network-proxy", {
        body: { action: "test", api_token: settings.api_token },
      });
      if (res.error) throw res.error;
      const ok = res.data?.success !== false;
      setConnected(ok);
      toast({ title: ok ? "✅ الاتصال ناجح" : "❌ فشل الاتصال", variant: ok ? "default" : "destructive" });
    } catch {
      setConnected(false);
      toast({ title: "❌ فشل الاتصال", variant: "destructive" });
    }
    setTesting(false);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center border border-border shadow-sm">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">COD Network</h1>
          <p className="text-sm text-muted-foreground">إرسال الطلبات تلقائياً إلى COD Network</p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">تفعيل التكامل</p>
              <p className="text-xs text-muted-foreground">إرسال الطلبات تلقائياً عند إنشائها</p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, enabled: v }))}
          />
        </div>

        <div className="border-t border-border" />

        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">الحالة:</span>
          {connected === true ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" /> متصل
            </span>
          ) : connected === false ? (
            <span className="flex items-center gap-1.5 text-sm text-destructive font-medium">
              <XCircle className="w-4 h-4" /> غير متصل
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">غير محدد</span>
          )}
        </div>

        <div className="border-t border-border" />

        {/* API Token */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            API Token (Bearer)
          </label>
          <Input
            type="password"
            dir="ltr"
            placeholder="أدخل Bearer Token هنا"
            value={settings.api_token}
            onChange={(e) => setSettings((s) => ({ ...s, api_token: e.target.value }))}
            className="font-mono text-sm"
          />
        </div>

        {/* Default Country - Auto from currency */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            الدولة الافتراضية
          </label>
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
            🌍 يتم تحديد الدولة تلقائياً بناءً على عملة المنتج (مثال: ريال سعودي → SA)
          </p>
          <Input
            dir="ltr"
            placeholder="SA (احتياطي فقط)"
            value={settings.default_country}
            onChange={(e) => setSettings((s) => ({ ...s, default_country: e.target.value }))}
          />
          <p className="text-[11px] text-muted-foreground">تُستخدم فقط إذا لم يتم تحديد عملة للمنتج</p>

        {/* Default City */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            المدينة الافتراضية (اختياري)
          </label>
          <Input
            placeholder="مثال: الرياض"
            value={settings.default_city}
            onChange={(e) => setSettings((s) => ({ ...s, default_city: e.target.value }))}
          />
        </div>

        <div className="border-t border-border" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={save} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            حفظ الإعدادات
          </Button>
          <Button variant="outline" onClick={testConnection} disabled={testing} className="flex-1">
            {testing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <RefreshCw className="w-4 h-4 ml-2" />}
            اختبار الاتصال
          </Button>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-muted/50 p-5 space-y-2"
      >
        <h3 className="text-sm font-bold text-foreground">ℹ️ كيف يعمل</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>عند تفعيل التكامل، سيتم إرسال كل طلب جديد تلقائياً إلى COD Network</li>
          <li>يجب إدخال API Token الخاص بك من حساب COD Network</li>
          <li>تأكد من إضافة CodNetwork SKU لكل منتج في إعدادات المنتج</li>
          <li>في حال فشل الإرسال، سيتم حفظ الطلب محلياً ولن يتأثر</li>
        </ul>
      </motion.div>
    </div>
  );
}
