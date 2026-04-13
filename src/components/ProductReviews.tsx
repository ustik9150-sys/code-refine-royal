import { useState, useEffect, useMemo } from "react";
import { Star, ThumbsUp, CheckCircle2, ShieldCheck, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_gender: string;
  rating: number;
  comment: string;
  dialect: string;
  badge_type: string;
  is_highlighted: boolean;
  highlight_label: string | null;
  review_date: string;
}

const AVATARS_MALE = [
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Ali&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Mohammed&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Khalid&backgroundColor=d1d4f9",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Omar&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Ahmed&backgroundColor=ffdfbf",
];
const AVATARS_FEMALE = [
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Sara&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Nora&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Fatima&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Maryam&backgroundColor=d1d4f9",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=Lina&backgroundColor=ffdfbf",
];

function getAvatar(name: string, gender: string) {
  const arr = gender === "female" ? AVATARS_FEMALE : AVATARS_MALE;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return arr[Math.abs(hash) % arr.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const dist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: total ? Math.round((reviews.filter((rv) => rv.rating === r).length / total) * 100) : 0,
  }));
  const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-black text-foreground">{avg}</div>
          <StarRating rating={Math.round(Number(avg))} size="lg" />
          <div className="text-xs text-muted-foreground mt-1">{total} تقييم</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{d.stars}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-left">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(false);

  return (
    <div className={`bg-card border rounded-xl p-4 md:p-5 transition-all ${
      review.is_highlighted ? "border-amber-300 shadow-sm ring-1 ring-amber-200/50" : "border-border"
    }`}>
      {review.is_highlighted && review.highlight_label && (
        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 border border-amber-200">
          <ThumbsUp className="w-3 h-3" />
          {review.highlight_label}
        </div>
      )}
      <div className="flex items-start gap-3">
        <img
          src={getAvatar(review.reviewer_name, review.reviewer_gender)}
          alt={review.reviewer_name}
          className="w-10 h-10 rounded-full bg-muted flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground">{review.reviewer_name}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              {review.badge_type === "trusted_customer" ? (
                <><ShieldCheck className="w-3 h-3" /> عميل موثوق</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" /> تم الشراء</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-[10px] text-muted-foreground">{timeAgo(review.review_date)}</span>
          </div>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.comment}</p>
          <button
            onClick={() => setHelpful(!helpful)}
            className={`mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
              helpful
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            مفيد {helpful ? "✓" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductReviews({ productId }: { productId?: string }) {
  const [visibleCount, setVisibleCount] = useState(6);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("review_date", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId,
  });

  const shuffled = useMemo(() => {
    if (!reviews.length) return [];
    const highlighted = reviews.filter((r) => r.is_highlighted);
    const rest = reviews.filter((r) => !r.is_highlighted);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return [...highlighted, ...rest];
  }, [reviews]);

  if (!productId) return null;
  if (isLoading) {
    return (
      <section className="py-10">
        <div className="container space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        </div>
      </section>
    );
  }
  if (!reviews.length) return null;

  const visible = shuffled.slice(0, visibleCount);
  const hasMore = visibleCount < shuffled.length;

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <h2 className="text-xl md:text-3xl font-black text-foreground mb-6">
          تقييمات العملاء
        </h2>

        <RatingDistribution reviews={reviews} />

        <div className="mt-6 space-y-3">
          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            className="mt-6 mx-auto flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            عرض المزيد ({shuffled.length - visibleCount} تقييم)
          </button>
        )}
      </div>
    </section>
  );
}
