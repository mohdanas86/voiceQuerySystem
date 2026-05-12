interface TranscriptEditorProps {
    placeholder?: string;
}

export function TranscriptEditor({ placeholder }: TranscriptEditorProps) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                Transcript (English)
            </label>
            <textarea
                className="min-h-[180px] w-full rounded-none border border-white/15 bg-black/60 p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder={placeholder ?? "Your translated message will appear here..."}
            />
        </div>
    );
}
