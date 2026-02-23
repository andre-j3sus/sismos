import type { Translations } from "../i18n";

interface FooterProps {
  lastUpdate: string | null;
  t: Translations;
}

export function Footer({ lastUpdate, t }: FooterProps) {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div className="truncate">
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
        </div>
        <div className="text-gray-400 dark:text-gray-500 shrink-0">
          {lastUpdate && (
            <>
              {t.lastUpdated}:{" "}
              {new Date(lastUpdate).toLocaleTimeString(t.dateLocale, {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" "}
            </>
          )}
          <span className="text-gray-300 dark:text-gray-600">
            ({t.updateFrequency})
          </span>
        </div>
      </div>
    </footer>
  );
}
