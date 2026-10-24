import { ToastProvider } from '../ui/components/ToastProvider';
import { Layout, type NavItem } from '../ui/components/Layout';
import { IconSettings } from '../ui/components/icons';
import { useRoute } from '../ui/router';
import { ManageTrackersScreen } from '../ui/screens/ManageTrackersScreen';

const NAV: NavItem[] = [
  {
    route: { name: 'manage' },
    label: 'Rastreadores',
    icon: IconSettings,
    matches: ['manage', 'today'],
  },
];

export function App() {
  const route = useRoute();
  return (
    <ToastProvider>
      <Layout title="Rastreadores" route={route} nav={NAV}>
        <ManageTrackersScreen />
      </Layout>
    </ToastProvider>
  );
}
