/**
 * TripDetailPopup.tsx — Bottom-sheet modal asking one trip detail question at a time.
 * Renders different input types depending on the field: text for city/passengers/dates,
 * BudgetStarSelector for the budget field.
 * Ulavi Technologies
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { LangStrings } from '@/lib/i18n';
import { type TripDetailField } from '@/lib/tripExtractor';
import { BudgetStarSelector, budgetRatingToString } from './BudgetStarSelector';

/** Maps TripDetailField to its i18n question key. */
const FIELD_QUESTION_KEY: Record<TripDetailField, keyof LangStrings> = {
  city:       'popupCityQuestion',
  dates:      'popupDatesQuestion',
  passengers: 'popupPassengersQuestion',
  budget:     'popupBudgetQuestion',
};

/** Props for TripDetailPopup */
interface TripDetailPopupProps {
  /** Which trip detail this pop-up is collecting. Drives question text and input type. */
  field: TripDetailField;
  /** 1-based index of this pop-up in the overall queue (shown as "2 of 4"). */
  currentStep: number;
  /** Total number of pop-ups in the queue (shown as "2 of 4"). */
  totalSteps: number;
  /**
   * Called when the user submits a value.
   * For city/passengers: the text input value.
   * For dates: "fromDate | toDate" (pipe-separated).
   * For budget: the result of budgetRatingToString().
   */
  onSubmit: (value: string) => void;
  /**
   * Called when the user taps Skip.
   * The parent stores an empty string for this field and moves to the next pop-up.
   */
  onSkip: () => void;
}

/**
 * Traps keyboard focus within the modal while it is open.
 * Implements Tab/Shift+Tab cycling and Escape key to skip.
 *
 * @param containerRef - Ref to the modal container element
 * @param onEscape     - Called when the user presses Escape
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, onEscape]);
}

/**
 * TripDetailPopup Component
 */
