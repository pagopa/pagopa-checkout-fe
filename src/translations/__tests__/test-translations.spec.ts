import itTranslation from "../it/translations.json";
import enTranslation from "../en/translations.json";
import frTranslation from "../fr/translations.json";
import deTranslation from "../de/translations.json";
import slTranslation from "../sl/translations.json";

function getKeysFlat(obj: any, parentKey = ""): Array<string> {
  return Object.keys(obj).reduce((keys: Array<string>, key: string) => {
    const composedKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      return keys.concat(getKeysFlat(obj[key], composedKey));
    }

    return keys.concat(composedKey);
  }, []);
}

function getValueByPath(obj: any, pathStr: string): any {
  return pathStr.split(".").reduce((current, prop) => current?.[prop], obj);
}

describe("Translations Validation", () => {
  const itKeys = getKeysFlat(itTranslation);

  describe("All Italian keys are present in other languages", () => {
    it.each([
      ["en", enTranslation],
      ["fr", frTranslation],
      ["de", deTranslation],
      ["sl", slTranslation],
    ])("Should contain all Italian keys in [%s]", (_lang, translation) => {
      const missingKeys = itKeys.filter(
        (key) => getValueByPath(translation, key) === undefined
      );

      if (missingKeys.length > 0) {
        const missingList = missingKeys.map((k) => `\n  - ${k}`).join("");

        throw new Error(
          `${_lang.toUpperCase()}: Missing ${
            missingKeys.length
          } translation keys:${missingList}`
        );
      }

      expect(missingKeys.length).toBe(0);
    });
  });

  describe("No translation has empty values", () => {
    it.each([
      ["it", itTranslation],
      ["en", enTranslation],
      ["fr", frTranslation],
      ["de", deTranslation],
      ["sl", slTranslation],
    ])("Should have no empty values in [%s]", (_lang, translation) => {
      const emptyValues = itKeys.filter((key) => {
        const value = getValueByPath(translation, key);

        return typeof value === "string" && value.trim() === "";
      });

      if (emptyValues.length > 0) {
        const emptyList = emptyValues.map((k) => `\n  - ${k}`).join("");

        throw new Error(
          `${_lang.toUpperCase()}: Found ${
            emptyValues.length
          } empty translations:${emptyList}`
        );
      }

      expect(emptyValues.length).toBe(0);
    });
  });

  describe("All languages have the same number of keys", () => {
    it.each([
      ["en", enTranslation],
      ["fr", frTranslation],
      ["de", deTranslation],
      ["sl", slTranslation],
    ])(
      "Should have same number of keys as Italian in [%s]",
      (_lang, translation) => {
        const langKeys = getKeysFlat(translation);
        const missing = itKeys.filter((k) => !langKeys.includes(k));

        expect(missing.length).toBe(0);
      }
    );
  });
});
