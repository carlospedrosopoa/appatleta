// app/app/atleta/layout.tsx - Layout da área do atleta (Server Component)
import AtletaLayoutWrapper from '@/components/AtletaLayoutWrapper';

export default function AtletaAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AtletaLayoutWrapper>{children}</AtletaLayoutWrapper>;
}

