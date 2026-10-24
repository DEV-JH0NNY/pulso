import { useState } from 'react';
import { loadSampleData } from '../../data/sample';
import { ONBOARDING_DONE, setSetting } from '../../data/settings';
import { navigate } from '../router';
import { buttonPrimary, buttonSecondary, card, muted } from './styles';

/** Primera apertura: ofrece datos de ejemplo o empezar desde cero. */
export function WelcomeCard() {
  const [loading, setLoading] = useState(false);
  return (
    <section className={`${card} text-center`} aria-labelledby="bienvenida">
      <p className="text-5xl" aria-hidden="true">
        📈
      </p>
      <h2 id="bienvenida" className="mt-2 text-xl font-bold">
        Te damos la bienvenida a Pulso
      </h2>
      <p className={`${muted} mx-auto mt-2 max-w-sm`}>
        Registra tu vida como un dataset: estudio, sueño, café, gastos, ánimo… Un toque para
        registrar y la app te muestra rachas, gráficos y hallazgos. Tus datos se quedan en este
        dispositivo.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          className={buttonPrimary}
          disabled={loading}
          onClick={() => {
            setLoading(true);
            void loadSampleData().finally(() => setLoading(false));
          }}
        >
          {loading ? 'Cargando…' : 'Explorar con datos de ejemplo'}
        </button>
        <button
          type="button"
          className={buttonSecondary}
          onClick={() => {
            void setSetting(ONBOARDING_DONE, true);
            navigate({ name: 'manage' });
          }}
        >
          Empezar desde cero
        </button>
      </div>
      <p className={`${muted} mt-4`}>
        Los datos de ejemplo quedan marcados como tales y puedes borrarlos con un botón cuando
        quieras.
      </p>
    </section>
  );
}
