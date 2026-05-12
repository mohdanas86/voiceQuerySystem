import { CountryCodeSelect } from "@/components/forms/CountryCodeSelect";

interface PhoneInputProps {
    countryCode: string;
    number: string;
    onCountryCodeChange: (value: string) => void;
    onNumberChange: (value: string) => void;
    error?: string;
}

export function PhoneInput({
    countryCode,
    number,
    onCountryCodeChange,
    onNumberChange,
    error,
}: PhoneInputProps) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-textMuted">
                Your Mobile Number
            </label>
            <div className="flex gap-3">
                <CountryCodeSelect value={countryCode} onChange={onCountryCodeChange} />
                <input
                    className="h-11 flex-1 rounded-md border border-white/10 bg-surface px-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="98765 43210"
                    type="tel"
                    value={number}
                    onChange={(event) => onNumberChange(event.target.value)}
                />
            </div>
            {error ? <p className="text-xs text-error">{error}</p> : null}
        </div>
    );
}
