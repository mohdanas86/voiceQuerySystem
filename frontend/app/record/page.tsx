import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MicButton } from "@/components/speech/MicButton";
import { RecordingTimer } from "@/components/speech/RecordingTimer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function RecordPage() {
    return (
        <AppShell>
            <div className="flex flex-col gap-10">
                <PageHeader
                    title="Record your query"
                    subtitle="Tap the mic and speak naturally in any language. We will convert and translate for you."
                />
                <div className="reveal flex flex-col gap-6">
                    <MicButton status="idle" />
                    <RecordingTimer />
                </div>
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-white/60">
                        Max duration: 60 seconds. You can review and edit the transcript
                        before sending.
                    </p>
                    <Link href="/review" className="w-full">
                        <PrimaryButton label="Continue to review" />
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
