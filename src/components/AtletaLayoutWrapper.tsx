// components/AtletaLayoutWrapper.tsx - Wrapper client para layout do atleta
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AtletaLayout from '@/layouts/AtletaLayout';

export default function AtletaLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AtletaLayout>{children}</AtletaLayout>
    </ProtectedRoute>
  );
}


