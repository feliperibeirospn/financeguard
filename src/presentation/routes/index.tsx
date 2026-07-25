import { createHashRouter } from 'react-router-dom';
import App from '../../App';
import { DashboardPage } from '../pages/dashboard/Dashboard';
import { ExtratoPage } from '../pages/extrato/Extrato';
import { AdminPage } from '../pages/admin/Admin';

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
    ],
  },
]);
