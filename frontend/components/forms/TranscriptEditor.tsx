interface TranscriptEditorProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    id?: string;
}

export function TranscriptEditor({ label, placeholder, value, onChange, id = "transcript-english" }: TranscriptEditorProps) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]"
            >
                {label ?? "Transcript (English)"}
            </label>
            <textarea
                id={id}
                name={id}
                rows={5}
                autoComplete="off"
                spellCheck
                enterKeyHint="done"
                className="min-h-[11rem] w-full min-w-0 resize-y break-words rounded-xl border border-[#E8E5DF] bg-white px-4 py-3 text-sm font-light leading-relaxed text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 sm:min-h-[12.5rem] transition-colors"
                placeholder={placeholder ?? "Your translated message will appear here..."}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </div>
    );
}
