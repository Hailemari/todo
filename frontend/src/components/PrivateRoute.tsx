import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;