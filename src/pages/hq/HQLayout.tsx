import React from 'react';
import { Outlet } from 'react-router-dom';
import HQHeader from '../../components/hq/HQHeader';
import HQSidebar from '../../components/hq/HQSidebar';

const HQLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HQHeader />
      <div className="flex">
        <HQSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HQLayout; 