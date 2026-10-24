import { useId, useState, type FormEvent } from 'react';
import { SUGGESTED_ICONS, TRACKER_COLORS } from '../../domain/colors';
import { formatNumber, parseDecimal } from '../../domain/format';
import { defaultsForType, validateTrackerDraft, type DraftErrors } from '../../domain/trackers';
import {
  TRACKER_TYPE_LABELS,
  TRACKER_TYPES,
  type GoalDirection,
  type TrackerDraft,
  type TrackerType,
} from '../../domain/types';
import { buttonPrimary, buttonSecondary, fieldError, input, label } from './styles';

interface TrackerFormProps {
  initial: TrackerDraft;
  submitLabel: string;
  onSubmit: (draft: TrackerDraft) => Promise<void> | void;
  onCancel: () => void;
}

const TYPE_HINTS: Record<TrackerType, string> = {
  counter: 'Cuenta veces: cafés, vasos de agua, cigarrillos…',
  quantity: 'Mide algo con unidad: horas de sueño, km, pesos gastados…',
  boolean: '¿Lo hiciste hoy o no? Ejercicio, meditar, tomar la pastilla…',
  scale: 'Califica del 1 al 5: ánimo, energía, calidad del sueño…',
};

const UNIT_SUGGESTIONS = ['h', 'min', 'km', 'COP', 'tazas', 'vasos', 'páginas', 'pasos', 'kg', 'L'];

const numText = (n: number | null) => (n === null ? '' : formatNumber(n, 4).replace(/\./g, ''));

