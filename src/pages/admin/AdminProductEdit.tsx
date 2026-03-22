import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCIES } from "@/hooks/useCurrency";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import {
  ArrowRight, Save, Upload, X, GripVertical, Star, Trash2, Package,
  ImagePlus, Loader2, Eye, Tag,
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ProductImage = {
  id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
  is_main: boolean;
};

// --- Sortable Image ---
function SortableImage({ img, onSetMain, onDelete }: {
  img: ProductImage; onSetMain: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-border/50 bg-muted shadow-sm">
      <div {...attributes} {...listeners} className="absolute top-1.5 right-1.5 z-10 cursor-grab p-0.5 bg-black/30 rounded">
        <GripVertical className="w-3.5 h-3.5 text-white" />
      </div>
      <img src={img.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        <button onClick={onSetMain} className="p-1.5 bg-white/90 rounded-lg shadow transition-transform hover:scale-110" title="صورة رئيسية">
          <Star className={`w-3.5 h-3.5 ${img.is_main ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
        </button>
        <button onClick={onDelete} className="p-1.5 bg-white/90 rounded-lg shadow transition-transform hover:scale-110" title="حذف">
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
      {img.is_main && (
        <span className="absolute bottom-0 inset-x-0 bg-yellow-500 text-white text-[9px] text-center py-0.5 font-medium">رئيسية</span>
      )}
    </div>
  );
}

// --- Preview Card ---
function PreviewCard({ name, price, compareAt, image, isActive }: {
  name: string; price: string; compareAt: string; image: string | null; isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
    >
      <div className="p-3 border-b border-border/30 flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">معاينة المنتج</span>
      </div>
      <div className="p-4">
        <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-3">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground truncate mb-1">
          {name || "اسم المنتج"}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {price ? `${parseFloat(price).toLocaleString("en-US")} ر.س` : "0 ر.س"}
          </span>
          {compareAt && parseFloat(compareAt) > (parseFloat(price) || 0) && (
            <span className="text-xs text-muted-foreground line-through">
              {parseFloat(compareAt).toLocaleString("en-US")} ر.س
            </span>
          )}
        </div>
        <div className="mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"
          }`}>
            {isActive ? "نشط" : "مسودة"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Drag & Drop Upload Area ---
function ImageUploadArea({ onUpload, uploading, disabled }: {
  onUpload: (files: FileList) => void; uploading: boolean; disabled: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
        dragOver ? "border-accent bg-accent/5 scale-[1.01]" : "border-border/60 hover:border-accent/50"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) onUpload(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
      {uploading ? (
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
      ) : (
        <ImagePlus className="w-8 h-8 text-muted-foreground/40 mx-auto" />
      )}
      <p className="text-sm text-muted-foreground mt-3">
        {uploading ? "جاري رفع الصور..." : "اسحب الصور هنا أو اضغط للاختيار"}
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, WEBP</p>
    </motion.div>
  );
}

// === MAIN ===
export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAdmin();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Form state
  const [nameAr, setNameAr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [inventory, setInventory] = useState("0");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currencyEnabled, setCurrencyEnabled] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("SAR");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!product) { navigate("/admin/products"); return; }

      setNameAr(product.name_ar);
      setDescAr(product.description_ar || "");
      setPrice(String(product.price));
      setCompareAt(product.compare_at_price ? String(product.compare_at_price) : "");
      setInventory(String(product.inventory));
      setCategory(product.category || "");
      setSku(product.sku || "");
      setIsActive(product.status === "active");
      setTags(product.tags || []);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("sort_order");
      setImages((imgs as ProductImage[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nameAr.trim()) e.nameAr = "اسم المنتج مطلوب";
    if (!price || parseFloat(price) <= 0) e.price = "السعر مطلوب";
    if (!inventory && inventory !== "0") e.inventory = "المخزون مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name_ar: nameAr.trim(),
      name_en: null,
      description_ar: descAr.trim() || null,
      description_en: null,
      price: parseFloat(price) || 0,
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      cost: null,
      inventory: parseInt(inventory) || 0,
      sku: sku.trim() || null,
      category: category.trim() || null,
      tags: tags,
      status: publish ? "active" : isActive ? "active" : "draft",
    };

    try {
      let productId = id;

      if (isNew) {
        const { data, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      } else {
        const { data: current } = await supabase.from("products").select("*").eq("id", id).single();
        if (current && userId) {
          await supabase.from("product_revisions").insert({
            product_id: id!,
            admin_id: userId,
            snapshot: current,
          });
          const { data: revisions } = await supabase
            .from("product_revisions")
            .select("id")
            .eq("product_id", id!)
            .order("created_at", { ascending: false });
          if (revisions && revisions.length > 10) {
            const toDelete = revisions.slice(10).map((r) => r.id);
            await supabase.from("product_revisions").delete().in("id", toDelete);
          }
        }

        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
      }

      if (userId) {
        await supabase.from("audit_logs").insert({
          admin_id: userId,
          action_type: isNew ? "create" : "update",
          entity_type: "product",
          entity_id: productId,
          after_snapshot: payload,
        });
      }

      toast({ title: isNew ? "✅ تم إنشاء المنتج بنجاح" : "✅ تم حفظ التغييرات" });
      if (isNew) navigate(`/admin/products/${productId}`);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!id || isNew) {
      toast({ title: "تنبيه", description: "احفظ المنتج أولاً ثم أضف الصور", variant: "destructive" });
      return;
    }
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) {
        toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const isMain = images.length === 0;

      const { data: img } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          url: publicUrl,
          storage_path: path,
          sort_order: images.length,
          is_main: isMain,
        })
        .select()
        .single();

      if (img) setImages((prev) => [...prev, img as ProductImage]);
    }

    setUploading(false);
  }, [id, isNew, images.length]);

  const handleSetMain = async (imgId: string) => {
    const updated = images.map((i) => ({ ...i, is_main: i.id === imgId }));
    setImages(updated);
    await supabase.from("product_images").update({ is_main: false }).eq("product_id", id!);
    await supabase.from("product_images").update({ is_main: true }).eq("id", imgId);
  };

  const handleDeleteImage = async (img: ProductImage) => {
    setImages((prev) => prev.filter((i) => i.id !== img.id));
    await supabase.from("product_images").delete().eq("id", img.id);
    if (img.storage_path) {
      await supabase.storage.from("product-images").remove([img.storage_path]);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIdx, newIdx);
    setImages(reordered);
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from("product_images").update({ sort_order: i }).eq("id", reordered[i].id);
    }
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "تم حذف المنتج" });
    navigate("/admin/products");
  };

  const mainImage = images.find(i => i.is_main)?.url || images[0]?.url || null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")} className="rounded-xl">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isNew ? "منتج جديد" : "تعديل المنتج"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isNew ? "أضف منتج جديد لمتجرك" : "عدّل تفاصيل المنتج"}
          </p>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">معلومات المنتج</h3>

            <div>
              <Label className="text-xs">اسم المنتج *</Label>
              <Input
                value={nameAr}
                onChange={(e) => { setNameAr(e.target.value); setErrors(p => ({ ...p, nameAr: "" })); }}
                className={`mt-1 rounded-xl admin-input ${errors.nameAr ? "border-destructive" : ""}`}
                placeholder="مثال: كريم مرطب طبيعي"
              />
              {errors.nameAr && <p className="text-destructive text-xs mt-1">{errors.nameAr}</p>}
            </div>

            <div>
              <Label className="text-xs">الوصف</Label>
              <textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="w-full mt-1 border border-border rounded-xl p-3 text-sm min-h-[120px] bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="أضف وصفاً جذاباً للمنتج..."
              />
            </div>
          </motion.div>

          {/* Images Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">الصور</h3>

            {!isNew ? (
              <>
                {images.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                      <div className="flex flex-wrap gap-3">
                        {images.map((img) => (
                          <SortableImage
                            key={img.id}
                            img={img}
                            onSetMain={() => handleSetMain(img.id)}
                            onDelete={() => handleDeleteImage(img)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
                <ImageUploadArea onUpload={handleImageUpload} uploading={uploading} disabled={false} />
              </>
            ) : (
              <div className="rounded-xl bg-muted/50 p-6 text-center">
                <ImagePlus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">احفظ المنتج أولاً لتتمكن من إضافة الصور</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT - Sidebar */}
        <div className="space-y-5">
          {/* Pricing & Stock Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">التسعير والمخزون</h3>

            <div>
              <Label className="text-xs">السعر (ر.س) *</Label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setErrors(p => ({ ...p, price: "" })); }}
                dir="ltr"
                className={`mt-1 rounded-xl admin-input ${errors.price ? "border-destructive" : ""}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label className="text-xs">سعر المقارنة (ر.س)</Label>
              <Input
                type="number"
                step="0.01"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                dir="ltr"
                className="mt-1 rounded-xl admin-input"
                placeholder="0.00"
              />
              {compareAt && price && parseFloat(compareAt) > parseFloat(price) && (
                <p className="text-xs text-emerald-600 mt-1">
                  خصم {Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100)}%
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs">المخزون *</Label>
              <Input
                type="number"
                value={inventory}
                onChange={(e) => { setInventory(e.target.value); setErrors(p => ({ ...p, inventory: "" })); }}
                dir="ltr"
                className={`mt-1 rounded-xl admin-input ${errors.inventory ? "border-destructive" : ""}`}
                placeholder="0"
              />
              {errors.inventory && <p className="text-destructive text-xs mt-1">{errors.inventory}</p>}
            </div>

            <div>
              <Label className="text-xs">SKU (رمز المنتج)</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                dir="ltr"
                className="mt-1 rounded-xl admin-input"
                placeholder="مثال: PRF-001"
              />
            </div>
          </motion.div>

          {/* Status & Category Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">الحالة والتصنيف</h3>

            <div className="flex items-center justify-between">
              <Label className="text-xs">حالة المنتج</Label>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className={`text-xs font-medium ${isActive ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {isActive ? "نشط" : "مسودة"}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-xs">التصنيف</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 rounded-xl admin-input"
                placeholder="مثال: العناية بالبشرة"
              />
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> الوسوم
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                      e.preventDefault();
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                      }
                      setTagInput("");
                    }
                  }}
                  className="rounded-xl admin-input flex-1"
                  placeholder="اكتب وسم واضغط Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                    }
                    setTagInput("");
                  }}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Preview Card */}
          <PreviewCard
            name={nameAr}
            price={price}
            compareAt={compareAt}
            image={mainImage}
            isActive={isActive}
          />

          {/* Delete Button */}
          {!isNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                variant="outline"
                className="w-full rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4" /> حذف المنتج
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/products")}
            className="rounded-xl"
          >
            إلغاء
          </Button>
          <div className="flex items-center gap-3">
            {!isNew && (
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-xl"
              >
                حفظ كمسودة
              </Button>
            )}
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="admin-gradient-btn text-sm flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "جاري الحفظ..." : isNew ? "إنشاء المنتج" : "حفظ ونشر"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا المنتج نهائياً ولا يمكن استرجاعه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
