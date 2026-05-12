interface SuccessPanelProps {
    message: string;
}

export function SuccessPanel({ message }: SuccessPanelProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6 text-left shadow-soft">
            <div className="h-1 w-16 rounded-full bg-success" />
            <p className="text-base text-textPrimary">{message}</p>
        </div>
    );
}