export function TrackerForm({ initial, submitLabel, onSubmit, onCancel }: TrackerFormProps) {
  const [name, setName] = useState(initial.name);
  const [icon, setIcon] = useState(initial.icon);
  const [color, setColor] = useState(initial.color);
  const [type, setType] = useState<TrackerType>(initial.type);
  const [unit, setUnit] = useState(initial.unit);
  const [defaultText, setDefaultText] = useState(numText(initial.defaultValue));
  const [hasGoal, setHasGoal] = useState(initial.dailyGoal !== null);
  const [goalText, setGoalText] = useState(numText(initial.dailyGoal));
  const [goalDirection, setGoalDirection] = useState<GoalDirection>(
    initial.goalDirection ?? 'atLeast',
  );
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const id = useId();

  const changeType = (next: TrackerType) => {
    setType(next);
    const d = defaultsForType(next);
    setUnit(next === initial.type ? initial.unit : d.unit);
    setDefaultText(numText(d.defaultValue));
    if (next === 'boolean') setGoalText('1');
    else if (next === 'scale') setGoalText('4');
    else setGoalText('');
  };

  const buildDraft = (): TrackerDraft => ({
    name,
    icon,
    color,
    type,
    unit,
    defaultValue: parseDecimal(defaultText),
    dailyGoal: hasGoal ? (type === 'boolean' ? 1 : parseDecimal(goalText)) : null,
    goalDirection,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const draft = buildDraft();
    const found = validateTrackerDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSubmit(draft);
    } finally {
      setSaving(false);
    }
  };

  const errorProps = (field: keyof TrackerDraft) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-${field}-error` }
      : {};
  const errorText = (field: keyof TrackerDraft) =>
    errors[field] ? (
      <p id={`${id}-${field}-error`} className={fieldError}>
        {errors[field]}
      </p>
    ) : null;

  const showUnit = type === 'counter' || type === 'quantity';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={`${id}-name`} className={label}>
          Nombre
        </label>
        <input
          id={`${id}-name`}
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoComplete="off"
          placeholder="Ej.: Horas de estudio"
          {...errorProps('name')}
        />
        {errorText('name')}
      </div>

      <fieldset>
        <legend className={label}>Tipo</legend>
        <div className="grid gap-2">
          {TRACKER_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:border-slate-700 dark:has-[:checked]:bg-emerald-950/40"
            >
              <input
                type="radio"
                name={`${id}-type`}
                value={t}
                checked={type === t}
                onChange={() => changeType(t)}
                className="mt-1 h-4 w-4 accent-emerald-600"
              />
              <span>
                <span className="block font-medium">{TRACKER_TYPE_LABELS[t]}</span>
                <span className="block text-sm text-slate-600 dark:text-slate-400">
                  {TYPE_HINTS[t]}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Ícono</legend>
        <div className="grid grid-cols-8 gap-1">
          {SUGGESTED_ICONS.map((emoji) => (
            <label
              key={emoji}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-lg text-xl has-[:checked]:bg-emerald-100 has-[:checked]:ring-2 has-[:checked]:ring-emerald-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-sky-500 dark:has-[:checked]:bg-emerald-900/50"
            >
              <input
                type="radio"
                name={`${id}-icon`}
                value={emoji}
                checked={icon === emoji}
                onChange={() => setIcon(emoji)}
                className="sr-only"
                aria-label={`Ícono ${emoji}`}
              />
              <span aria-hidden="true">{emoji}</span>
            </label>
          ))}
        </div>
        <label
          htmlFor={`${id}-icon-custom`}
          className="mt-2 block text-sm text-slate-600 dark:text-slate-400"
        >
          O escribe tu propio emoji
        </label>
        <input
          id={`${id}-icon-custom`}
          className={`${input} mt-1 w-24 text-center text-xl`}
          value={icon}
          onChange={(e) => setIcon(Array.from(e.target.value).slice(-2).join(''))}
          {...errorProps('icon')}
        />
        {errorText('icon')}
      </fieldset>

      <fieldset>
        <legend className={label}>Color</legend>
        <div className="flex flex-wrap gap-2">
          {TRACKER_COLORS.map((c) => (
            <label
              key={c.key}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full has-[:checked]:ring-4 has-[:checked]:ring-offset-2 has-[:checked]:ring-slate-400 has-[:focus-visible]:outline has-[:focus-visible]:outline-sky-500 dark:ring-offset-slate-900"
              style={{ backgroundColor: c.hex }}
            >
              <input
                type="radio"
                name={`${id}-color`}
                value={c.key}
                checked={color === c.key}
                onChange={() => setColor(c.key)}
                className="sr-only"
                aria-label={c.label}
              />
            </label>
          ))}
        </div>
        {errorText('color')}
      </fieldset>

      {showUnit && (
        <div>
          <label htmlFor={`${id}-unit`} className={label}>
            Unidad {type === 'counter' && <span className="font-normal">(opcional)</span>}
          </label>
          <input
            id={`${id}-unit`}
            className={input}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list={`${id}-units`}
            maxLength={20}
            placeholder={type === 'counter' ? 'Ej.: tazas' : 'Ej.: h, km, COP'}
            {...errorProps('unit')}
          />
          <datalist id={`${id}-units`}>
            {UNIT_SUGGESTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          {errorText('unit')}
          {type === 'quantity' && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Usa «COP» para que los valores se muestren como pesos colombianos.
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor={`${id}-default`} className={label}>
          Valor de un toque
        </label>
        {type === 'boolean' ? (
          <select
            id={`${id}-default`}
            className={input}
            value={defaultText}
            onChange={(e) => setDefaultText(e.target.value)}
          >
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        ) : type === 'scale' ? (
          <select
            id={`${id}-default`}
            className={input}
            value={defaultText}
            onChange={(e) => setDefaultText(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${id}-default`}
            className={input}
            inputMode="decimal"
            value={defaultText}
            onChange={(e) => setDefaultText(e.target.value)}
            {...errorProps('defaultValue')}
          />
        )}
        {errorText('defaultValue')}
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Es lo que se registra al tocar el rastreador en la pantalla de hoy.
        </p>
      </div>

      <div>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={hasGoal}
            onChange={(e) => setHasGoal(e.target.checked)}
            className="h-5 w-5 accent-emerald-600"
          />
          <span className="font-medium">
            {type === 'boolean' ? 'Meta: hacerlo todos los días' : 'Tener meta diaria'}
          </span>
        </label>
        {hasGoal && (type === 'counter' || type === 'quantity') && (
          <fieldset className="mt-2">
            <legend className={label}>Tipo de meta</legend>
            <div className="flex gap-2">
              {(
                [
                  ['atLeast', 'Al menos', 'Ej.: 8 vasos de agua'],
                  ['atMost', 'Como máximo', 'Ej.: 2 tazas de café'],
                ] as const
              ).map(([value, text, hint]) => (
                <label
                  key={value}
                  className="flex flex-1 cursor-pointer flex-col rounded-xl border border-slate-200 p-3 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-sky-500 dark:border-slate-700 dark:has-[:checked]:bg-emerald-950/40"
                >
                  <input
                    type="radio"
                    name={`${id}-direction`}
                    value={value}
                    checked={goalDirection === value}
                    onChange={() => setGoalDirection(value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{text}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {hasGoal && type !== 'boolean' && (
          <div className="mt-2">
            <label htmlFor={`${id}-goal`} className={label}>
              {type === 'scale'
                ? 'Promedio mínimo del día (1–5)'
                : goalDirection === 'atMost'
                  ? 'Límite diario'
                  : 'Meta diaria'}
            </label>
            <input
              id={`${id}-goal`}
              className={input}
              inputMode="decimal"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              {...errorProps('dailyGoal')}
            />
          </div>
        )}
        {errorText('dailyGoal')}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={buttonSecondary} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={buttonPrimary} disabled={saving}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
