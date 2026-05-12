interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="mb-10 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
                Voice Query
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-textPrimary md:text-4xl">
                {title}
            </h1>
            {subtitle ? (
                <p className="max-w-xl text-sm text-textMuted md:text-base">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
