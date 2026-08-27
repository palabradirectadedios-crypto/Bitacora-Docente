/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InformeExtra, Estudiante, CategoriaExtra } from '../types';
import { 
  Plus, 
  AlertTriangle, 
  Users, 
  Search, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3,
  FileText,
  Bookmark,
  ShieldAlert,
  SlidersHorizontal,
  BellRing,
  Download
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { generateExtraReportPDF } from '../utils/pdfGenerator';

interface ExtraModuloProps {
  estudiantes: Estudiante[];
  informesExtra: InformeExtra[];
  selectedDate: string;
  onAddInformeExtra: (titulo: string, fecha: string, descripcion: string, categoria: CategoriaExtra, participantesIds: string[]) => void;
  onDeleteInformeExtra: (id: string) => void;
  onEditInformeExtra: (informe: InformeExtra) => void;
}

export default function ExtraModulo({
  estudiantes,
  informesExtra,
  selectedDate,
  onAddInformeExtra,
  onDeleteInformeExtra,
  onEditInformeExtra
}: ExtraModuloProps) {
  // Form State
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(selectedDate);
  const [categoria, setCategoria] = useState<CategoriaExtra>('imprevisto');
  const [descripcion, setDescripcion] = useState('');
  const [participantes, setParticipantes] = useState<string[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  // Deletion confirmation state
  const [reportToDelete, setReportToDelete] = useState<InformeExtra | null>(null);

  // Auto-fill form values when selectedDate changes
  React.useEffect(() => {
    setFecha(selectedDate);
  }, [selectedDate]);

  // Handle participant toggles
  const handleToggleParticipant = (estId: string) => {
    setParticipantes(prev => 
      prev.includes(estId) 
        ? prev.filter(id => id !== estId) 
        : [...prev, estId]
    );
  };

  // Submit action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !fecha) return;
    onAddInformeExtra(titulo.trim(), fecha, descripcion.trim(), categoria, participantes);
    
    // Reset form
    setTitulo('');
    setDescripcion('');
    setParticipantes([]);
  };

  // Filtered Extra reports
  const filteredExtraReports = informesExtra.filter(rep => {
    const matchesSearch = rep.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rep.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'todos' || rep.categoria === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Resolve student name
  const getStudentName = (id: string) => {
    const est = estudiantes.find(e => e.id === id);
    return est ? est.nombre : "Estudiante eliminado";
  };

  return (
    <div className="space-y-8" id="extra-modulo-wrapper">
      
      {/* Overview header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-md">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BellRing className="w-5 h-5 animate-swing" />
            Módulo Extra: Informes de Situaciones e Imprevistos
          </h2>
          <p className="text-xs text-amber-50 leading-relaxed mt-1">
            Espacio diseñado para documentar de forma estructurada cualquier acontecimiento fortuito, talleres especiales, reuniones docentes, accidentes de patio o eventos no tradicionales. Te permite asociar uno o varios de tus pacientes/estudiantes previamente registrados si participaron en dicho acontecimiento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Create Extra Report Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit" id="form-crear-informe-extra">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-amber-600" />
            Registrar Situación Extra
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Título del Evento / Situación
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Taller de pintura libre, Caída accidental"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                id="input-extra-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Fecha del Evento
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    id="input-extra-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaExtra)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition font-medium text-slate-700"
                  id="select-extra-category"
                >
                  <option value="imprevisto">⚠️ Imprevisto</option>
                  <option value="reunion">👥 Reunión</option>
                  <option value="observacion">📝 Observación Gral</option>
                  <option value="urgencia">🚨 Urgencia</option>
                  <option value="actividad">🎨 Actividad Especial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Descripción Detallada
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describa a detalle lo sucedido, acciones tomadas y soluciones planteadas..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition resize-none leading-relaxed"
                id="textarea-extra-description"
              />
            </div>

            {/* Checklist of students/patients to associate */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Alumnos/Pacientes Participantes (Opcional)
              </label>
              {estudiantes.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  No hay estudiantes registrados. Puedes agregarlos después desde el módulo de Estudiantes.
                </p>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[150px] overflow-y-auto space-y-2">
                  <p className="text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-wider">
                    Marque los alumnos involucrados:
                  </p>
                  {estudiantes.map(est => {
                    const isChecked = participantes.includes(est.id);
                    return (
                      <label 
                        key={est.id} 
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs font-medium ${
                          isChecked ? 'bg-amber-50 border border-amber-200/50 text-amber-900' : 'hover:bg-slate-100 border border-transparent'
                        }`}
                        id={`label-part-${est.id}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleParticipant(est.id)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="min-w-0">
                          <span className="block font-bold truncate">{est.nombre}</span>
                          <span className="block text-[9px] text-slate-400 font-medium truncate">{est.grado}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              id="btn-submit-report-extra"
            >
              <Plus className="w-4 h-4" />
              Guardar Situación Extra
            </button>
          </form>
        </div>

        {/* Right Side: List & Search for Extra reports */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[480px]" id="list-informes-extra">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Archivo de Situaciones Registradas ({filteredExtraReports.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Visualiza los sucesos, incidentes o actividades adicionales.
                </p>
              </div>

              {/* Filtering & Search row */}
              <div className="flex flex-wrap gap-2">
                {/* Search text */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar evento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    id="search-extra-reports"
                  />
                </div>

                {/* Filter Category selector */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-2.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition font-semibold text-slate-600 appearance-none cursor-pointer"
                    id="filter-extra-category"
                  >
                    <option value="todos">Todas las categorías</option>
                    <option value="imprevisto">⚠️ Imprevistos</option>
                    <option value="reunion">👥 Reuniones</option>
                    <option value="observacion">📝 Observación Gral</option>
                    <option value="urgencia">🚨 Urgencias</option>
                    <option value="actividad">🎨 Actividades</option>
                  </select>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List area */}
            {filteredExtraReports.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold">No se encontraron informes extra</p>
                <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                  Cambia los filtros de búsqueda o rellena el formulario de la izquierda para ingresar un reporte de situación imprevista.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredExtraReports.map((rep) => {
                  // Category Styling helper
                  let catBadge = "bg-amber-50 text-amber-700 border-amber-100";
                  let catName = "Imprevisto";
                  if (rep.categoria === 'reunion') {
                    catBadge = "bg-purple-50 text-purple-700 border-purple-100";
                    catName = "Reunión";
                  } else if (rep.categoria === 'observacion') {
                    catBadge = "bg-blue-50 text-blue-700 border-blue-100";
                    catName = "Observación Gral";
                  } else if (rep.categoria === 'urgencia') {
                    catBadge = "bg-rose-50 text-rose-700 border-rose-100 font-extrabold animate-pulse";
                    catName = "Urgencia / Alerta";
                  } else if (rep.categoria === 'actividad') {
                    catBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    catName = "Actividad Especial";
                  }

                  return (
                    <div 
                      key={rep.id} 
                      className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 hover:shadow-sm hover:border-slate-300 hover:bg-slate-50 transition flex flex-col justify-between"
                      id={`extra-card-${rep.id}`}
                    >
                      <div>
                        {/* Card Header details */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catBadge}`}>
                              {catName}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm md:text-base mt-2">
                              {rep.titulo}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="w-3 h-3 text-indigo-500" />
                              {new Date(rep.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => generateExtraReportPDF(rep, estudiantes)}
                              className="p-1.5 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition text-slate-400 cursor-pointer"
                              title="Descargar Informe de Situación en PDF"
                              id={`pdf-extra-card-btn-${rep.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditInformeExtra(rep)}
                              className="p-1.5 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition text-slate-400 cursor-pointer"
                              title="Editar"
                              id={`edit-extra-card-btn-${rep.id}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReportToDelete(rep);
                              }}
                              className="p-1.5 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition text-slate-400 cursor-pointer"
                              title="Eliminar"
                              id={`del-extra-card-btn-${rep.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description block */}
                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                          {rep.descripcion}
                        </p>

                        {/* Participants List section */}
                        {rep.participantesIds.length > 0 && (
                          <div className="mt-3.5 border-t border-dashed border-slate-200/80 pt-3">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1.5 tracking-wider">
                              Alumnos / Pacientes involucrados:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rep.participantesIds.map(partId => (
                                <span 
                                  key={partId} 
                                  className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1"
                                >
                                  <Users className="w-3 h-3 text-slate-400" />
                                  {getStudentName(partId)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={reportToDelete !== null}
        title="¿Eliminar Informe de Situación?"
        message={reportToDelete ? `¿Estás segura de eliminar permanentemente el reporte "${reportToDelete.titulo}"?` : ''}
        confirmText="Sí, Eliminar"
        cancelText="No, Conservar"
        isDestructive={true}
        onConfirm={() => {
          if (reportToDelete) {
            onDeleteInformeExtra(reportToDelete.id);
            setReportToDelete(null);
          }
        }}
        onCancel={() => setReportToDelete(null)}
      />
    </div>
  );
}
