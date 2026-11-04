export default function Logo({ size = 34 }) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <path
                d="M20 22 L50 78 L80 22 M50 22 L50 78"
                stroke="#38BDF8"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="80" cy="22" r="7" fill="#F59E0B" />
        </svg>
    );
}
