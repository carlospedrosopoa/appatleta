// components/DateInput.tsx - Componente de input de data que permite digitar e usar seletor nativo
'use client';

import { useState, useEffect, useRef } from 'react';

interface DateInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
}

export default function DateInput({
  name,
  value,
  onChange,
  className = '',
  required = false,
  disabled = false,
  placeholder = 'DD/MM/AAAA',
  min,
  max,
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Converter valor ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
  const formatToBrazilian = (isoDate: string): string => {
    if (!isoDate || isoDate.length !== 10) return '';
    const [year, month, day] = isoDate.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return '';
  };

  // Converter formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
  const formatToISO = (brazilianDate: string): string => {
    // Remove caracteres não numéricos
    const numbers = brazilianDate.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    // Limita a 8 dígitos (DDMMYYYY)
    const limited = numbers.slice(0, 8);
    
    if (limited.length < 8) {
      return '';
    }
    
    // Formata como DD/MM/YYYY
    const day = limited.slice(0, 2);
    const month = limited.slice(2, 4);
    const year = limited.slice(4, 8);
    
    // Validação básica
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
      return '';
    }
    
    // Retorna no formato ISO
    return `${year}-${month}-${day}`;
  };

  // Atualizar displayValue quando value mudar externamente
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatToBrazilian(value));
    }
  }, [value, isFocused]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permite apenas números e barras
    const cleaned = inputValue.replace(/[^\d/]/g, '');
    
    // Adiciona barras automaticamente
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned[2] !== '/') {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (formatted.length > 5 && formatted[5] !== '/') {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    
    // Limita o tamanho
    if (formatted.length > 10) {
      formatted = formatted.slice(0, 10);
    }
    
    setDisplayValue(formatted);
    
    // Converter para ISO e chamar onChange
    const isoDate = formatToISO(formatted);
    if (isoDate.length === 10) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: isoDate,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else if (formatted.length === 0) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleTextFocus = () => {
    setIsFocused(true);
  };

  const handleTextBlur = () => {
    setIsFocused(false);
    // Garantir que o valor está formatado corretamente
    if (value) {
      setDisplayValue(formatToBrazilian(value));
    } else {
      setDisplayValue('');
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current && !disabled) {
      dateInputRef.current.showPicker?.();
    }
  };

  return (
    <div className="relative">
      {/* Input de texto para digitação (sempre visível) */}
      <input
        ref={textInputRef}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onFocus={handleTextFocus}
        onBlur={handleTextBlur}
        placeholder={placeholder}
        className={`${className} pr-10`}
        required={required}
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9/]*"
      />
      
      {/* Input nativo de data (oculto, mas funcional para abrir seletor) */}
      <input
        ref={dateInputRef}
        type="date"
        name={name}
        value={value}
        onChange={handleDateChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      />
      
      {/* Ícone de calendário clicável para abrir seletor nativo */}
      <button
        type="button"
        onClick={handleCalendarClick}
        disabled={disabled}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-auto z-10 bg-transparent border-0 p-0 cursor-pointer"
        tabIndex={-1}
        aria-label="Abrir seletor de data"
      >
        <svg
          className="w-5 h-5 text-gray-400 hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}

