'use client'

import { AppContextProvider } from '@/context/AppContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ClientWrapper({ children }) {
  const router = useRouter();
  
  return (
    <LanguageProvider>
      <Toaster />
      <AppContextProvider router={router}>
        {children}
      </AppContextProvider>
    </LanguageProvider>
  );
}