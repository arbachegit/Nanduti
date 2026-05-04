'use client';

import { useState, useEffect } from 'react';
import { validateCedula, formatCedula } from '@/lib/cedula-validator';

export default function CedulaInput({
  value,
  onChange,
  placeholder = '1234567',
  label,
}: {
  value: string;
  onChange: (clean: string, valid: boolean) => void;
  placeholder?: string;
  label?: string;
}) {
  const [touched, setTouched] = useState(false);
  const valid = validateCedula(value);
  const showState = touched && value.length >= 6;

  useEffect(() => {
    onChange(value.replace(/\D/g, ''), valid);
  }, [value, valid, onChange]);

  return (
    <label className="cedinput">
      {label ? <span className="cedinput__label">{label}</span> : null}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={`nd-input nd-mono ${showState ? (valid ? 'is-valid' : 'is-invalid') : ''}`}
        value={formatCedula(value)}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''), validateCedula(e.target.value))}
        onBlur={() => setTouched(true)}
        aria-invalid={showState && !valid}
      />
      {showState && !valid ? <span className="cedinput__msg">Cédula inválida (módulo 11)</span> : null}
      {showState && valid ? <span className="cedinput__msg cedinput__msg--ok">Cédula válida</span> : null}
      <style jsx>{`
        .cedinput { display: flex; flex-direction: column; gap: 6px; }
        .cedinput__label { font-size: 12px; color: var(--nd-t2); letter-spacing: 0.04em; }
        .cedinput__msg { font-size: 11px; color: var(--nd-danger); }
        .cedinput__msg--ok { color: var(--nd-success); }
      `}</style>
    </label>
  );
}
