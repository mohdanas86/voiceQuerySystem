import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { SuccessPanel } from "@/components/feedback/SuccessPanel";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
    return (
        <AppShell>
            <div className="flex min-w-0 flex-col items-center gap-8 text-center md:gap-10">
                <SuccessCheckmark />
                <SuccessPanel
                    align="center"
                    message="Your request has been delivered to our support team."
                />
                <Link href="/record" className="w-full max-w-md touch-manipulation">
                    <Button size="lg" className="w-full">
                        Submit another query
                    </Button>
                </Link>
            </div>
        </AppShell>
    );
}
