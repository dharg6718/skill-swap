import { Star } from 'lucide-react';

const StarRating = ({ rating, onChange, interactive = false, max = 5 }) => {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => {
        const starVal = i + 1;
        return (
          <Star
            key={i}
            size={interactive ? 24 : 16}
            className={`${
              starVal <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(starVal)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
