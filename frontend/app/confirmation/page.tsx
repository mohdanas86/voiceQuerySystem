import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuccessPanel } from "@/components/feedback/SuccessPanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ConfirmationPage() {
    return (
        <AppShell>
            <div className="flex flex-col gap-10">
                <PageHeader
                    title="Submission received"
                    subtitle="Thank you for your query. Our team will get back to you shortly."
                />
                <SuccessPanel message="Your request has been delivered to our support team." />
                <Link href="/record" className="w-full">
                    <PrimaryButton label="Submit another query" />
                </Link>
            </div>
        </AppShell>
    );
}
