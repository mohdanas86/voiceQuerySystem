/**
 * page.tsx — Screen 3: Smart trip detail pop-up orchestrator.
 * Runs extractTripDetails() on the transcript, builds a queue of missing fields,
 * and shows one TripDetailPopup at a time. Navigates to /review when queue is empty.
 * Ulavi Technologies
 */

'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useQueryStore } from '@/store/useQueryStore';
import { extractTripDetails, type TripDetailField, type TripDetails } from '@/lib/tripExtractor';
import { TripDetailPopup } from '@/components/popups/TripDetailPopup';
import { SuccessCheckmark } from '@/components/feedback/SuccessCheckmark';
import { Card } from '@/components/ui/card';
import { type SupportedLang } from '@/lib/i18n';
import { useTranslation } from '@/hooks/useTranslation';

type DetailsPageStatus = 'analysing' | 'popups' | 'all-detected' | 'done';

/** Delay before showing the first pop-up after analysis completes. */
const ANALYSIS_DISPLAY_DELAY_MS = 500;

/** How long to show the "all details detected" message before auto-navigating. */
const ALL_DETECTED_DISPLAY_MS = 1200;

/**
 * Builds an ordered list of trip detail fields that are absent from the transcript.
 * Only fields with null values get a pop-up.
 *
 * @param extracted - Result from extractTripDetails()
 * @returns Ordered array of field keys that need user input
 */
function buildMissingFieldQueue(extracted: TripDetails): TripDetailField[] {
  const ALL_FIELDS: TripDetailField[] = ['city', 'dates', 'passengers', 'budget'];

  return ALL_FIELDS.filter((field) => {
    switch (field) {
      case 'city':       return extracted.city === null;
      case 'dates':      return extracted.datesFrom === null;
      case 'passengers': return extracted.passengers === null;
      case 'budget':     return extracted.budget === null;
      default:           return false;
    }
  });
}

export default function DetailsPage() {
  const router = useRouter();
  
  const {
    originalTranscript,
    setTripCity,
    setTripDatesFrom,
    setTripDatesTo,
    setTripPassengers,
    setTripBudget,
  } = useQueryStore();

  const { t } = useTranslation();

  const [status, setStatus] = useState<DetailsPageStatus>('analysing');
  const [missingQueue, setMissingQueue] = useState<TripDetailField[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const hasMounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  // Mount logic: scan transcript, pre-fill values, build queue
  useEffect(() => {
    if (!originalTranscript.trim()) {
      router.replace('/record');
      return;
    }

    // Run client-side heuristics extractor
    const extracted = extractTripDetails(originalTranscript);

    // Pre-fill store with any detected values
    if (extracted.city)       setTripCity(extracted.city);
    if (extracted.datesFrom)  setTripDatesFrom(extracted.datesFrom);
    if (extracted.passengers) setTripPassengers(extracted.passengers);
    // Note: budget is intentionally left un-filled to let users choose star rating manually if not specified.

    const queue = buildMissingFieldQueue(extracted);

    // Transition from 'analysing' state after delay
    const timer = setTimeout(() => {
      if (queue.length === 0) {
        setStatus('all-detected');
        setTimeout(() => {
          router.push('/review');
        }, ALL_DETECTED_DISPLAY_MS);
      } else {
        setMissingQueue(queue);
        setStatus('popups');
      }
    }, ANALYSIS_DISPLAY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [originalTranscript, router, setTripBudget, setTripCity, setTripDatesFrom, setTripDatesTo, setTripPassengers]);

  /** Handles popup submission: stores the field value and advances the queue. */
  const handlePopupSubmit = (value: string) => {
    const currentField = missingQueue[currentIndex];
    storeFieldValue(currentField, value);
    advanceQueue();
  };

  /** Stores the submitted value in the Zustand store. */
  const storeFieldValue = (field: TripDetailField, value: string) => {
    switch (field) {
      case 'city':
        setTripCity(value);
        break;
      case 'dates':
        const [from = '', to = ''] = value.split(' — ');
        setTripDatesFrom(from.trim());
        setTripDatesTo(to.trim());
        break;
      case 'passengers':
        setTripPassengers(value);
        break;
      case 'budget':
        setTripBudget(value);
        break;
    }
  };

  /** Advances the index, or pushes to review page when queue is complete. */
  const advanceQueue = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= missingQueue.length) {
      setStatus('done');
      router.push('/review');
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  /** Handles Skip action: sets empty string and advances. */
  const handlePopupSkip = () => {
    const currentField = missingQueue[currentIndex];
    storeFieldValue(currentField, '');
    advanceQueue();
  };

  // Render nothing while redirecting or not mounted
  if (!hasMounted || !originalTranscript.trim()) return null;

  return (
    <div className="pt-12 min-h-screen bg-[#F4F1EB] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background blurred representation of the details/transcript card */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6 filter blur-[2px] pointer-events-none select-none">
        
        {/* Fake Header */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E85D22]" />
            <span className="text-[11px] font-semibold tracking-caps uppercase text-[#6B6A68]">
              {t('recordStep')}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
            {t('recordTitle')}
          </h1>
        </div>

        {/* Fake Card */}
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <div className="h-1.5 w-1/3 rounded bg-gray-200" />
            <div className="h-24 w-full rounded bg-gray-100" />
          </div>
        </Card>
      </div>

      {/* Screen status states */}
      {status === 'analysing' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-2xl flex flex-col items-center gap-4 text-center reveal">
            <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            <p className="text-sm font-semibold text-brand-text">
              {t('detailsAnalysing')}
            </p>
          </div>
        </div>
      )}

      {status === 'all-detected' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-2xl flex flex-col items-center gap-5 text-center reveal w-full max-w-md mx-4">
            <SuccessCheckmark />
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-bold text-brand-text">
                {t('detailsAllDetected')}
              </p>
              <p className="text-xs text-brand-muted font-light">
                {t('detailsRedirecting')}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'popups' && missingQueue.length > 0 && (
        <TripDetailPopup
          field={missingQueue[currentIndex]}
          currentStep={currentIndex + 1}
          totalSteps={missingQueue.length}
          onSubmit={handlePopupSubmit}
          onSkip={handlePopupSkip}
        />
      )}

    </div>
  );
}
