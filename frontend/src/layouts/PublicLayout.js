import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isPublic={true} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;