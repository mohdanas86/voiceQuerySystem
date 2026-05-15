export function getClientTimestamp() {
    const now = new Date();
    return {
        timestamp: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
}
