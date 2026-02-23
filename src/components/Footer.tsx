import type { Translations } from "../i18n";

// ── IPMA Globe Emblem ──────────────────────────────────
// Extracted from IPMA's official logo SVG (logo-ipma-17.svg).
// Only the globe icon — the wordmark is rendered as text.
function IpmaLogo() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="30 25 230 135"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ipma-rg" cx="140.6" cy="104.2" r="69.02" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#20c4f4" />
          <stop offset=".19" stopColor="#21afe3" />
          <stop offset=".58" stopColor="#2679b9" />
          <stop offset="1" stopColor="#2c3987" />
        </radialGradient>
        <linearGradient id="ipma-lg" x1="109.8" y1="97.51" x2="109.8" y2="153.8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fcaf26" />
          <stop offset="1" stopColor="#e1992f" />
        </linearGradient>
        <radialGradient id="ipma-rg2" cx="145.6" cy="91.77" r="91.87" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".48" stopColor="#9be4fa" />
          <stop offset="1" stopColor="#20c4f4" />
        </radialGradient>
      </defs>
      {/* Blue inner arc */}
      <path fill="url(#ipma-rg)" d="M223.8,101.1C208.1,72.51 178.1,54.75 145.6,54.75c-48.56,0-88.16,39.02-89.11,87.35 0,0.6 0,3.3 0,3.9 0,4.3 3.48,7.7 7.78,7.7 4.3,0 7.78-3.4 7.78-7.7 0-0.6 0-3.3 0-3.9 0.91-28.5 24.43-51.49 53.25-51.49 19.4,0 37.3,10.59 46.7,27.69 2.1,3.8 6.8,5.2 10.6,3.1 3.7-2.1 5.1-6.8 3-10.6-12.1-22.04-35.2-35.75-60.3-35.75-2.2,0-4.4,0.11-6.5,0.31 8.3-3.25 17.3-5.04 26.8-5.04 26.8,0 51.6,14.66 64.5,38.28 2.1,3.7 6.8,5.1 10.6,3.1 3.7-2.1 5.1-6.8 3-10.6z" />
      {/* Yellow bottom arc */}
      <path fill="url(#ipma-lg)" d="M89.46,153.8c-4.3,0-7.78-3.5-7.78-7.8 0-26.7 21.72-48.49 48.52-48.49 4.3,0 7.8,3.49 7.8,7.79 0,4.3-3.5,7.8-7.8,7.8-18.2,0-32.95,14.7-32.95,32.9 0,4.3-3.48,7.8-7.78,7.8z" />
      {/* White/cyan outer arc */}
      <path fill="url(#ipma-rg2)" d="M252,153.7c-4.3,0-7.8-3.4-7.8-7.7 0-0.3 0-2.6 0-2.8-0.4-54.06-44.5-97.86-98.6-97.86-54.12,0-98.12,43.73-98.63,97.66 0,0.3 0,2.7 0,3 0,4.3-3.48,7.8-7.78,7.8-4.3,0-7.78-3.5-7.78-7.8 0-0.3 0-2.7 0-3C31.92,80.49 82.94,29.78 145.6,29.78c62.6,0 113.9,50.95 114.2,113.72 0,0.1 0,2.3 0,2.5 0,4.3-3.5,7.7-7.8,7.7z" />
    </svg>
  );
}

interface FooterProps {
  lastUpdate: string | null;
  t: Translations;
}

export function Footer({ lastUpdate, t }: FooterProps) {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        {/* Left: Data source + update time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
          <span className="inline-flex items-center gap-1.5 truncate">
            <IpmaLogo />
            {t.dataSource}:{" "}
            <a
              href="https://www.ipma.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              IPMA
            </a>
            {" "}&mdash;{" "}
            <span className="hidden sm:inline">{t.ipmaName}</span>
            <span className="sm:hidden">Instituto do Mar e da Atmosfera</span>
          </span>
          {lastUpdate && (
            <>
              <span className="hidden sm:inline text-gray-300 dark:text-gray-600 mx-2">&middot;</span>
              <span className="text-gray-400 dark:text-gray-500 shrink-0">
                {t.lastUpdated}:{" "}
                {new Date(lastUpdate).toLocaleTimeString(t.dateLocale, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" "}
                <span className="text-gray-300 dark:text-gray-600">
                  ({t.updateFrequency})
                </span>
              </span>
            </>
          )}
        </div>

        {/* Right: Made with ♥ + GitHub */}
        <div className="flex items-center gap-2 shrink-0 text-gray-400 dark:text-gray-500">
          <span>
            {t.madeWith}{" "}
            <span className="text-red-500">&hearts;</span>
            {" "}{t.by}{" "}
            <a
              href="https://andrejesus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-300 hover:underline transition-colors duration-200"
            >
              André Jesus
            </a>
          </span>
          <a
            href="https://github.com/andre-j3sus/sismos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200"
            aria-label={t.github}
            title="GitHub"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
