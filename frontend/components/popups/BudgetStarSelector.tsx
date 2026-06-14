/**
 * BudgetStarSelector.tsx — Star-rating widget for selecting travel budget tier (1–5 stars).
 * Used in the budget pop-up and on the review screen.
 * Ulavi Technologies
 */

'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { LangStrings } from '@/lib/i18n';

/** Minimum touch target size in pixels (mobile accessibility standard). */
const MIN_TOUCH_TARGET_PX = 44;

/** Star icon size in pixels. */
const STAR_ICON_SIZE_PX = 32;

/** Orange color for filled stars (brand color). */
const STAR_FILLED_COLOR = '#E85D22';

/** Grey color for empty/unselected stars. */
const STAR_EMPTY_COLOR = '#D1D5DB';

/** 100ms fill transition — fast enough to feel instant, slow enough to be visible. */
const STAR_TRANSITION_DURATION_MS = 100;

/**
 * Defines the 5 budget tiers, each mapped to a pair of i18n keys.
 * Index 0 = 1 star (Economy), Index 4 = 5 stars (Luxury).
 */
const BUDGET_TIERS: readonly {
  labelKey: keyof LangStrings;
  rangeKey: keyof LangStrings;
}[] = [
  { labelKey: 'budgetTier1Label', rangeKey: 'budgetTier1Range' },
  { labelKey: 'budgetTier2Label', rangeKey: 'budgetTier2Range' },
  { labelKey: 'budgetTier3Label', rangeKey: 'budgetTier3Range' },
  { labelKey: 'budgetTier4Label', rangeKey: 'budgetTier4Range' },
  { labelKey: 'budgetTier5Label', rangeKey: 'budgetTier5Range' },
] as const;

/**
 * Converts a numeric star rating (1–5) to a human-readable budget string
 * for display in emails and on the review screen.
 *
 * @param rating - Star count selected by the user (1–5). 0 = not selected.
 * @param lang   - Language code for localised tier label text.
 * @returns A formatted string like "⭐⭐⭐ Mid-range (₹25,000 – ₹50,000/person)",
 *          or an empty string if rating is 0.
 */
export function budgetRatingToString(rating: number, tFn: (key: keyof LangStrings) => string): string {
  if (rating === 0 || rating > BUDGET_TIERS.length) return '';
  const tier = BUDGET_TIERS[rating - 1]; // Convert 1-based rating to 0-based index
  const tierLabel = tFn(tier.labelKey);
  const tierRange = tFn(tier.rangeKey);
  return `${'⭐'.repeat(rating)} ${tierLabel} (${tierRange})`;
}

/** Props for BudgetStarSelector component */
interface BudgetStarSelectorProps {
  /** Currently selected star count (1–5). 0 = nothing selected yet. */
  value: number;
  /**
   * Fired when the user taps a star.
   * Receives the new star count (1–5) as an integer.
   * Called with 0 if the user taps the already-selected star (deselect).
   */
  onChange: (rating: number) => void;
}

/**
 * BudgetStarSelector component.
 * Displays 5 stars for the user to select their budget tier, with descriptive text underneath.
 */
export function BudgetStarSelector({ value, onChange }: BudgetStarSelectorProps) {
  const { t } = useTranslation();
  // hoverRating tracks which star the user is hovering over (desktop).
  // 0 = no hover. Used to show a preview of the selection.
  const [hoverRating, setHoverRating] = useState<number>(0);

  /**
   * Handles a star click.
   * Tapping the already-selected star deselects (resets to 0).
   *
   * @param starIndex - 1-based star number that was clicked (1–5)
   */
  function handleStarClick(starIndex: number): void {
    const newRating = starIndex === value ? 0 : starIndex;
    onChange(newRating);
  }

  // The rating to display visually (hover preview takes priority over selection)
  const displayRating = hoverRating > 0 ? hoverRating : value;

  // Current tier info (based on displayRating)
  const activeTier = displayRating > 0 ? BUDGET_TIERS[displayRating - 1] : null;

  return (
    <div role="group" aria-label={t('popupBudgetQuestion')} className="w-full flex flex-col items-center">
      {/* Stars row */}
      <div className="flex gap-2 justify-center items-center">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((starIndex) => {
          const isFilled = starIndex <= displayRating;
          return (
            <button
              key={starIndex}
              type="button"
              aria-label={`${starIndex} ${isFilled ? 'filled' : 'empty'} star`}
              aria-pressed={value === starIndex}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                // Minimum 44×44px touch target (mobile accessibility)
                width: MIN_TOUCH_TARGET_PX,
                height: MIN_TOUCH_TARGET_PX,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                // Smooth color transition
                transition: `color ${STAR_TRANSITION_DURATION_MS}ms ease`,
                color: isFilled ? STAR_FILLED_COLOR : STAR_EMPTY_COLOR,
              }}
              className="active:scale-95 transition-transform"
            >
              <Star
                size={STAR_ICON_SIZE_PX}
                fill={isFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
          );
        })}
      </div>

      {/* Tier label and range */}
      <div className="text-center mt-4 h-14">
        {activeTier ? (
          <div className="reveal">
            <p className="font-bold text-brand-text text-sm uppercase tracking-wide">
              {t(activeTier.labelKey)}
            </p>
            <p className="text-brand-muted text-xs mt-1 font-light">
              {t(activeTier.rangeKey)}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-xs font-light mt-1">
            {t('budgetStarPlaceholder')}
          </p>
        )}
      </div>
    </div>
  );
}
