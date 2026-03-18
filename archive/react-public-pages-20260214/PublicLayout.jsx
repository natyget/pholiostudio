import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UniversalHeader from '../components/public/UniversalHeader';
import UniversalFooter from '../components/public/UniversalFooter';

export default function PublicLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="page-shell">
      <UniversalHeader />
      <main id="main" className="page-main main">
        <Outlet />
      </main>
      <UniversalFooter />
    </div>
  );
}
