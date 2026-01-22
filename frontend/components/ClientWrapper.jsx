'use client'

import { AppContextProvider } from '@/context/AppContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function ClientWrapper({ children }) {
  const router = useRouter();
  
  return (
    <LanguageProvider>
      <AppContextProvider router={router}>
        {children}
      </AppContextProvider>
    </LanguageProvider>
  );
}