// Canonical fallback/default site language.
// Declared in its own side-effect-free module so it can be imported both by
// `i18n.ts` (which has init side-effects) and by components/tests that must
// not trigger the i18next initialization.
export const fallbackLang = "it";
