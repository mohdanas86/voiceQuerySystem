import Link from "next/link";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { SuccessPanel } from "@/components/feedback/SuccessPanel";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
    return (
        <div className="flex min-h-[82vh] items-center justify-center px-4">
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-8 text-center">

                <SuccessCheckmark />

                <SuccessPanel
                    align="center"
                    message="Thank you for your query. Our team will get back to you shortly."
                />

                <Link
                    href="/record"
                    className="w-full touch-manipulation"
                >
                    <Button size="lg" className="w-full bg-white text-black hover:bg-gray-100 rounded-md">
                        Submit another query
                    </Button>
                </Link>
            </div>
        </div>
    );
}