// app/app/atleta/dashboard/page.tsx - Dashboard do atleta
'use client';

export default function AtletaDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas estatísticas</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">
            Dashboard em desenvolvimento. Em breve você verá:
          </p>
          <ul className="mt-4 text-left text-gray-600 space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-blue-600">•</span>
              Total de agendamentos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600">•</span>
              Total de jogos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600">•</span>
              Estatísticas de desempenho
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600">•</span>
              E muito mais...
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

