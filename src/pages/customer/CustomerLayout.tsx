import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav';

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <main className="pb-20">
        <Outlet />
      </main>
      <CustomerBottomNav />
    </div>
  );
};

export default CustomerLayout; 