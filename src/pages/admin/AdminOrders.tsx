import React, { useEffect, useState, useMemo } from "react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Search, Eye, Phone, MessageCircle, CheckCircle, XCircle,
  ShoppingCart, Clock, TrendingUp, DollarSign, ChevronDown, ChevronUp,
  Package, Trash2, MapPin,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  city: string | null;
  total: number;
  status: string;
  payment_method: string;
  shipping_method: string;
  address: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  ip_address: string | null;
  ip_country: string | null;
  ip_city: string | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type AuditLog = {
  id: string;
  action_type: string;
  created_at: string;
  after_snapshot: any;
};

const STATUS_MAP: Record<string, { label: string; dot: string; bg: string; glow: string }> = {
  pending: { label: "قيد الانتظار", dot: "bg-amber-400", bg: "bg-amber-50 text-amber-700 border-amber-200", glow: "" },
  confirmed: { label: "مؤكد", dot: "bg-emerald-400", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", glow: "shadow-emerald-200/50" },
  shipped: { label: "تم الشحن", dot: "bg-blue-400", bg: "bg-blue-50 text-blue-700 border-blue-200", glow: "shadow-blue-200/50" },
  delivered: { label: "تم التسليم", dot: "bg-green-500", bg: "bg-green-50 text-green-700 border-green-200", glow: "" },
  cancelled: { label: "ملغي", dot: "bg-red-400", bg: "bg-red-50 text-red-700 border-red-200", glow: "" },
  refunded: { label: "مسترجع", dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600 border-gray-200", glow: "" },
};

const PAYMENT_MAP: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank_transfer: "تحويل بنكي",
  apple_pay: "Apple Pay",
  card: "بطاقة",
};

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
});

const isNew = (d: string) => Date.now() - new Date(d).getTime() < 30 * 60 * 1000;

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, suffix, gradient, delay }: {
  icon: React.ElementType; label: string; value: number; suffix?: string; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradient})` }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value.toLocaleString("en-US")}{suffix}</p>
        </div>
      </div>
    </motion.div>
  );
}

// --- Order Card (expandable) ---
function OrderCard({ order, index, onStatusChange, onOpen, onDelete }: {
  order: Order; index: number;
  onStatusChange: (id: string, status: string) => void;
  onOpen: (o: Order) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { currency } = useCurrency();
  const cs = currency.symbol;
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const orderIsNew = isNew(order.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      layout
      className={`group rounded-2xl border bg-card/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
        orderIsNew ? "border-blue-300/60 shadow-blue-100/30 shadow-md" : "border-border/50"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order # + NEW badge */}
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <span className="text-xs font-mono font-bold text-foreground">#{order.order_number}</span>
          {orderIsNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full"
            >
              جديد
            </motion.span>
          )}
        </div>

        {/* Customer */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{order.customer_name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {order.ip_city && order.ip_country && order.ip_city !== "غير معروف" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {order.ip_city}، {order.ip_country}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom"><p>موقع العميل حسب IP</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span>{order.city || "—"}</span>
            )}
            <span>· {formatDate(order.created_at)}</span>
          </p>
        </div>

        {/* Total */}
        <div className="text-left min-w-[80px] hidden sm:block">
          <p className="text-sm font-bold text-foreground">{order.total.toLocaleString("en-US")} {cs}</p>
          <p className="text-[10px] text-muted-foreground">{PAYMENT_MAP[order.payment_method] || order.payment_method}</p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${status.bg} ${status.glow}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot} ${order.status === "pending" ? "animate-pulse" : ""}`} />
          {status.label}
        </div>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onStatusChange(order.id, "confirmed")} title="تأكيد">
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <a href={`tel:${order.customer_phone}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="اتصال">
              <Phone className="w-4 h-4" />
            </Button>
          </a>
          <a href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" title="واتساب">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => onOpen(order)} title="تفاصيل">
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Expand chevron */}
        <div className="text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">الجوال</p>
                  <p className="font-medium" dir="ltr">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">المجموع</p>
                  <p className="font-bold">{order.total.toLocaleString("en-US")} {cs}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">الموقع (IP)</p>
                  <p className="font-medium flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {order.ip_city && order.ip_country && order.ip_city !== "غير معروف"
                      ? `${order.ip_city}، ${order.ip_country}`
                      : order.city || "غير معروف"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">العنوان</p>
                  <p className="font-medium">{order.address || "غير محدد"}</p>
                </div>
              </div>

              {order.notes && (
                <div className="bg-muted/60 rounded-xl p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">ملاحظات:</span> {order.notes}
                </div>
              )}

              {/* Mobile quick actions */}
              <div className="flex md:hidden items-center gap-2 flex-wrap">
                {order.status === "pending" && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1"
                    onClick={() => onStatusChange(order.id, "confirmed")}>
                    <CheckCircle className="w-3.5 h-3.5" /> تأكيد
                  </Button>
                )}
                <a href={`tel:${order.customer_phone}`}>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1">
                    <Phone className="w-3.5 h-3.5" /> اتصال
                  </Button>
                </a>
                <a href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-green-600">
                    <MessageCircle className="w-3.5 h-3.5" /> واتساب
                  </Button>
                </a>
                <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1"
                  onClick={() => onOpen(order)}>
                  <Eye className="w-3.5 h-3.5" /> تفاصيل
                </Button>
              </div>

              {/* Status change */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">تغيير الحالة:</span>
                <Select value={order.status} onValueChange={(v) => onStatusChange(order.id, v)}>
                  <SelectTrigger className="h-8 text-xs w-36 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Loading Skeleton ---
function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

// --- Empty State ---
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">لا توجد طلبات</h3>
      <p className="text-sm text-muted-foreground">ستظهر الطلبات هنا عند استلامها</p>
    </motion.div>
  );
}

