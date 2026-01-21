'use client';

import { AppContextProvider } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ClientWrapper({ children }) {
  const router = useRouter();
  
  return (
    <>
      <Toaster />
      <AppContextProvider router={router}>
        {children}
      </AppContextProvider>
    </>
  );
}