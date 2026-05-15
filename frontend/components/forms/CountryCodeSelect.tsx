import { ThemedDropdown } from "@/components/ui/themed-dropdown";
import { cn } from "@/lib/utils";

const COUNTRY_CODE_OPTIONS = [
    { value: "+91", label: "+91" },
    { value: "+1", label: "+1" },
    { value: "+44", label: "+44" },
    { value: "+61", label: "+61" },
    { value: "+81", label: "+81" },
];

interface CountryCodeSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    id?: string;
    disabled?: boolean;
}

export function CountryCodeSelect({
    value,
    onChange,
    className,
    id,
    disabled,
}: CountryCodeSelectProps) {
    return (
        <ThemedDropdown
            id={id}
            size="compact"
            aria-label="Country calling code"
            value={value ?? "+91"}
            onValueChange={(next) => onChange?.(next)}
            options={COUNTRY_CODE_OPTIONS}
            disabled={disabled}
            className={cn("touch-manipulation", className)}
        />
    );
}
