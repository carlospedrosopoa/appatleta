// components/ConfirmarCancelamentoRecorrenteModal.tsx - Modal para confirmar cancelamento de agendamento
'use client';

import { Dialog } from '@headlessui/react';
import { AlertTriangle, Calendar } from 'lucide-react';
import type { Agendamento } from '@/types/agendamento';

interface ConfirmarCancelamentoRecorrenteModalProps {
  isOpen: boolean;
  agendamento: Agendamento | null;
  onClose: () => void;
  onConfirmar: () => void;
}

export default function ConfirmarCancelamentoRecorrenteModal({
  isOpen,
  agendamento,
  onClose,
  onConfirmar,
}: ConfirmarCancelamentoRecorrenteModalProps) {
  if (!agendamento) return null;

  const dataHora = new Date(agendamento.dataHora);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                Cancelar Agendamento
              </Dialog.Title>
              <p className="text-sm text-gray-600">
                Tem certeza que deseja cancelar este agendamento?
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Data e Hora</span>
            </div>
            <p className="text-sm text-gray-900">
              {dataHora.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' às '}
              {dataHora.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {agendamento.quadra && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Quadra:</span> {agendamento.quadra.nome}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800 font-medium transition-colors"
            >
              Não, manter agendamento
            </button>
            <button
              onClick={onConfirmar}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Sim, cancelar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

