import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Settings, FileText, Plus, Pencil, Trash2,
  CheckCircle, XCircle, Clock, Send, Loader2, History, AlertTriangle,
  Wifi, WifiOff,
} from "lucide-react";

type WhatsAppSettings = {
  enabled: boolean;
  instance_id: string;
  token: string;
  events: string[];
};

type Template = {
  id: string;
  name: string;
  event: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type MessageLog = {
  id: string;
  order_id: string | null;
  template_id: string | null;
  phone: string;
  message_body: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

const EVENT_MAP: Record<string, string> = {
  confirmed: "عند تأكيد الطلب",
  shipped: "عند خروج الطلب للتوصيل",
  delivered: "عند التسليم",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  sent: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
};

export default function AdminWhatsApp() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"settings" | "templates" | "logs">("settings");
  const [loading, setLoading] = useState(true);

  // Settings
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false, instance_id: "", token: "", events: ["shipped"],
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", event: "shipped", body: "", is_active: true });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Logs
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "whatsapp_settings")
      .maybeSingle();
    if (data?.value) {
      setSettings(data.value as any);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const { data: existing } = await supabase
      .from("store_settings")
      .select("id")
      .eq("key", "whatsapp_settings")
      .maybeSingle();

    if (existing) {
      await supabase.from("store_settings").update({ value: settings as any }).eq("key", "whatsapp_settings");
    } else {
      await supabase.from("store_settings").insert({ key: "whatsapp_settings", value: settings as any });
    }
    toast({ title: "تم حفظ الإعدادات" });
    setSavingSettings(false);
  };

  const testConnection = async () => {
    if (!settings.instance_id || !settings.token) {
      toast({ title: "أدخل Instance ID و Token أولاً", variant: "destructive" });
      return;
    }
    setTestingConnection(true);
    try {
      const res = await fetch(`https://api.ultramsg.com/${settings.instance_id}/instance/status?token=${settings.token}`);
      const data = await res.json();
      if (data?.status?.accountStatus?.status === "authenticated") {
        setConnectionStatus("connected");
        toast({ title: "متصل بنجاح ✅" });
      } else {
        setConnectionStatus("disconnected");
        toast({ title: "غير متصل ❌", description: "تأكد من بيانات Ultramsg", variant: "destructive" });
      }
    } catch {
      setConnectionStatus("disconnected");
      toast({ title: "فشل الاتصال", variant: "destructive" });
    }
    setTestingConnection(false);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTemplates(data);
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: "", event: "shipped", body: "", is_active: true });
    setTemplateDialog(true);
  };

  const openEditTemplate = (t: Template) => {
    setEditingTemplate(t);
    setTemplateForm({ name: t.name, event: t.event, body: t.body, is_active: t.is_active });
    setTemplateDialog(true);
  };

  const saveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) {
      toast({ title: "أكمل جميع الحقول", variant: "destructive" });
      return;
    }
    setSavingTemplate(true);
    if (editingTemplate) {
      await supabase.from("whatsapp_templates").update({
        name: templateForm.name,
        event: templateForm.event,
        body: templateForm.body,
        is_active: templateForm.is_active,
      }).eq("id", editingTemplate.id);
    } else {
      await supabase.from("whatsapp_templates").insert({
        name: templateForm.name,
        event: templateForm.event,
        body: templateForm.body,
        is_active: templateForm.is_active,
      });
    }
    toast({ title: editingTemplate ? "تم التعديل" : "تم الإضافة" });
    setTemplateDialog(false);
    loadTemplates();
    setSavingTemplate(false);
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTarget) return;
    await supabase.from("whatsapp_templates").delete().eq("id", deleteTarget);
    toast({ title: "تم الحذف" });
    setDeleteTarget(null);
    loadTemplates();
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("whatsapp_message_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setLogs(data);
    setLogsLoading(false);
  };

  useEffect(() => {
    if (tab === "logs") loadLogs();
  }, [tab]);

  const toggleEvent = (event: string) => {
    setSettings(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-500" />
            واتساب
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إرسال رسائل تلقائية عبر Ultramsg</p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === "connected" && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
              <Wifi className="w-3 h-3" /> متصل
            </Badge>
          )}
          {connectionStatus === "disconnected" && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
              <WifiOff className="w-3 h-3" /> غير متصل
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/60 w-fit">
        {[
          { key: "settings", label: "الإعدادات", icon: Settings },
          { key: "templates", label: "القوالب", icon: FileText },
          { key: "logs", label: "سجل الإرسال", icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {tab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Enable/Disable */}
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">تفعيل نظام واتساب</h3>
                <p className="text-sm text-muted-foreground">إرسال رسائل تلقائية للعملاء</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="border-t border-border/30 pt-6 space-y-4">
              <h3 className="font-semibold">بيانات Ultramsg</h3>
              <p className="text-xs text-muted-foreground">
                احصل على البيانات من{" "}
                <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  ultramsg.com
                </a>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Instance ID</label>
                  <Input
                    value={settings.instance_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, instance_id: e.target.value }))}
                    placeholder="instance12345"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Token</label>
                  <Input
                    value={settings.token}
                    onChange={(e) => setSettings(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="your-token-here"
                    type="password"
                    dir="ltr"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={testConnection} disabled={testingConnection}>
                {testingConnection ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Wifi className="w-4 h-4 ml-1" />}
                اختبار الاتصال
              </Button>
            </div>

            <div className="border-t border-border/30 pt-6 space-y-4">
              <h3 className="font-semibold">أحداث الإرسال التلقائي</h3>
              <p className="text-xs text-muted-foreground">اختر متى يتم إرسال رسالة واتساب للعميل</p>
              <div className="space-y-3">
                {Object.entries(EVENT_MAP).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={settings.events.includes(key)}
                      onCheckedChange={() => toggleEvent(key)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates Tab */}
      {tab === "templates" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">قوالب الرسائل</h3>
            <Button size="sm" onClick={openNewTemplate}>
              <Plus className="w-4 h-4 ml-1" />
              قالب جديد
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الحدث</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      لا توجد قوالب
                    </TableCell>
                  </TableRow>
                ) : templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {EVENT_MAP[t.event] || t.event}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">مفعل</Badge>
                      ) : (
                        <Badge variant="secondary">معطل</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTemplate(t)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Variables Reference */}
          <div className="rounded-xl bg-muted/40 border border-border/30 p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              المتغيرات المتاحة
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { var: "{{name}}", desc: "اسم العميل" },
                { var: "{{product}}", desc: "اسم المنتج" },
                { var: "{{phone}}", desc: "رقم العميل" },
              ].map(({ var: v, desc }) => (
                <span key={v} className="inline-flex items-center gap-1 text-xs bg-card px-2.5 py-1 rounded-lg border border-border/50">
                  <code className="font-mono text-primary">{v}</code>
                  <span className="text-muted-foreground">= {desc}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs Tab */}
      {tab === "logs" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">سجل الرسائل</h3>
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={logsLoading}>
              {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4 ml-1" />}
              تحديث
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="hidden sm:table-cell">الرسالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      لا توجد رسائل مسجلة
                    </TableCell>
                  </TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell dir="ltr" className="font-mono text-sm">{log.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICONS[log.status]}
                        <span className="text-xs">
                          {log.status === "sent" ? "تم الإرسال" : log.status === "failed" ? "فشل" : "قيد الانتظار"}
                        </span>
                      </div>
                      {log.error_message && (
                        <p className="text-[10px] text-red-500 mt-0.5 max-w-[200px] truncate" title={log.error_message}>
                          {log.error_message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-xs text-muted-foreground max-w-[300px] truncate">{log.message_body}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "تعديل القالب" : "قالب جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">اسم القالب</label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: خرج للتوصيل"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">الحدث</label>
              <select
                value={templateForm.event}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, event: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(EVENT_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">نص الرسالة</label>
              <Textarea
                value={templateForm.body}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="مرحبًا {{name}}..."
                rows={6}
                className="resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={templateForm.is_active}
                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, is_active: checked }))}
              />
              <span className="text-sm">مفعل</span>
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>إلغاء</Button>
            <Button onClick={saveTemplate} disabled={savingTemplate}>
              {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDeleteTemplate}
        title="حذف القالب"
        description="هل أنت متأكد من حذف هذا القالب؟"
      />
    </div>
  );
}
