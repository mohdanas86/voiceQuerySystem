interface TranscriptEditorProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function TranscriptEditor({ placeholder, value, onChange }: TranscriptEditorProps) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-textMuted">
                Transcript (English)
            </label>
            <textarea
                className="min-h-[180px] w-full rounded-md border border-white/10 bg-surface p-4 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={placeholder ?? "Your translated message will appear here..."}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </div>
    );
}
