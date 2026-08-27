/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, GraduationCap, AlertCircle, ShieldCheck } from 'lucide-react';

interface PinScreenProps {
  onUnlock: () => void;
  correctPin: string;
}

export default function PinScreen({ onUnlock, correctPin }: PinScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on mount and keep focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const keepFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('click', keepFocus);
    return () => {
      document.removeEventListener('click', keepFocus);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setError(null);
    setPin(value);
  };

  const handleSubmit = (currentPin: string) => {
    if (currentPin === correctPin) {
      onUnlock();
    } else {
      setError('PIN Incorrecto. Verifique el código e intente de nuevo.');
      setIsShaking(true);
      setPin('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Auto-submit when length reaches 4
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        handleSubmit(pin);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin, correctPin]);

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4" 
      id="pin-screen-container"
      onClick={() => inputRef.current?.focus()}
    >
      
      {/* Hidden input to capture numeric input elegantly on desktop and mobile */}
      <input
        ref={inputRef}
        type="password"
        value={pin}
        onChange={handleInputChange}
        maxLength={4}
        pattern="[0-9]*"
        inputMode="numeric"
        className="absolute opacity-0 w-1 h-1 pointer-events-none"
        autoComplete="one-time-code"
        autoFocus
      />

      {/* Container Card */}
      <div 
        className={`bg-white border border-slate-100 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transition-all ${
          isShaking ? 'animate-bounce border-rose-500' : ''
        }`}
        id="pin-card"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          animation: isShaking ? 'shake 0.42s ease-in-out' : 'none'
        }}
      >
        {/* Style tag for custom shake keyframes */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            15%, 45%, 75% { transform: translateX(-8px); }
            30%, 60%, 90% { transform: translateX(8px); }
          }
        `}</style>

        {/* Clinical / School Psychologist App Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Bitácora Psicóloga Milena
          </h1>
          <p className="text-xs text-indigo-600 font-bold mt-1.5 uppercase tracking-wider">
            Portal Psicopedagógico del Colegio
          </p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
          Esta plataforma contiene expedientes clínicos, reportes de conducta e informes confidenciales de los estudiantes.
          <span className="block font-semibold text-slate-700 mt-2">Por favor, escriba el PIN de acceso de 4 dígitos.</span>
        </p>

        {/* PIN Indicators boxes (minimalist & interactive) */}
        <div className="flex justify-center gap-3 mb-6" id="pin-indicators">
          {[0, 1, 2, 3].map((index) => {
            const hasValue = pin.length > index;
            const isCurrent = pin.length === index;
            return (
              <div
                key={index}
                className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-150 ${
                  hasValue
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 scale-105 shadow-sm'
                    : isCurrent
                    ? 'border-indigo-400 bg-slate-50 text-slate-300 ring-4 ring-indigo-100'
                    : 'border-slate-200 bg-slate-50 text-slate-300'
                }`}
              >
                {hasValue ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Error / Instruction Message */}
        {error ? (
          <div className="flex items-center justify-center gap-1.5 p-3 mb-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="h-10 mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ingrese el código usando su teclado físico</span>
          </div>
        )}

        {/* Extra help footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Acceso exclusivo autorizado • Datos protegidos por la Ley de Privacidad</span>
        </div>

      </div>
    </div>
  );
}
