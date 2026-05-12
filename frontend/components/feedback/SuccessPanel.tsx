interface SuccessPanelProps {
    message: string;
}

export function SuccessPanel({ message }: SuccessPanelProps) {
    return (
        <div className="flex flex-col gap-4 rounded-none border border-white/15 bg-black/70 p-6 text-left shadow-glass">
            <div className="h-1 w-16 rounded-full bg-white" />
            <p className="text-base text-white/90">{message}</p>
        </div>
    );
}
