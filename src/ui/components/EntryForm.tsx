import { useId, useState, type FormEvent } from 'react';
import { isValidISODate, isValidTime } from '../../domain/dates';
import { formatNumber, parseDecimal } from '../../domain/format';
import { validateEntryValue } from '../../domain/trackers';
import type { EntryDraft, Tracker } from '../../domain/types';
import { buttonDanger, buttonPrimary, buttonSecondary, fieldError, input, label } from './styles';

interface EntryFormProps {
  tracker: Tracker;
  initial: EntryDraft;
  maxDate: string;
  submitLabel: string;
  onSubmit: (draft: EntryDraft) => Promise<void> | void;
  onCancel: () => void;
  onDelete?: () => void;
}

type Errors = Partial<Record<keyof EntryDraft, string>>;

const segment =
  'flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-300 font-semibold has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-700 has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-sky-500 dark:border-slate-700 dark:has-[:checked]:border-emerald-500 dark:has-[:checked]:bg-emerald-500 dark:has-[:checked]:text-slate-950';

export function EntryForm({
  tracker,
  initial,
  maxDate,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: EntryFormProps) {
  const id = useId();
  const [valueText, setValueText] = useState(formatNumber(initial.value, 4).replace(/\./g, ''));
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [note, setNote] = useState(initial.note);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = parseDecimal(valueText);
    const found: Errors = {};
    const valueError = validateEntryValue(tracker.type, value);
    if (valueError) found.value = valueError;
    if (!isValidISODate(date)) found.date = 'Elige una fecha válida.';
    else if (date > maxDate) found.date = 'La fecha no puede ser futura.';
    if (!isValidTime(time)) found.time = 'Elige una hora válida.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSubmit({ value, date, time, note });
    } finally {
      setSaving(false);
    }
  };

  const err = (field: keyof EntryDraft) =>
    errors[field] ? (
      <p id={`${id}-${field}-error`} className={fieldError}>
        {errors[field]}
      </p>
    ) : null;
  const errAttrs = (field: keyof EntryDraft) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-${field}-error` }
      : {};

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {tracker.type === 'boolean' || tracker.type === 'scale' ? (
        <fieldset>
          <legend className={label}>
            {tracker.type === 'boolean' ? '¿Lo hiciste?' : 'Valor (1 a 5)'}
          </legend>
          <div className="flex gap-2">
            {(tracker.type === 'boolean'
              ? [
                  { v: '1', text: 'Sí' },
                  { v: '0', text: 'No' },
                ]
              : ['1', '2', '3', '4', '5'].map((v) => ({ v, text: v }))
            ).map((opt) => (
              <label key={opt.v} className={segment}>
                <input
                  type="radio"
                  name={`${id}-value`}
                  value={opt.v}
                  checked={valueText === opt.v}
                  onChange={() => setValueText(opt.v)}
                  className="sr-only"
                />
                {opt.text}
              </label>
            ))}
          </div>
          {err('value')}
        </fieldset>
      ) : (
        <div>
          <label htmlFor={`${id}-value`} className={label}>
            Valor{tracker.unit ? ` (${tracker.unit})` : ''}
          </label>
          <input
            id={`${id}-value`}
            className={input}
            inputMode="decimal"
            value={valueText}
            onChange={(e) => setValueText(e.target.value)}
            autoFocus
            {...errAttrs('value')}
          />
          {err('value')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-date`} className={label}>
            Fecha
          </label>
          <input
            id={`${id}-date`}
            type="date"
            className={input}
            value={date}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            {...errAttrs('date')}
          />
          {err('date')}
        </div>
        <div>
          <label htmlFor={`${id}-time`} className={label}>
            Hora
          </label>
          <input
            id={`${id}-time`}
            type="time"
            className={input}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            {...errAttrs('time')}
          />
          {err('time')}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-note`} className={label}>
          Nota <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          id={`${id}-note`}
          className={`${input} min-h-20`}
          value={note}
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        {onDelete ? (
          <button type="button" className={buttonDanger} onClick={onDelete}>
            Borrar
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className={buttonSecondary} onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className={buttonPrimary} disabled={saving}>
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
