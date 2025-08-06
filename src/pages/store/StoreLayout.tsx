import React from 'react';
import { Outlet } from 'react-router-dom';
import StoreHeader from '../../components/store/StoreHeader';
import StoreSidebar from '../../components/store/StoreSidebar';

const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />
      <div className="flex">
        <StoreSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreLayout; 