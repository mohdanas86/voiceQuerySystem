import { ThemedDropdown } from "@/components/ui/themed-dropdown";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
    { value: "auto", label: "Auto-detect" },
    { value: "en",   label: "English" },
    { value: "hi",   label: "Hindi" },
    { value: "ur",   label: "Urdu" },
    { value: "ta",   label: "Tamil" },
    { value: "te",   label: "Telugu" },
    { value: "mr",   label: "Marathi" },
    { value: "kn",   label: "Kannada" },
    { value: "gu",   label: "Gujarati" },
    { value: "bn",   label: "Bengali" },
];

interface LanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    className?: string;
    disabled?: boolean;
}

export function LanguageSelect({
    value,
    onChange,
    id = "spoken-language",
    className,
    disabled,
}: LanguageSelectProps) {
    return (
        <ThemedDropdown
            id={id}
            aria-label="Spoken language"
            value={value}
            onValueChange={onChange}
            options={LANGUAGE_OPTIONS}
            disabled={disabled}
            className={cn("touch-manipulation", className)}
        />
    );
}
