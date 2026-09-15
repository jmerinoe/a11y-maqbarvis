// i18n/index.js — translation function and language switching

import { getState, setState, notify } from '../store.js';
import { es } from './es.js';
import { en } from './en.js';

const tables = { es, en };

export function t(key, vars = {}) {
  const { language } = getState();
  const table = tables[language] || tables.es;
  const str = table[key] || key;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export function setLanguage(lang) {
  if (!tables[lang]) return;
  document.documentElement.lang = lang;
  setState({ language: lang });
}

export function getCurrentLanguage() {
  return getState().language;
}
