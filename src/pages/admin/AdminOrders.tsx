import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Eye } from "lucide-react";

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "تم الشحن", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "تم التسليم", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
  refunded: { label: "مسترجع", color: "bg-gray-100 text-gray-800" },
};

const PAYMENT_MAP: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank_transfer: "تحويل بنكي",
  apple_pay: "Apple Pay",
  card: "بطاقة",
};

export default function AdminOrders() {
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
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
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

  const saveNotes = async () => {
    if (!selectedOrder) return;
    await supabase.from("orders").update({ notes: internalNotes }).eq("id", selectedOrder.id);
    toast({ title: "تم حفظ الملاحظات" });
  };

  const exportCSV = () => {
    const headers = ["رقم الطلب", "العميل", "الجوال", "المدينة", "المجموع", "الحالة", "الدفع", "التاريخ"];
    const rows = filtered.map((o) => [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.city || "",
      o.total,
      STATUS_MAP[o.status]?.label || o.status,
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">الطلبات</h2>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 ml-2" /> تصدير CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب، الاسم، الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد طلبات</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead className="hidden md:table-cell">المدينة</TableHead>
                <TableHead>المجموع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="hidden lg:table-cell">الدفع</TableHead>
                <TableHead className="hidden lg:table-cell">التاريخ</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">{order.customer_phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{order.city || "—"}</TableCell>
                  <TableCell className="font-semibold text-sm">{order.total} ر.س</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => updateStatus(order.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28 border-0 p-0">
                        <Badge className={`${STATUS_MAP[order.status]?.color} text-xs`}>
                          {STATUS_MAP[order.status]?.label}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_MAP).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {PAYMENT_MAP[order.payment_method] || order.payment_method}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="text-right">
                  طلب #{selectedOrder.order_number}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Customer info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">معلومات العميل</h4>
                  <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                    <p>الاسم: {selectedOrder.customer_name}</p>
                    <p dir="ltr" className="text-left">الجوال: {selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && <p>البريد: {selectedOrder.customer_email}</p>}
                    {selectedOrder.city && <p>المدينة: {selectedOrder.city}</p>}
                    {selectedOrder.address && <p>العنوان: {selectedOrder.address}</p>}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">المنتجات</h4>
                  {orderItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">لا توجد منتجات</p>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">المنتج</TableHead>
                            <TableHead className="text-xs">الكمية</TableHead>
                            <TableHead className="text-xs">السعر</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm">{item.product_name}</TableCell>
                              <TableCell className="text-sm">{item.quantity}</TableCell>
                              <TableCell className="text-sm">{item.total_price} ر.س</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Status change */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">تغيير الحالة</h4>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(v) => updateStatus(selectedOrder.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Internal notes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">ملاحظات داخلية</h4>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm min-h-[80px] bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="أضف ملاحظة..."
                  />
                  <Button size="sm" onClick={saveNotes}>حفظ الملاحظات</Button>
                </div>

                {/* Audit timeline */}
                {auditLogs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">سجل التغييرات</h4>
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="bg-muted rounded-lg p-2 text-xs">
                          <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                          {" — "}
                          {log.action_type === "status_change" && (
                            <span>
                              تغيير الحالة إلى{" "}
                              <Badge className={`${STATUS_MAP[log.after_snapshot?.status]?.color} text-xs`}>
                                {STATUS_MAP[log.after_snapshot?.status]?.label}
                              </Badge>
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
    </div>
  );
}