export function TripDetailPopup({
  field,
  currentStep,
  totalSteps,
  onSubmit,
  onSkip,
}: TripDetailPopupProps) {
  const { t, uiLanguage } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Ephemeral inputs for text fields
  const [inputValue, setInputValue] = useState('');
  
  // Ephemeral inputs for date ranges
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Ephemeral budget selection
  const [starRating, setStarRating] = useState(0);

  // Ephemeral passenger counters
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  // Focus trap integration
  useFocusTrap(containerRef, onSkip);

  // Reset inputs when field type changes
  useEffect(() => {
    setTimeout(() => {
      setInputValue('');
      setDateFrom('');
      setDateTo('');
      setStarRating(0);
      setAdults(1);
      setChildrenCount(0);
    }, 0);
  }, [field]);

  /** Builds the value to store and triggers parent submit. */
  const handleNextSubmit = () => {
    let value = '';
    switch (field) {
      case 'city':
        value = inputValue.trim();
        break;
      case 'passengers':
        const adultText = adults === 1 
          ? (uiLanguage === 'hi' ? '1 वयस्क' : uiLanguage === 'ta' ? '1 பெரியவர்' : '1 adult') 
          : `${adults} ${uiLanguage === 'hi' ? 'वयस्क' : uiLanguage === 'ta' ? 'பெரியவர்கள்' : 'adults'}`;
        const childText = childrenCount === 0 
          ? '' 
          : childrenCount === 1 
            ? (uiLanguage === 'hi' ? '1 बच्चा' : uiLanguage === 'ta' ? '1 குழந்தை' : '1 child')
            : `${childrenCount} ${uiLanguage === 'hi' ? 'बच्चे' : uiLanguage === 'ta' ? 'குழந்தைகள்' : 'children'}`;
        value = childText ? `${adultText}, ${childText}` : adultText;
        break;
      case 'dates':
        const cleanFrom = dateFrom.trim();
        const cleanTo = dateTo.trim();
        if (cleanFrom && cleanTo) {
          value = `${cleanFrom} — ${cleanTo}`;
        } else {
          value = cleanFrom || cleanTo || '';
        }
        break;
      case 'budget':
        value = budgetRatingToString(starRating, t);
        break;
    }
    onSubmit(value);
  };

  const isNextDisabled = field === 'budget' && starRating === 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-all"
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-question-text"
        className="w-full max-w-2xl bg-white rounded-t-[2rem] border-t border-brand-border px-6 pb-10 pt-8 shadow-2xl flex flex-col gap-6 vb-sheet-enter relative z-50 focus:outline-none"
        tabIndex={-1}
      >
        {/* Top bar drag handle indicator & step counter */}
        <div className="flex items-center justify-between w-full">
          <div className="w-12 h-1.5 rounded-full bg-[#E5E2DA] mx-auto absolute left-1/2 -translate-x-1/2 top-3" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-caps text-brand-muted uppercase">
            {t('popupTitle')}
          </span>
          <span className="text-[11px] font-mono font-medium text-brand-muted">
            {currentStep} / {totalSteps}
          </span>
        </div>

        {/* Question heading */}
        <h2 
          id="popup-question-text" 
          className="text-xl font-bold tracking-tight text-brand-text leading-tight mt-1"
        >
          {t(FIELD_QUESTION_KEY[field])}
        </h2>

        {/* Input Area */}
        <div className="w-full py-1">
          {field === 'city' && (
            <input
              type="text"
              placeholder={t('popupCityPlaceholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-11 w-full rounded-xl border border-brand-border bg-white px-4 text-sm font-light text-brand-text placeholder:text-gray-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm"
              autoFocus
            />
          )}

          {field === 'dates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-caps text-brand-muted uppercase">
                  {t('popupDatesFromPlaceholder')}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 w-full rounded-xl border border-brand-border bg-white px-4 text-sm font-light text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm cursor-pointer"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-caps text-brand-muted uppercase">
                  {t('popupDatesToPlaceholder')}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 w-full rounded-xl border border-brand-border bg-white px-4 text-sm font-light text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
          )}

          {field === 'passengers' && (
            <div className="flex flex-col gap-4 w-full bg-[#F9F8F5] p-5 rounded-2xl border border-brand-border">
              {/* Adults Row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-brand-text">
                    {t('popupAdultsLabel')}
                  </span>
                  <span className="text-[11px] text-brand-muted font-light mt-0.5">
                    {t('popupAdultsSub')}
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white border border-brand-border rounded-xl px-2 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-text hover:bg-brand-accent/5 hover:border-brand-accent/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                    aria-label="Decrease adults"
                  >
                    <Minus className="w-4 h-4 text-brand-text" />
                  </button>
                  <span className="text-base font-semibold min-w-[20px] text-center font-mono select-none">
                    {adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    disabled={adults >= 10}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-text hover:bg-brand-accent/5 hover:border-brand-accent/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                    aria-label="Increase adults"
                  >
                    <Plus className="w-4 h-4 text-brand-text" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-brand-border/60" />

              {/* Children Row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-brand-text">
                    {t('popupChildrenLabel')}
                  </span>
                  <span className="text-[11px] text-brand-muted font-light mt-0.5">
                    {t('popupChildrenSub')}
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white border border-brand-border rounded-xl px-2 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    disabled={childrenCount <= 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-text hover:bg-brand-accent/5 hover:border-brand-accent/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                    aria-label="Decrease children"
                  >
                    <Minus className="w-4 h-4 text-brand-text" />
                  </button>
                  <span className="text-base font-semibold min-w-[20px] text-center font-mono select-none">
                    {childrenCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.min(10, childrenCount + 1))}
                    disabled={childrenCount >= 10}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-text hover:bg-brand-accent/5 hover:border-brand-accent/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                    aria-label="Increase children"
                  >
                    <Plus className="w-4 h-4 text-brand-text" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {field === 'budget' && (
            <BudgetStarSelector
              value={starRating}
              onChange={setStarRating}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 mt-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 h-11 text-sm font-medium text-brand-muted hover:text-brand-accent transition-colors cursor-pointer select-none rounded-xl"
          >
            {t('popupSkip')}
          </button>
          
          <button
            type="button"
            disabled={isNextDisabled}
            onClick={handleNextSubmit}
            className="px-8 h-11 text-sm font-medium rounded-full bg-[#E85D22] text-white hover:bg-[#D44E1A] hover:shadow-[0_4px_12px_rgba(232,93,34,0.25)] active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {t('popupNext')}
          </button>
        </div>
      </div>
    </div>
  );
}
