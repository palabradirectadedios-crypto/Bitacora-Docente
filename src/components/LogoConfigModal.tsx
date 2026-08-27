/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { 
  getActiveHeaderInfo, 
  saveCustomHeaderImage, 
  removeCustomHeaderImage, 
  HeaderImageInfo 
} from '../utils/logoStorage';
import { generateSampleTestPDF } from '../utils/pdfGenerator';

interface LogoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoConfigModal({ isOpen, onClose }: LogoConfigModalProps) {
  const [headerInfo, setHeaderInfo] = useState<HeaderImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load active header info whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      loadCurrentHeader();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const loadCurrentHeader = async () => {
    try {
      const info = await getActiveHeaderInfo();
      setHeaderInfo(info);
    } catch (e) {
      console.error('Error loading header info:', e);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG o WebP).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const newInfo = await saveCustomHeaderImage(file);
      setHeaderInfo(newInfo);
      setSuccessMsg('¡Logo y encabezado institucional guardado con éxito! Se aplicará automáticamente a todos los informes PDF.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al procesar y guardar la imagen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleResetToDefault = async () => {
    removeCustomHeaderImage();
    await loadCurrentHeader();
    setSuccessMsg('Se ha restablecido el encabezado oficial predeterminado.');
    setErrorMsg(null);
  };

  const handleTestDownload = async () => {
    setIsGeneratingTest(true);
    try {
      await generateSampleTestPDF();
      setSuccessMsg('PDF de prueba generado. Revisa cómo se visualiza el encabezado en tu visor de documentos.');
    } catch (e) {
      setErrorMsg('No se pudo generar el PDF de prueba.');
    } finally {
      setIsGeneratingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="logo-config-modal"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Encabezado y Logo Institucional
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Personaliza la imagen o escudo que encabeza cada hoja de los informes PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            id="close-logo-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Notifications */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Current Active Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Vista Previa del Encabezado Actual en PDF
              </label>

              {headerInfo?.isCustom ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <FileCheck className="w-3 h-3" /> Logo Personalizado Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Encabezado Oficial por Defecto
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-xl flex flex-col items-center justify-center relative min-h-[110px] overflow-hidden group">
              {headerInfo?.dataUrl ? (
                <div className="w-full max-w-lg flex flex-col items-center">
                  <img
                    src={headerInfo.dataUrl}
                    alt="Encabezado institucional"
                    className="max-h-24 max-w-full object-contain rounded drop-shadow-xs bg-white p-1 border border-slate-200/60"
                  />
                  {/* Decorative Golden Accent Line simulating PDF output */}
                  <div className="w-full h-0.5 bg-[#D4AF37] mt-2 rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                  <span>Cargando encabezado...</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subir Nueva Imagen / Escudo Institucional
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-indigo-50/20'
              }`}
              id="logo-dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
                id="logo-file-input"
              />

              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-indigo-600">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {isLoading ? 'Optimizando y guardando...' : 'Haz clic para seleccionar o arrastra aquí tu imagen'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Soporta imágenes PNG, JPG, JPEG, WebP o SVG (Recomendado: fondo transparente o blanco)
                </p>
              </div>
            </div>
          </div>

          {/* Practical Tips */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Consejo:</span> Puedes cargar el banner horizontal completo de tu colegio con el texto ya incluido, o solo el escudo/logo. El sistema adaptará las proporciones automáticamente para que se imprima nítido en alta resolución.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {headerInfo?.isCustom && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                title="Quitar logo personalizado y volver al original"
                id="btn-reset-logo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer Original
              </button>
            )}

            <button
              type="button"
              onClick={handleTestDownload}
              disabled={isGeneratingTest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Descargar un PDF de demostración para verificar el encabezado"
              id="btn-test-pdf"
            >
              {isGeneratingTest ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Descargar PDF de Prueba</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow transition cursor-pointer"
            id="btn-save-close-logo"
          >
            Listo / Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
