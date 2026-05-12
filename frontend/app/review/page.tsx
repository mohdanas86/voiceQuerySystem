import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TranscriptEditor } from "@/components/forms/TranscriptEditor";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ReviewPage() {
    return (
        <AppShell>
            <div className="flex flex-col gap-10">
                <PageHeader
                    title="Review and submit"
                    subtitle="Check the English transcript, add your mobile number, and send when ready."
                />
                <div className="flex flex-col gap-6">
                    <TranscriptEditor />
                    <PhoneInput error="Please enter a valid number to enable Send." />
                </div>
                <div className="flex flex-col gap-4">
                    <PrimaryButton label="Send" disabled />
                    <Link href="/record" className="text-xs uppercase tracking-[0.2em] text-white/60">
                        Back to recording
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
