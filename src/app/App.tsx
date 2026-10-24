import type { ReactNode } from 'react';
import { Layout, type NavItem } from '../ui/components/Layout';
import { IconSettings, IconToday } from '../ui/components/icons';
import { ToastProvider } from '../ui/components/ToastProvider';
import { useRoute, type Route } from '../ui/router';
import { ManageTrackersScreen } from '../ui/screens/ManageTrackersScreen';
import { TodayScreen } from '../ui/screens/TodayScreen';

const NAV: NavItem[] = [
  { route: { name: 'today' }, label: 'Hoy', icon: IconToday, matches: ['today'] },
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
