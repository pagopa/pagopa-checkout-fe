const fs = require('fs');
const path = require('path');

const translationsDir = './src/translations';
const languages = ['it', 'en', 'fr', 'de', 'sl'];

function getKeysFlat(obj, parentKey = '') {
  let keys = [];
  for (const key in obj) {
    const composedKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = [...keys, ...getKeysFlat(obj[key], composedKey)];
    } else {
      keys.push(composedKey);
    }
  }
  return keys;
}

function getValueByPath(obj, pathStr) {
  return pathStr.split('.').reduce((current, prop) => current?.[prop], obj);
}

// Carica tutti i file
const translations = {};
languages.forEach(lang => {
  const filePath = path.join(translationsDir, lang, 'translations.json');
  try {
    translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Errore nel leggere ${lang}: ${e.message}`);
  }
});

// Estrai tutte le chiavi dall'italiano
const itKeys = getKeysFlat(translations['it']);
console.log(`\n📋 Totale chiavi trovate in italiano: ${itKeys.length}\n`);

// Verifica traduzioni identiche
const identical = {};
languages.forEach(lang => {
  if (lang !== 'it') {
    identical[lang] = [];
  }
});

itKeys.forEach(key => {
  const itValue = getValueByPath(translations['it'], key);
  
  languages.forEach(lang => {
    if (lang !== 'it') {
      const langValue = getValueByPath(translations[lang], key);
      
      // Se il valore esiste ed è identico all'italiano
      if (langValue !== undefined && itValue === langValue) {
        identical[lang].push({
          key,
          value: itValue
        });
      }
    }
  });
});

// Stampa risultati
console.log('⚠️  TRADUZIONI IDENTICHE ALL\'ITALIANO (probabilmente non tradotte):\n');

Object.keys(identical).forEach(lang => {
  if (identical[lang].length > 0) {
    console.log(`\n🟡 ${lang.toUpperCase()} - ${identical[lang].length} traduzioni identiche:\n`);
    identical[lang].forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.key}`);
      console.log(`      Valore: "${item.value}"\n`);
    });
  } else {
    console.log(`\n✅ ${lang.toUpperCase()} - Nessuna traduzione identica all'italiano!`);
  }
});

// Riepilogo
console.log('\n\n📊 RIEPILOGO:');
Object.keys(identical).forEach(lang => {
  console.log(`${lang}: ${identical[lang].length} identiche all'italiano`);
});

// Salva in file JSON
const report = {
  totalKeys: itKeys.length,
  timestamp: new Date().toISOString(),
  identical
};

fs.writeFileSync('identical-translations-report.json', JSON.stringify(report, null, 2));
console.log('\n✅ Report salvato in identical-translations-report.json');