
import { Star } from "lucide-react";

export default function RatingStars({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 });
  return (
    <div className="flex gap-0.5">
      {stars.map((_, i) => {
        const full = i + 1 <= Math.round(rating);
        return <Star key={i} size={20} className={full ? "text-amber-400 fill-amber-400" : "text-gray-300"} />;
      })}
    </div>
  );
}
