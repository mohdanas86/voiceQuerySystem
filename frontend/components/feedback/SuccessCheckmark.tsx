export function SuccessCheckmark() {
    return (
        <div
            className="success-check relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-20"
            role="img"
            aria-label="Submission successful"
        >
            <span className="success-check-ring pointer-events-none absolute inset-0 rounded-full border border-success/30" />
            <span className="success-check-circle flex h-full w-full items-center justify-center rounded-full border border-success/40 bg-success/10">
                <svg
                    className="h-9 w-9 sm:h-10 sm:w-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                >
                    <path
                        className="success-check-path"
                        d="M6.5 12.5L10 16l7.5-8"
                        stroke="rgb(var(--color-success))"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        pathLength="1"
                    />
                </svg>
            </span>
        </div>
    );
}
