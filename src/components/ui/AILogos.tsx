// AI System Logos
// SVG logos for Claude, Gemini, and Cline

interface LogoProps {
  className?: string;
}

// Claude logo - simplified Anthropic style
export function ClaudeLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="currentColor"
      />
      <path
        d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="currentColor"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Gemini logo - Google AI style with twin stars
export function GeminiLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill="url(#gemini-gradient)"
      />
    </svg>
  );
}

// Cline logo - VS Code extension style
export function ClineLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2" />
      <path
        d="M7 8L11 12L7 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 16H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Unified logo component
export function AISystemLogo({
  system,
  className = "h-5 w-5"
}: {
  system: "claude-code" | "gemini-cli" | "cline";
  className?: string;
}) {
  switch (system) {
    case "claude-code":
      return <ClaudeLogo className={className} />;
    case "gemini-cli":
      return <GeminiLogo className={className} />;
    case "cline":
      return <ClineLogo className={className} />;
    default:
      return null;
  }
}
