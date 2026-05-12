import { Mic } from "lucide-react";

interface MicButtonProps {
    status?: "idle" | "recording" | "done";
}

const statusCopy = {
    idle: "Tap to start recording",
    recording: "Recording...",
    done: "Recording complete",
};

export function MicButton({ status = "idle" }: MicButtonProps) {
    return (
        <div className="flex flex-col items-center gap-4">
            <button
                className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-glass transition duration-150 hover:bg-white/90"
                type="button"
                aria-label="Start recording"
            >
                <Mic className="h-7 w-7" />
            </button>
            <p className="text-sm text-white/70">{statusCopy[status]}</p>
        </div>
    );
}
