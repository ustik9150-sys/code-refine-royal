import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Save, Upload, X, GripVertical, Star, Trash2 } from "lucide-react";
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

function SortableImage({
  img, onSetMain, onDelete,
}: {
  img: ProductImage;
  onSetMain: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
      <div {...attributes} {...listeners} className="absolute top-1 right-1 z-10 cursor-grab">
        <GripVertical className="w-4 h-4 text-white drop-shadow" />
      </div>
      <img src={img.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={onSetMain} className="p-1 bg-white rounded-full" title="صورة رئيسية">
          <Star className={`w-3.5 h-3.5 ${img.is_main ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
        </button>
        <button onClick={onDelete} className="p-1 bg-white rounded-full" title="حذف">
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
      {img.is_main && (
        <span className="absolute bottom-0 inset-x-0 bg-yellow-500 text-white text-[10px] text-center py-0.5">رئيسية</span>
      )}
    </div>
  );
}

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAdmin();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Form
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [cost, setCost] = useState("");
  const [inventory, setInventory] = useState("0");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

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
      setNameEn(product.name_en || "");
      setDescAr(product.description_ar || "");
      setDescEn(product.description_en || "");
      setPrice(String(product.price));
      setCompareAt(product.compare_at_price ? String(product.compare_at_price) : "");
      setCost(product.cost ? String(product.cost) : "");
      setInventory(String(product.inventory));
      setSku(product.sku || "");
      setCategory(product.category || "");
      setTags((product.tags || []).join(", "));
      setIsActive(product.status === "active");

      const { data: imgs } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("sort_order");
      setImages((imgs as ProductImage[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async (publish = false) => {
    if (!nameAr.trim()) {
      toast({ title: "خطأ", description: "اسم المنتج مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || null,
      description_ar: descAr.trim() || null,
      description_en: descEn.trim() || null,
      price: parseFloat(price) || 0,
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      cost: cost ? parseFloat(cost) : null,
      inventory: parseInt(inventory) || 0,
      sku: sku.trim() || null,
      category: category.trim() || null,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      status: publish ? "active" : isActive ? "active" : "draft",
    };

    try {
      let productId = id;

      if (isNew) {
        const { data, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      } else {
        // Save revision before updating
        const { data: current } = await supabase.from("products").select("*").eq("id", id).single();
        if (current && userId) {
          await supabase.from("product_revisions").insert({
            product_id: id!,
            admin_id: userId,
            snapshot: current,
          });
          // Keep only last 10
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

      // Audit log
      if (userId) {
        await supabase.from("audit_logs").insert({
          admin_id: userId,
          action_type: isNew ? "create" : "update",
          entity_type: "product",
          entity_id: productId,
          after_snapshot: payload,
        });
      }

      toast({ title: isNew ? "تم إنشاء المنتج" : "تم الحفظ" });
      if (isNew) navigate(`/admin/products/${productId}`);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id || isNew) return;
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
      const sortOrder = images.length;

      const { data: img } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          url: publicUrl,
          storage_path: path,
          sort_order: sortOrder,
          is_main: isMain,
        })
        .select()
        .single();

      if (img) setImages((prev) => [...prev, img as ProductImage]);
    }

    setUploading(false);
    e.target.value = "";
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
    // Update sort_order in DB
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

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-foreground">
          {isNew ? "منتج جديد" : "تعديل المنتج"}
        </h2>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>اسم المنتج (عربي) *</Label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>اسم المنتج (إنجليزي)</Label>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" className="mt-1" />
          </div>
        </div>

        <div>
          <Label>الوصف (عربي)</Label>
          <textarea
            value={descAr}
            onChange={(e) => setDescAr(e.target.value)}
            className="w-full mt-1 border border-input rounded-lg p-3 text-sm min-h-[120px] bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <Label>الوصف (إنجليزي)</Label>
          <textarea
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            dir="ltr"
            className="w-full mt-1 border border-input rounded-lg p-3 text-sm min-h-[80px] bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>السعر (ر.س) *</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label>سعر المقارنة</Label>
            <Input type="number" step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label>التكلفة</Label>
            <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} dir="ltr" className="mt-1" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>المخزون</Label>
            <Input type="number" value={inventory} onChange={(e) => setInventory(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label>التصنيف</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label>الوسوم (Tags)</Label>
          <div className="flex flex-wrap gap-2 mt-1 mb-2">
            {tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-secondary text-foreground text-sm px-3 py-1 rounded-full border border-border"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const arr = tags.split(",").map((t) => t.trim()).filter(Boolean);
                      arr.splice(i, 1);
                      setTags(arr.join(", "));
                    }}
                    className="hover:text-destructive transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="أضف وسم واضغط Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = tagInput.trim();
                  if (val) {
                    const arr = tags.split(",").map((t) => t.trim()).filter(Boolean);
                    if (!arr.includes(val)) {
                      setTags([...arr, val].join(", "));
                    }
                    setTagInput("");
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>{isActive ? "نشط" : "مسودة"}</Label>
        </div>
      </div>

      {/* Images */}
      {!isNew && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <Label className="text-base font-semibold">الصور</Label>

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
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-foreground/40 transition">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {uploading ? "جاري..." : "رفع"}
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={() => handleSave(false)} disabled={saving}>
          <Save className="w-4 h-4 ml-2" />
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
        <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
          نشر
        </Button>
        {!isNew && (
          <Button variant="destructive" size="sm" className="mr-auto" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4 ml-1" /> حذف
          </Button>
        )}
      </div>

      {/* Delete confirmation */}
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
