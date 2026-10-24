import { Component, type ErrorInfo, type ReactNode } from 'react';
import { exportBackup } from '../../data/backupIO';
import { today } from '../../domain/dates';
import { downloadText } from '../download';
import { buttonPrimary, buttonSecondary, card, muted } from './styles';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Atrapa errores al dibujar una pantalla y muestra una salida amable en lugar
 * de una página en blanco. Los datos siguen a salvo en IndexedDB.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Sin telemetría: el detalle solo queda en la consola del propio dispositivo.
    console.error('Error en la pantalla', error, info.componentStack);
  }

  private backup = async () => {
    downloadText(`pulso-respaldo-${today()}.json`, await exportBackup(), 'application/json');
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section role="alert" className={`${card} space-y-3`}>
        <p className="text-lg font-semibold">Algo salió mal en esta pantalla 😕</p>
        <p className={muted}>
          Tus datos están a salvo en este dispositivo. Puedes reintentar o, por precaución,
          descargar un respaldo.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-2 text-xs dark:bg-slate-800">
          {this.state.error.message}
        </pre>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
          <button type="button" className={buttonSecondary} onClick={() => void this.backup()}>
            Descargar respaldo
          </button>
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => window.location.reload()}
          >
            Recargar la app
          </button>
        </div>
      </section>
    );
  }
}
