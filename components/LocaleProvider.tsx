'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import esStrings from '@/data/i18n/es.json';
import gnStrings from '@/data/i18n/gn.json';
import joStrings from '@/data/i18n/jopara.json';

export type NandutiLocale = 'es' | 'gn' | 'jopara';

type StringsTree = Record<string, unknown>;

const dictionaries: Record<NandutiLocale, StringsTree> = {
  es: esStrings as StringsTree,
  gn: gnStrings as StringsTree,
  jopara: joStrings as StringsTree,
};

interface LocaleContextValue {
  locale: NandutiLocale;
  setLocale: (locale: NandutiLocale) => void;
  t: (key: string) => string;
  tArr: (key: string) => string[];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveRaw(tree: StringsTree, key: string): unknown {
  const parts = key.split('.');
  let cursor: unknown = tree;
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cursor;
}

function resolve(tree: StringsTree, key: string): string {
  const v = resolveRaw(tree, key);
  return typeof v === 'string' ? v : key;
}

function resolveArr(tree: StringsTree, key: string): string[] {
  const v = resolveRaw(tree, key);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function NandutiLocaleProvider({
  children,
  initial = 'jopara',
}: {
  children: React.ReactNode;
  initial?: NandutiLocale;
}) {
  const [locale, setLocaleState] = useState<NandutiLocale>(initial);

  const setLocale = useCallback((next: NandutiLocale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('nanduti.locale', next);
      } catch {
      }
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      t: (key: string) => resolve(dict, key),
      tArr: (key: string) => resolveArr(dict, key),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useNandutiLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useNandutiLocale must be used inside NandutiLocaleProvider');
  }
  return ctx;
}
