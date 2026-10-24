import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Layout, type NavItem } from '../ui/components/Layout';
import {
  IconHistory,
  IconInsights,
  IconSettings,
  IconStats,
  IconToday,
} from '../ui/components/icons';
import { SampleBanner } from '../ui/components/SampleBanner';
import { muted } from '../ui/components/styles';
import { ToastProvider } from '../ui/components/ToastProvider';
import { useTracker } from '../ui/hooks/useData';
import { useRoute, type Route } from '../ui/router';
import { TodayScreen } from '../ui/screens/TodayScreen';

// Las pantallas que no son "Hoy" se cargan bajo demanda para aligerar la carga inicial.
const HistoryScreen = lazy(() =>
  import('../ui/screens/HistoryScreen').then((m) => ({ default: m.HistoryScreen })),
);
const StatsScreen = lazy(() =>
  import('../ui/screens/StatsScreen').then((m) => ({ default: m.StatsScreen })),
);
const TrackerDetailScreen = lazy(() =>
  import('../ui/screens/TrackerDetailScreen').then((m) => ({ default: m.TrackerDetailScreen })),
);
const InsightsScreen = lazy(() =>
  import('../ui/screens/InsightsScreen').then((m) => ({ default: m.InsightsScreen })),
);
const SettingsScreen = lazy(() =>
  import('../ui/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);
const ManageTrackersScreen = lazy(() =>
  import('../ui/screens/ManageTrackersScreen').then((m) => ({ default: m.ManageTrackersScreen })),
);

const NAV: NavItem[] = [
  { route: { name: 'today' }, label: 'Hoy', icon: IconToday, matches: ['today'] },
  { route: { name: 'history' }, label: 'Historial', icon: IconHistory, matches: ['history'] },
  {
    route: { name: 'stats' },
    label: 'Estadísticas',
    icon: IconStats,
    matches: ['stats', 'tracker'],
  },
  { route: { name: 'insights' }, label: 'Hallazgos', icon: IconInsights, matches: ['insights'] },
  {
    route: { name: 'settings' },
    label: 'Ajustes',
    icon: IconSettings,
    matches: ['manage', 'settings'],
  },
];

interface Screen {
  title: string;
  back?: Route;
  content: ReactNode;
}

function screenFor(route: Route, trackerName: string | undefined): Screen {
  switch (route.name) {
    case 'history':
      return { title: 'Historial', content: <HistoryScreen /> };
    case 'stats':
      return { title: 'Estadísticas', content: <StatsScreen /> };
    case 'tracker':
      return {
        title: trackerName ?? 'Detalle',
        back: { name: 'stats' },
        content: <TrackerDetailScreen key={route.id} id={route.id} />,
      };
    case 'insights':
      return { title: 'Hallazgos', content: <InsightsScreen /> };
    case 'settings':
      return { title: 'Ajustes', content: <SettingsScreen /> };
    case 'manage':
      return {
        title: 'Rastreadores',
        back: { name: 'settings' },
        content: <ManageTrackersScreen />,
      };
    case 'today':
      return { title: 'Hoy', content: <TodayScreen /> };
  }
}

export function App() {
  const route = useRoute();
  const tracker = useTracker(route.name === 'tracker' ? route.id : '');
  const screen = screenFor(route, tracker?.name);

  useEffect(() => {
    document.title = `${screen.title} · Pulso`;
  }, [screen.title]);

  return (
    <ToastProvider>
      <Layout
        title={screen.title}
        route={route}
        nav={NAV}
        back={screen.back}
        banner={<SampleBanner />}
      >
        <Suspense fallback={<p className={muted}>Cargando…</p>}>{screen.content}</Suspense>
      </Layout>
    </ToastProvider>
  );
}
