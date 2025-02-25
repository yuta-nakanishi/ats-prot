'use client';

import React, { createContext, useContext } from 'react';
import { jobPostingsApi, candidatesApi, authApi, interviewsApi, evaluationsApi } from '@/lib/api';

interface ApiContextType {
  jobPostingsApi: typeof jobPostingsApi;
  candidatesApi: typeof candidatesApi;
  authApi: typeof authApi;
  interviewsApi: typeof interviewsApi;
  evaluationsApi: typeof evaluationsApi;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApiContext.Provider 
      value={{ 
        jobPostingsApi, 
        candidatesApi, 
        authApi, 
        interviewsApi, 
        evaluationsApi 
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
} 