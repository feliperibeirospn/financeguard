import { createHashRouter } from 'react-router-dom';
import App from '../../App';
import { DashboardPage } from '../pages/dashboard/Dashboard';
import { ExtratoPage } from '../pages/extrato/Extrato';
import { AdminPage } from '../pages/admin/Admin';
import { InspectorSQLitePage } from '../pages/inspector-sqlite/InspectorSQLite';
import { CleanArchLogsPage } from '../pages/clean-arch-logs/CleanArchLogs';

// Usamos HashRouter para compatibilidade máxima com PWA e Capacitor
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'extrato',
        element: <ExtratoPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'sqlite',
        element: <InspectorSQLitePage />,
      },
      {
        path: 'logs',
        element: <CleanArchLogsPage />,
      },
    ],
  },
]);
