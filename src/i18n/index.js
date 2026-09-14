// i18n/index.js — translation function and language switching

import { getState, setState, notify } from '../store.js';
import { es } from './es.js';
import { en } from './en.js';

const tables = { es, en };

export function t(key) {
  const { language } = getState();
  const table = tables[language] || tables.es;
  return table[key] || key;
}

export function setLanguage(lang) {
  if (!tables[lang]) return;
  document.documentElement.lang = lang;
  setState({ language: lang });
}

export function getCurrentLanguage() {
  return getState().language;
}
