import type { ReactNode } from 'react';
import { routeHref, type Route } from '../router';
import { IconBack } from './icons';
import { iconButton } from './styles';

export interface NavItem {
  route: Route;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  /** Rutas que también marcan esta pestaña como activa. */
  matches: Route['name'][];
}

interface LayoutProps {
  title: string;
  route: Route;
  nav: NavItem[];
  back?: Route;
  actions?: ReactNode;
  /** Aviso que se muestra bajo el encabezado (por ejemplo, datos de ejemplo). */
  banner?: ReactNode;
  children: ReactNode;
}

export function Layout({ title, route, nav, back, actions, banner, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl md:max-w-3xl flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-slate-50/90 px-2 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        {back ? (
          <a href={routeHref(back)} className={iconButton} aria-label="Volver">
            <IconBack />
          </a>
        ) : (
          <span className="w-2" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{title}</h1>
        {actions}
      </header>
      {banner}

      <main id="contenido" tabIndex={-1} className="flex-1 px-4 pb-28 pt-4 outline-none">
        {children}
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      >
        <ul className="mx-auto flex max-w-xl md:max-w-3xl">
          {nav.map((item) => {
            const active = item.matches.includes(route.name);
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex-1">
                <a
                  href={routeHref(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                    active
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
