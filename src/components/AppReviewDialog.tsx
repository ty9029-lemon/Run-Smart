import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { APP_REVIEW_MESSAGES } from '../constants/messages';
import {
  APP_REVIEW_LOW_RATING_MAX,
  APP_REVIEW_MAX_MESSAGE_LENGTH,
  APP_REVIEW_MAX_RATING,
} from '../constants/thresholds';

/** 1부터 최대 별점까지의 점수 목록 */
const RATINGS = Array.from({ length: APP_REVIEW_MAX_RATING }, (_, index) => index + 1);

interface StarRatingProps {
  value: number;
  disabled: boolean;
  onChange: (rating: number) => void;
}

/** 별 1~5개 중 하나를 고르는 별점 입력 */
function StarRating({ value, disabled, onChange }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label={APP_REVIEW_MESSAGES.ratingLabel} className="flex justify-center gap-1">
      {RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating}점`}
          disabled={disabled}
          onClick={() => onChange(rating)}
          className="p-1"
        >
          <Star
            className={`size-8 ${rating <= value ? 'fill-highlight text-highlight' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );
}

interface AppReviewDialogProps {
  open: boolean;
  /** 응답을 보낸다. 저장에 성공하면 true */
  onSubmit: (rating: number, message: string) => Promise<boolean>;
  /** 응답 없이 닫는다. */
  onDismiss: () => void;
}

/** 재방문한 사용자에게 별점과 선택 메시지로 앱 만족도를 묻는 팝업 */
export default function AppReviewDialog({ open, onSubmit, onDismiss }: AppReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const isLowRating = rating > 0 && rating <= APP_REVIEW_LOW_RATING_MAX;

  /** 응답을 보내고, 실패하면 팝업을 유지한 채 안내 문구를 보여준다. */
  const handleSubmit = async () => {
    setSubmitting(true);
    setFailed(false);
    const saved = await onSubmit(rating, message);
    setSubmitting(false);
    setFailed(!saved);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{APP_REVIEW_MESSAGES.title}</DialogTitle>
          <DialogDescription>{APP_REVIEW_MESSAGES.description}</DialogDescription>
        </DialogHeader>
        <StarRating value={rating} disabled={submitting} onChange={setRating} />
        {rating > 0 && (
          <Textarea
            aria-label={APP_REVIEW_MESSAGES.messageLabel}
            value={message}
            maxLength={APP_REVIEW_MAX_MESSAGE_LENGTH}
            disabled={submitting}
            placeholder={
              isLowRating
                ? APP_REVIEW_MESSAGES.messagePlaceholderLow
                : APP_REVIEW_MESSAGES.messagePlaceholder
            }
            onChange={(event) => setMessage(event.target.value)}
          />
        )}
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {APP_REVIEW_MESSAGES.failed}
          </p>
        )}
        <Button type="button" disabled={rating === 0 || submitting} onClick={handleSubmit}>
          {submitting ? APP_REVIEW_MESSAGES.submitting : APP_REVIEW_MESSAGES.submit}
        </Button>
        <button
          type="button"
          disabled={submitting}
          onClick={onDismiss}
          className="text-center text-sm text-muted-foreground"
        >
          {APP_REVIEW_MESSAGES.later}
        </button>
      </DialogContent>
    </Dialog>
  );
}
