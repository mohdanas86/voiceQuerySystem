interface TranscriptEditorProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function TranscriptEditor({ placeholder, value, onChange }: TranscriptEditorProps) {
    return (
        <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
            <label
                htmlFor="transcript-english"
                className="font-mono text-xs font-bold uppercase tracking-widest text-brand-muted"
            >
                Transcript (English)
            </label>
            <textarea
                id="transcript-english"
                name="transcript"
                rows={5}
                autoComplete="off"
                spellCheck
                enterKeyHint="done"
                className="min-h-[11rem] w-full min-w-0 resize-y break-words border border-brand-border bg-brand-bg p-3 font-mono text-sm leading-relaxed text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:min-h-[12.5rem] sm:p-4 transition-colors"
                placeholder={placeholder ?? "Your translated message will appear here..."}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </div>
    );
}
