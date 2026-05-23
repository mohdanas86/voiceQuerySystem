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
                className="text-xs font-light uppercase tracking-[0.2em] text-textMuted"
            >
                Your Mobile Number
            </label>
            <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center">
                <CountryCodeSelect
                    id="phone-country-code"
                    value={countryCode}
                    onChange={onCountryCodeChange}
                />
                <input
                    id="phone-national"
                    className="h-12 min-h-12 w-full min-w-0 rounded-none border border-border/20 bg-surface px-3 text-base text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/40 sm:h-11 sm:min-h-11 sm:text-sm"
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
                <p id={errorId} className="text-sm leading-snug text-error sm:text-xs">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
