'use client';

import { useNandutiLocale, type NandutiLocale } from './LocaleProvider';

const ORDER: NandutiLocale[] = ['es', 'gn', 'jopara'];

export default function LangSwitcher() {
  const { locale, setLocale, t } = useNandutiLocale();
  return (
    <div className="nanduti-lang" role="group" aria-label={t('lang.label')}>
      {ORDER.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            className={active ? 'nanduti-lang__btn is-active' : 'nanduti-lang__btn'}
            aria-pressed={active}
            onClick={() => setLocale(code)}
          >
            {t(`lang.${code}`)}
          </button>
        );
      })}
    </div>
  );
}
