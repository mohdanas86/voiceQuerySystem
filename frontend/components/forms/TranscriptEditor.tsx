/**
 * TranscriptEditor.tsx — Text area component for displaying and editing transcripts.
 
 */

'use client';
// Client component: renders an interactive textarea with local input state.

import React from 'react';

/**
 * TranscriptEditorProps — props for the TranscriptEditor component.
 
 */
interface TranscriptEditorProps {
  /** The localized label text to display above the text area. Defaults to "Transcript (English)". */
  label?: string;
  /** Optional placeholder text shown when the textarea is empty. */
  placeholder?: string;
  /** Currently entered text value in the editor. */
  value?: string;
  /** Callback triggered when the text changes. Receives the updated string value. */
  onChange?: (value: string) => void;
  /** The unique HTML element ID used for form binding and accessibility. Defaults to "transcript-english". */
  id?: string;
}

/**
 * Renders a stylized textarea for query transcripts, supporting custom labels and placeholders.
 *
 * @param props - Component props containing label, value, onChange, placeholder, and ID
 * @returns React JSX element representing the transcript editor field
 */
export function TranscriptEditor({
  label,
  placeholder,
  value,
  onChange,
  id = 'transcript-english',
}: TranscriptEditorProps): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]"
      >
        {label ?? 'Transcript (English)'}
      </label>
      <textarea
        id={id}
        name={id}
        rows={5}
        autoComplete="off"
        spellCheck
        enterKeyHint="done"
        className="min-h-[11rem] w-full min-w-0 resize-y break-words rounded-xl border border-[#E8E5DF] bg-white px-4 py-3 text-sm font-light leading-relaxed text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 sm:min-h-[12.5rem] transition-colors"
        placeholder={placeholder ?? 'Your translated message will appear here...'}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void => onChange?.(event.target.value)}
      />
    </div>
  );
}
