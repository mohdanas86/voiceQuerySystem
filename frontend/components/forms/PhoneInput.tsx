import { CountryCodeSelect } from "@/components/forms/CountryCodeSelect";

interface PhoneInputProps {
    error?: string;
}

export function PhoneInput({ error }: PhoneInputProps) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                Your Mobile Number
            </label>
            <div className="flex gap-3">
                <CountryCodeSelect />
                <input
                    className="h-11 flex-1 rounded-none border border-white/15 bg-black/70 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder="98765 43210"
                    type="tel"
                />
            </div>
            {error ? <p className="text-xs text-white/70">{error}</p> : null}
        </div>
    );
}
