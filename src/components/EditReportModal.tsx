/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InformeEstudiante, InformeExtra, Estudiante, EstadoInforme, CategoriaExtra } from '../types';
import { X, Save, FileText, Calendar, Users, AlertCircle } from 'lucide-react';

interface EditReportModalProps {
  estudiantes: Estudiante[];
  editingStudentReport: InformeEstudiante | null;
  editingExtraReport: InformeExtra | null;
  onClose: () => void;
  onSaveStudentReport: (id: string, updated: Partial<InformeEstudiante>) => void;
  onSaveExtraReport: (id: string, updated: Partial<InformeExtra>) => void;
}

export default function EditReportModal({
  estudiantes,
  editingStudentReport,
  editingExtraReport,
  onClose,
  onSaveStudentReport,
  onSaveExtraReport
}: EditReportModalProps) {
  // Common states
  const [fecha, setFecha] = useState('');
  
  // Student report states
  const [avance, setAvance] = useState('');
  const [estado, setEstado] = useState<EstadoInforme>('bueno');
  
  // Extra report states
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaExtra>('imprevisto');
  const [descripcion, setDescripcion] = useState('');
  const [participantesIds, setParticipantesIds] = useState<string[]>([]);

  // Initialize values when modal opens
  useEffect(() => {
    if (editingStudentReport) {
      setFecha(editingStudentReport.fecha);
      setAvance(editingStudentReport.avance);
      setEstado(editingStudentReport.estado);
    } else if (editingExtraReport) {
      setFecha(editingExtraReport.fecha);
      setTitulo(editingExtraReport.titulo);
      setCategoria(editingExtraReport.categoria);
      setDescripcion(editingExtraReport.descripcion);
      setParticipantesIds(editingExtraReport.participantesIds || []);
    }
  }, [editingStudentReport, editingExtraReport]);

  const handleToggleParticipant = (id: string) => {
    setParticipantesIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentReport) {
      onSaveStudentReport(editingStudentReport.id, {
        fecha,
        avance: avance.trim(),
        estado
      });
    } else if (editingExtraReport) {
      onSaveExtraReport(editingExtraReport.id, {
        fecha,
        titulo: titulo.trim(),
        categoria,
        descripcion: descripcion.trim(),
        participantesIds
      });
    }
    onClose();
  };

  const isStudent = !!editingStudentReport;
  const isExtra = !!editingExtraReport;

  if (!isStudent && !isExtra) return null;

  // Find student name if editing student report
  const activeStudentName = isStudent 
    ? (estudiantes.find(e => e.id === editingStudentReport.estudianteId)?.nombre || "Estudiante")
    : "";

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      id="edit-report-modal-overlay"
    >
      <div 
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-up"
        id="edit-report-modal-container"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm md:text-base">
                Editar {isStudent ? 'Informe de Avance' : 'Informe Extra'}
              </h3>
              {isStudent && (
                <p className="text-[11px] text-slate-300 font-medium">
                  Modificando reporte para: {activeStudentName}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition"
            title="Cerrar modal"
            id="close-edit-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* If editing Extra report - Title field */}
          {isExtra && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Título del Evento
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                id="edit-extra-title-input"
              />
            </div>
          )}

          {/* Date & State/Category Split */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Fecha del Informe
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                id="edit-report-date-input"
              />
            </div>

            <div>
              {isStudent ? (
                <>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Estado / Progreso
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoInforme)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                    id="edit-student-status-select"
                  >
                    <option value="excelente">🟢 Excelente</option>
                    <option value="bueno">🔵 Adecuado</option>
                    <option value="regular">🟡 Regular</option>
                    <option value="atencion_requerida">🔴 Atención Req.</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaExtra)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                    id="edit-extra-category-select"
                  >
                    <option value="imprevisto">⚠️ Imprevisto</option>
                    <option value="reunion">👥 Reunión</option>
                    <option value="observacion">📝 Observación Gral</option>
                    <option value="urgencia">🚨 Urgencia</option>
                    <option value="actividad">🎨 Actividad Especial</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Description Content */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              {isStudent ? 'Detalles de Avance / Observación' : 'Descripción Detallada del Evento'}
            </label>
            <textarea
              required
              rows={5}
              value={isStudent ? avance : descripcion}
              onChange={(e) => isStudent ? setAvance(e.target.value) : setDescripcion(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none leading-relaxed"
              id="edit-report-content-textarea"
            />
          </div>

          {/* If editing Extra report - Participants Checklist */}
          {isExtra && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Alumnos / Pacientes involucrados
              </label>
              {estudiantes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay alumnos disponibles.</p>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[120px] overflow-y-auto space-y-1.5">
                  {estudiantes.map(est => {
                    const isChecked = participantesIds.includes(est.id);
                    return (
                      <label 
                        key={est.id} 
                        className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleParticipant(est.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0">
                          <span className="block font-bold text-slate-700 truncate">{est.nombre}</span>
                          <span className="block text-[9px] text-slate-400 truncate">{est.grado}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
              id="cancel-edit-modal-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              id="save-edit-modal-btn"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
