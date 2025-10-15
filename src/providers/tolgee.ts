import { Tolgee, DevTools, FormatSimple } from "@tolgee/react";

// Statische Importe der Übersetzungsdateien
import de from "../translation/de.json";
import en from "../translation/en.json";
import es from "../translation/es.json";
import it from "../translation/it.json";
import nl from "../translation/nl.json";
import zh from "../translation/zh.json";

// Tolgee-Konfiguration für statische Übersetzungen
export const tolgee = Tolgee()
  .use(FormatSimple())
  // DevTools komplett deaktivieren um API-Calls zu vermeiden
  // .use(DevTools()) // Auskommentiert
  .init({
    // Keine API-Konfiguration für statische Daten
    availableLanguages: ["de", "en", "es", "it", "nl", "zh"],
    defaultLanguage: localStorage.getItem("language") || "de",
    fallbackLanguage: "en",
    // Hier werden die Übersetzungsdaten synchron bereitgestellt
    staticData: {
      de,
      en,
      es,
      it,
      nl,
      zh,
    },
  });
