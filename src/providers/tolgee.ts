import { Tolgee, DevTools, FormatSimple } from "@tolgee/react";

export const tolgee = Tolgee()
  .use(FormatSimple()) // Falls du Formatierung benötigst
  .use(DevTools()) // Optional für Debugging
  .init({
    apiUrl: "http://localhost:3000", // Lokale Tolgee-Instanz
    apiKey: "dummy", // Falls du Tolgee Cloud nicht nutzt, kann das leer bleiben
    availableLanguages: ["de", "en"],
    defaultLanguage: localStorage.getItem("language") || "de",
    fallbackLanguage: "en",
    staticData: {
      de: async () => {
        const module = await import("../translation/de.json");
        return module.default as Record<string, any>;
      },
      en: async () => {
        const module = await import("../translation/en.json");
        return module.default as Record<string, any>;
      }
    },
  });