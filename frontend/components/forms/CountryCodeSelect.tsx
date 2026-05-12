const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+81"];

interface CountryCodeSelectProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
    return (
        <select
            className="h-11 w-24 rounded-md border border-white/10 bg-surface px-3 text-sm text-textPrimary focus:outline-none"
            value={value ?? "+91"}
            onChange={(event) => onChange?.(event.target.value)}
        >
            {COUNTRY_CODES.map((code) => (
                <option key={code} value={code} className="text-black">
                    {code}
                </option>
            ))}
        </select>
    );
}
