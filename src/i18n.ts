/**
 * Simple homegrown translations for PT and EN.
 *
 * A full i18n library (e.g. react-i18next) would be overkill for this
 * simple website with only ~30 translatable strings and 2 languages.
 * If more languages are needed in the future, consider migrating to one.
 */

import { useState, useEffect, useCallback } from "react";

export type Locale = "pt" | "en";

export interface Translations {
  // Header
  earthquakeCount: (n: number) => string;
  // Time filters
  timeFilter1h: string;
  timeFilter24h: string;
  timeFilter7d: string;
  timeFilter30d: string;
  // Theme
  switchToLight: string;
  switchToDark: string;
  // List
  loading: string;
  error: string;
  noResults: string;
  depth: string;
  continent: string;
  madeira: string;
  azores: string;
  // Map popup
  depthLabel: string;
  depthNA: string;
  // Footer
  dataSource: string;
  ipmaName: string;
  lastUpdated: string;
  // Time ago
  justNow: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  yesterday: string;
  daysAgo: (n: number) => string;
  // Date formatting locale
  dateLocale: string;
  // Filters
  filters: string;
  magnitude: string;
  depthFilter: string;
  region: string;
  clearFilters: string;
  km: string;
  // Footer
  updateFrequency: string;
  madeWith: string;
  by: string;
  // Accessibility
  hideList: string;
  showList: string;
  toggleFilters: string;
  github: string;
  // Map controls
  resetView: string;
  // Data
  unknownRegion: string;
}

const pt: Translations = {
  earthquakeCount: (n) => `${n} sismo${n !== 1 ? "s" : ""}`,
  timeFilter1h: "1 hora",
  timeFilter24h: "24 horas",
  timeFilter7d: "7 dias",
  timeFilter30d: "30 dias",
  switchToLight: "Mudar para tema claro",
  switchToDark: "Mudar para tema escuro",
  loading: "A carregar sismos...",
  error: "Erro",
  noResults: "Nenhum sismo encontrado",
  depth: "Prof.",
  continent: "Continente",
  madeira: "Madeira",
  azores: "Açores",
  depthLabel: "Profundidade",
  depthNA: "Profundidade: N/D",
  dataSource: "Dados",
  ipmaName: "Instituto Português do Mar e da Atmosfera",
  lastUpdated: "Atualizado",
  justNow: "agora mesmo",
  minutesAgo: (n) => `há ${n} min`,
  hoursAgo: (n) => `há ${n}h`,
  yesterday: "ontem",
  daysAgo: (n) => `há ${n} dias`,
  dateLocale: "pt-PT",
  filters: "Filtros",
  magnitude: "Magnitude",
  depthFilter: "Profundidade",
  region: "Região",
  clearFilters: "Limpar filtros",
  km: "km",
  updateFrequency: "atualiza a cada 5 min",
  madeWith: "Feito com",
  by: "por",
  hideList: "Esconder lista",
  showList: "Mostrar lista",
  toggleFilters: "Alternar filtros",
  github: "GitHub",
  resetView: "Repor vista",
  unknownRegion: "Desconhecido",
};

const en: Translations = {
  earthquakeCount: (n) => `${n} earthquake${n !== 1 ? "s" : ""}`,
  timeFilter1h: "1 hour",
  timeFilter24h: "24 hours",
  timeFilter7d: "7 days",
  timeFilter30d: "30 days",
  switchToLight: "Switch to light theme",
  switchToDark: "Switch to dark theme",
  loading: "Loading earthquakes...",
  error: "Error",
  noResults: "No earthquakes found",
  depth: "Depth",
  continent: "Mainland",
  madeira: "Madeira",
  azores: "Azores",
  depthLabel: "Depth",
  depthNA: "Depth: N/A",
  dataSource: "Data",
  ipmaName: "Portuguese Institute for Sea and Atmosphere",
  lastUpdated: "Updated",
  justNow: "just now",
  minutesAgo: (n) => `${n} min ago`,
  hoursAgo: (n) => `${n}h ago`,
  yesterday: "yesterday",
  daysAgo: (n) => `${n} days ago`,
  dateLocale: "en-GB",
  filters: "Filters",
  magnitude: "Magnitude",
  depthFilter: "Depth",
  region: "Region",
  clearFilters: "Clear filters",
  km: "km",
  updateFrequency: "refreshes every 5 min",
  madeWith: "Made with",
  by: "by",
  hideList: "Hide list",
  showList: "Show list",
  toggleFilters: "Toggle filters",
  github: "GitHub",
  resetView: "Reset view",
  unknownRegion: "Unknown",
};

const translations: Record<Locale, Translations> = { pt, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt";

  const stored = localStorage.getItem("locale");
  if (stored === "pt" || stored === "en") return stored;

  // Default to Portuguese since this is a .pt website
  return "pt";
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translations[locale];

  return { locale, setLocale, t };
}
