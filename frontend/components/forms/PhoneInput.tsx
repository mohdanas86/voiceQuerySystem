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
        <div className="flex min-w-0 flex-col gap-1.5">
            <label
                htmlFor="phone-national"
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]"
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
                    className="h-11 w-full min-w-0 rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors"
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
            {error && (
                <p id={errorId} className="text-[12px] font-light text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
