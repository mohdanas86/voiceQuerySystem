const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+81"];

export function CountryCodeSelect() {
    return (
        <select
            className="h-11 w-24 rounded-none border border-white/15 bg-black/70 px-3 text-sm text-white focus:outline-none"
            defaultValue="+91"
        >
            {COUNTRY_CODES.map((code) => (
                <option key={code} value={code} className="text-black">
                    {code}
                </option>
            ))}
        </select>
    );
}
