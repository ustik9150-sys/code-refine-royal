import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trash2, Sparkles, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [generateCount, setGenerateCount] = useState("50");
  const [editReview, setEditReview] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewer_name: "",
    reviewer_gender: "male",
    rating: 5,
    comment: "",
    badge_type: "verified_purchase",
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name_ar, category").order("name_ar");
      return data || [];
    },
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews", selectedProduct],
    queryFn: async () => {
      if (!selectedProduct) return [];
      const { data } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", selectedProduct)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!selectedProduct,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const product = products.find((p) => p.id === selectedProduct);
      if (!product) throw new Error("اختر منتج أولاً");
      const { data, error } = await supabase.functions.invoke("generate-reviews", {
        body: {
          productId: selectedProduct,
          productName: product.name_ar,
          productCategory: product.category,
          count: parseInt(generateCount),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`تم توليد ${data.count} تقييم بنجاح`);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", selectedProduct] });
    },
    onError: (e: any) => toast.error(e.message || "حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", selectedProduct] });
      setDeleteId(null);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_reviews").delete().eq("product_id", selectedProduct);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف جميع التقييمات");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", selectedProduct] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (review: any) => {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          reviewer_name: review.reviewer_name,
          comment: review.comment,
          rating: review.rating,
          badge_type: review.badge_type,
          is_highlighted: review.is_highlighted,
          highlight_label: review.highlight_label,
        })
        .eq("id", review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم التحديث");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", selectedProduct] });
      setEditReview(null);
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: selectedProduct,
        ...newReview,
        review_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت الإضافة");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", selectedProduct] });
      setAddOpen(false);
      setNewReview({ reviewer_name: "", reviewer_gender: "male", rating: 5, comment: "", badge_type: "verified_purchase" });
    },
  });

  const selectedProductName = products.find((p) => p.id === selectedProduct)?.name_ar;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">التقييمات والمراجعات</h1>
        <p className="text-sm text-muted-foreground mt-1">توليد وإدارة تقييمات المنتجات</p>
      </div>

      {/* Product Selector */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المنتج" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProduct && (
          <div className="flex flex-wrap gap-2">
            <Select value={generateCount} onValueChange={setGenerateCount}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 تقييم</SelectItem>
                <SelectItem value="50">50 تقييم</SelectItem>
                <SelectItem value="100">100 تقييم</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              توليد تقييمات بالذكاء الاصطناعي
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> إضافة يدوي
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>إضافة تقييم يدوي</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="اسم المراجع"
                    value={newReview.reviewer_name}
                    onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Select value={String(newReview.rating)} onValueChange={(v) => setNewReview({ ...newReview, rating: Number(v) })}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} ⭐</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={newReview.reviewer_gender} onValueChange={(v) => setNewReview({ ...newReview, reviewer_gender: v })}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="التعليق"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                  <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !newReview.reviewer_name || !newReview.comment} className="w-full">
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {reviews.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => deleteAllMutation.mutate()} disabled={deleteAllMutation.isPending}>
                حذف الكل ({reviews.length})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reviews List */}
      {selectedProduct && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{reviews.length} تقييم لـ {selectedProductName}</div>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              لا توجد تقييمات بعد. استخدم زر "توليد تقييمات" لإنشاء تقييمات تلقائياً.
            </div>
          ) : (
            reviews.map((r: any) => (
              <div key={r.id} className="bg-card border border-border rounded-lg p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold">{r.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                      ))}
                    </div>
                    {r.is_highlighted && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">{r.highlight_label}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.comment}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setEditReview({ ...r })}>تعديل</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editReview} onOpenChange={(o) => !o && setEditReview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل التقييم</DialogTitle></DialogHeader>
          {editReview && (
            <div className="space-y-3">
              <Input value={editReview.reviewer_name} onChange={(e) => setEditReview({ ...editReview, reviewer_name: e.target.value })} />
              <Select value={String(editReview.rating)} onValueChange={(v) => setEditReview({ ...editReview, rating: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} ⭐</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea value={editReview.comment} onChange={(e) => setEditReview({ ...editReview, comment: e.target.value })} />
              <Button onClick={() => updateMutation.mutate(editReview)} disabled={updateMutation.isPending} className="w-full">
                حفظ التعديلات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="حذف التقييم"
        description="هل أنت متأكد من حذف هذا التقييم؟"
      />
    </div>
  );
}
