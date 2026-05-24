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
    const errorId = "phone-input-error";

    return (
        <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
            <label
                htmlFor="phone-national"
                className="font-mono text-xs font-bold uppercase tracking-widest text-brand-muted"
            >
                Your Mobile Number
            </label>
            <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
                <CountryCodeSelect
                    id="phone-country-code"
                    value={countryCode}
                    onChange={onCountryCodeChange}
                />
                <input
                    id="phone-national"
                    className="h-12 min-h-12 w-full min-w-0 border border-brand-border bg-brand-bg px-3 font-mono text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:h-11 sm:min-h-11 transition-colors"
                    placeholder="98765 43210"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    value={number}
                    onChange={(event) => onNumberChange(event.target.value)}
                />
            </div>
            {error ? (
                <p id={errorId} className="font-mono text-xs text-brand-error">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