// === MAIN ===
export default function AdminOrders() {
  const { currency } = useCurrency();
  const cs = currency.symbol;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [internalNotes, setInternalNotes] = useState("");
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "خطأ", description: "فشل تحميل الطلبات", variant: "destructive" });
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        toast({ title: "🛒 طلب جديد!", description: `طلب جديد من ${(payload.new as any).customer_name}` });
        fetchOrders();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          String(o.order_number).includes(q) ||
          (o.city || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today));
    return {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
      pending: orders.filter(o => o.status === "pending").length,
      confirmed: orders.filter(o => o.status === "confirmed").length,
    };
  }, [orders]);

  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    setInternalNotes(order.notes || "");
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setOrderItems((items as OrderItem[]) || []);

    const { data: logs } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", "order")
      .eq("entity_id", order.id)
      .order("created_at", { ascending: false });
    setAuditLogs((logs as AuditLog[]) || []);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as any })
      .eq("id", orderId);

    if (!error && user) {
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action_type: "status_change",
        entity_type: "order",
        entity_id: orderId,
        before_snapshot: { status: order?.status },
        after_snapshot: { status: newStatus },
      });
      toast({ title: "تم التحديث" });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        openOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const [deleteOrderTarget, setDeleteOrderTarget] = useState<string | null>(null);

  const confirmDeleteOrder = async () => {
    if (!deleteOrderTarget) return;
    const { error } = await supabase.from("orders").delete().eq("id", deleteOrderTarget);
    if (!error) {
      toast({ title: "تم حذف الطلب" });
      fetchOrders();
    }
    setDeleteOrderTarget(null);
  };

  const saveNotes = async () => {
    if (!selectedOrder) return;
    await supabase.from("orders").update({ notes: internalNotes }).eq("id", selectedOrder.id);
    toast({ title: "تم حفظ الملاحظات" });
  };

  const exportCSV = () => {
    const headers = ["رقم الطلب", "العميل", "الجوال", "المدينة", "المجموع", "الحالة", "الدفع", "التاريخ"];
    const rows = filtered.map((o) => [
      o.order_number, o.customer_name, o.customer_phone, o.city || "",
      o.total, STATUS_MAP[o.status]?.label || o.status,
      PAYMENT_MAP[o.payment_method] || o.payment_method,
      new Date(o.created_at).toLocaleDateString("en-US"),
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">🛒 الطلبات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} طلب</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-xl gap-2">
          <Download className="w-4 h-4" /> تصدير CSV
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ShoppingCart} label="طلبات اليوم" value={stats.todayCount}
          gradient="hsl(250 80% 65%), hsl(280 70% 55%)" delay={0.05} />
        <StatCard icon={DollarSign} label="إيرادات اليوم" value={stats.todayRevenue} suffix={` ${cs}`}
          gradient="hsl(160 70% 45%), hsl(140 60% 50%)" delay={0.1} />
        <StatCard icon={Clock} label="قيد الانتظار" value={stats.pending}
          gradient="hsl(40 85% 55%), hsl(30 80% 50%)" delay={0.15} />
        <StatCard icon={TrendingUp} label="مؤكدة" value={stats.confirmed}
          gradient="hsl(150 65% 45%), hsl(170 55% 40%)" delay={0.2} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap gap-3 sticky top-16 z-20 bg-background/80 backdrop-blur-sm py-3 -mx-1 px-1 rounded-xl"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب، الاسم، الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 rounded-xl admin-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Orders List */}
      {loading ? (
        <OrdersSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                index={i}
                onStatusChange={updateStatus}
                onOpen={openOrder}
                onDelete={(id) => setDeleteOrderTarget(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="text-right flex items-center gap-2">
                  <div className="admin-icon-box w-8 h-8">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  طلب #{selectedOrder.order_number}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Customer */}
                <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    معلومات العميل
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-xs text-muted-foreground">الاسم</span><p className="font-medium">{selectedOrder.customer_name}</p></div>
                    <div><span className="text-xs text-muted-foreground">الجوال</span><p className="font-medium" dir="ltr">{selectedOrder.customer_phone}</p></div>
                    <div>
                      <span className="text-xs text-muted-foreground">الموقع (IP)</span>
                      <p className="font-medium flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {selectedOrder.ip_city && selectedOrder.ip_country && selectedOrder.ip_city !== "غير معروف"
                          ? `${selectedOrder.ip_city}، ${selectedOrder.ip_country}`
                          : "غير معروف"}
                      </p>
                    </div>
                    {selectedOrder.address && <div><span className="text-xs text-muted-foreground">العنوان</span><p className="font-medium">{selectedOrder.address}</p></div>}
                    {selectedOrder.ip_address && <div><span className="text-xs text-muted-foreground">IP</span><p className="font-medium text-muted-foreground text-xs" dir="ltr">{selectedOrder.ip_address}</p></div>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <a href={`tel:${selectedOrder.customer_phone}`}>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1">
                        <Phone className="w-3.5 h-3.5" /> اتصال
                      </Button>
                    </a>
                    <a href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-green-600">
                        <MessageCircle className="w-3.5 h-3.5" /> واتساب
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">المنتجات</h4>
                  {orderItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">لا توجد منتجات</p>
                  ) : (
                    <div className="border border-border/50 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead className="text-xs">المنتج</TableHead><TableHead className="text-xs">الكمية</TableHead><TableHead className="text-xs">السعر</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm">{item.product_name}</TableCell>
                              <TableCell className="text-sm">{item.quantity}</TableCell>
                              <TableCell className="text-sm">{item.total_price} {cs}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">تغيير الحالة</h4>
                  <Select value={selectedOrder.status} onValueChange={(v) => updateStatus(selectedOrder.id, v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">ملاحظات داخلية</h4>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full border border-border rounded-xl p-3 text-sm min-h-[80px] bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="أضف ملاحظة..."
                  />
                  <Button size="sm" onClick={saveNotes} className="rounded-xl">حفظ الملاحظات</Button>
                </div>

                {/* Audit */}
                {auditLogs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">سجل التغييرات</h4>
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="bg-muted/50 rounded-xl p-3 text-xs flex items-center gap-2">
                          <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                          {log.action_type === "status_change" && (
                            <span className="flex items-center gap-1">
                              → <span className={`px-2 py-0.5 rounded-full border text-[10px] ${STATUS_MAP[log.after_snapshot?.status]?.bg}`}>
                                {STATUS_MAP[log.after_snapshot?.status]?.label}
                              </span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={!!deleteOrderTarget}
        onOpenChange={(open) => !open && setDeleteOrderTarget(null)}
        onConfirm={confirmDeleteOrder}
        title="حذف الطلب"
        description="هل أنت متأكد أنك تريد حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}
