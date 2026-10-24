import { useEffect, useState } from 'react';

/** Rutas de la app. Se usa el hash de la URL para que funcione en GitHub Pages sin servidor. */
export type Route =
  | { name: 'today' }
  | { name: 'history' }
  | { name: 'stats' }
  | { name: 'tracker'; id: string }
  | { name: 'insights' }
  | { name: 'settings' }
  | { name: 'manage' };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split('/');
  switch (path[0]) {
    case 'historial':
      return { name: 'history' };
    case 'estadisticas':
      return { name: 'stats' };
    case 'rastreador':
      return path[1] ? { name: 'tracker', id: decodeURIComponent(path[1]) } : { name: 'stats' };
    case 'hallazgos':
      return { name: 'insights' };
    case 'ajustes':
      return { name: 'settings' };
    case 'rastreadores':
      return { name: 'manage' };
    default:
      return { name: 'today' };
  }
}

export function routeHref(route: Route): string {
  switch (route.name) {
    case 'today':
      return '#/';
    case 'history':
      return '#/historial';
    case 'stats':
      return '#/estadisticas';
    case 'tracker':
      return `#/rastreador/${encodeURIComponent(route.id)}`;
    case 'insights':
      return '#/hallazgos';
    case 'settings':
      return '#/ajustes';
    case 'manage':
      return '#/rastreadores';
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeHref(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo?.({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
