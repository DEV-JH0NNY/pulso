import type { ReactNode } from 'react';
import { Layout, type NavItem } from '../ui/components/Layout';
import { IconHistory, IconSettings, IconStats, IconToday } from '../ui/components/icons';
import { ToastProvider } from '../ui/components/ToastProvider';
import { useRoute, type Route } from '../ui/router';
import { HistoryScreen } from '../ui/screens/HistoryScreen';
import { ManageTrackersScreen } from '../ui/screens/ManageTrackersScreen';
import { StatsScreen } from '../ui/screens/StatsScreen';
import { TodayScreen } from '../ui/screens/TodayScreen';
import { TrackerDetailScreen } from '../ui/screens/TrackerDetailScreen';

const NAV: NavItem[] = [
  { route: { name: 'today' }, label: 'Hoy', icon: IconToday, matches: ['today'] },
  { route: { name: 'history' }, label: 'Historial', icon: IconHistory, matches: ['history'] },
  {
    route: { name: 'stats' },
    label: 'Estadísticas',
    icon: IconStats,
    matches: ['stats', 'tracker'],
  },
  {
    route: { name: 'manage' },
    label: 'Rastreadores',
    icon: IconSettings,
    matches: ['manage', 'settings'],
  },
];

interface Screen {
  title: string;
  back?: Route;
  content: ReactNode;
}

function screenFor(route: Route): Screen {
  switch (route.name) {
    case 'history':
      return { title: 'Historial', content: <HistoryScreen /> };
    case 'stats':
      return { title: 'Estadísticas', content: <StatsScreen /> };
    case 'tracker':
      return {
        title: 'Detalle',
        back: { name: 'stats' },
        content: <TrackerDetailScreen key={route.id} id={route.id} />,
      };
    case 'manage':
      return { title: 'Rastreadores', content: <ManageTrackersScreen /> };
    default:
      return { title: 'Hoy', content: <TodayScreen /> };
  }
}

export function App() {
  const route = useRoute();
  const screen = screenFor(route);
  return (
    <ToastProvider>
      <Layout title={screen.title} route={route} nav={NAV} back={screen.back}>
        {screen.content}
      </Layout>
    </ToastProvider>
  );
}
