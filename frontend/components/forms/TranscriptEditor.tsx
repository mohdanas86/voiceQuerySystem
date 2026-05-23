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
                className="text-xs font-light uppercase tracking-[0.2em] text-textMuted"
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
                className="min-h-[11rem] w-full min-w-0 resize-y break-words rounded-none border border-border/20 bg-surface p-3 text-base leading-relaxed text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/40 sm:min-h-[12.5rem] sm:p-4 sm:text-sm"
                placeholder={placeholder ?? "Your translated message will appear here..."}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </div>
    );
}
