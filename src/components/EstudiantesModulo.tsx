/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Estudiante, InformeEstudiante, EstadoInforme } from '../types';
import { 
  UserPlus, 
  FilePlus, 
  Search, 
  GraduationCap, 
  BookOpen, 
  Calendar as CalendarIcon,
  Trash2,
  Edit3,
  User,
  Heart,
  MessageSquare,
  AlertCircle,
  FileText,
  ListFilter,
  Download
} from 'lucide-react';
import { generateStudentReportPDF } from '../utils/pdfGenerator';
import ConfirmModal from './ConfirmModal';

interface EstudiantesModuloProps {
  estudiantes: Estudiante[];
  informesEstudiantes: InformeEstudiante[];
  selectedDate: string;
  onAddEstudiante: (nombre: string, grado: string) => void;
  onAddInformeEstudiante: (estudianteId: string, fecha: string, avance: string, estado: EstadoInforme) => void;
  onDeleteEstudiante: (id: string) => void;
  onDeleteInformeEstudiante: (id: string) => void;
  onEditInformeEstudiante: (informe: InformeEstudiante) => void;
}

export default function EstudiantesModulo({
  estudiantes,
  informesEstudiantes,
  selectedDate,
  onAddEstudiante,
  onAddInformeEstudiante,
  onDeleteEstudiante,
  onDeleteInformeEstudiante,
  onEditInformeEstudiante
}: EstudiantesModuloProps) {
  // New student form state
  const [newNombre, setNewNombre] = useState('');
  const [newGrado, setNewGrado] = useState('1°');

  // New report form state
  const [repEstudianteId, setRepEstudianteId] = useState('');
  const [repFecha, setRepFecha] = useState(selectedDate);
  const [repAvance, setRepAvance] = useState('');
  const [repEstado, setRepEstado] = useState<EstadoInforme>('bueno');

  // Search & Filter students
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('todos');

  // Currently viewed student details
  const [selectedEstId, setSelectedEstId] = useState<string | null>(null);

  // Student deletion custom modal confirmation
  const [studentToDelete, setStudentToDelete] = useState<Estudiante | null>(null);

  // Auto-fill form values when selectedDate changes
  React.useEffect(() => {
    setRepFecha(selectedDate);
  }, [selectedDate]);

  // Handle student creation
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    onAddEstudiante(newNombre.trim(), newGrado);
    setNewNombre('');
  };

  // Handle report creation
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repEstudianteId || !repAvance.trim() || !repFecha) return;
    onAddInformeEstudiante(repEstudianteId, repFecha, repAvance.trim(), repEstado);
    setRepAvance('');
  };

  // Filtered students list
  const filteredEstudiantes = estudiantes.filter(est => {
    const matchesSearch = est.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrado = filterGrado === 'todos' || est.grado === filterGrado;
    return matchesSearch && matchesGrado;
  });

  // Get unique list of grades for filter dropdown
  const listadoGradosUnicos = Array.from(new Set(estudiantes.map(e => e.grado)));

  // Resolve selected student reports
  const activeStudent = estudiantes.find(e => e.id === selectedEstId);
  const activeStudentReports = informesEstudiantes
    .filter(r => r.estudianteId === selectedEstId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // descending by date

  // Quick stats for selected student
  const totalReports = activeStudentReports.length;
  const excellentReports = activeStudentReports.filter(r => r.estado === 'excelente').length;
  const attentionReports = activeStudentReports.filter(r => r.estado === 'atencion_requerida').length;

  return (
    <div className="space-y-8" id="estudiantes-modulo-wrapper">
      
      {/* 2-Column Grid: Form Actions (Left) and Student Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Create Student & Create Report Forms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Registrar Estudiante */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="form-registrar-estudiante">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Registrar Nuevo Estudiante
            </h3>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Martínez"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  id="input-student-name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Grado / Curso
                </label>
                <select
                  value={newGrado}
                  onChange={(e) => setNewGrado(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  id="select-student-grade"
                >
                  <option value="1°">1° Grado</option>
                  <option value="2°">2° Grado</option>
                  <option value="3°">3° Grado</option>
                  <option value="4°">4° Grado</option>
                  <option value="5°">5° Grado</option>
                  <option value="6°">6° Grado</option>
                  <option value="7°">7° Grado</option>
                  <option value="8°">8° Grado</option>
                  <option value="9°">9° Grado</option>
                  <option value="10°">10° Grado</option>
                  <option value="11°">11° Grado</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                id="btn-submit-student"
              >
                <UserPlus className="w-4 h-4" />
                Registrar Estudiante
              </button>
            </form>
          </div>

          {/* Card: Redactar Informe */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="form-redactar-informe-est">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FilePlus className="w-5 h-5 text-indigo-600" />
              Redactar Informe de Avance
            </h3>

            {estudiantes.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Debe registrar al menos un estudiante antes de poder crear un informe de avance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Seleccionar Estudiante
                  </label>
                  <select
                    required
                    value={repEstudianteId}
                    onChange={(e) => setRepEstudianteId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    id="select-report-student"
                  >
                    <option value="">-- Seleccionar alumno --</option>
                    {estudiantes.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nombre} ({est.grado})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Fecha del Informe
                    </label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={repFecha}
                        onChange={(e) => setRepFecha(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                        id="input-report-date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Estado / Progreso
                    </label>
                    <select
                      value={repEstado}
                      onChange={(e) => setRepEstado(e.target.value as EstadoInforme)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition font-medium text-slate-700"
                      id="select-report-status"
                    >
                      <option value="excelente">🟢 Excelente</option>
                      <option value="bueno">🔵 Adecuado</option>
                      <option value="regular">🟡 Regular</option>
                      <option value="atencion_requerida">🔴 Atención Req.</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Descripción del Avance o Informe
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Escriba los logros observados, conducta, dificultades superadas o temas cubiertos hoy..."
                    value={repAvance}
                    onChange={(e) => setRepAvance(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none leading-relaxed"
                    id="textarea-report-content"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                  id="btn-submit-report-est"
                >
                  <FilePlus className="w-4 h-4" />
                  Guardar Informe de Avance
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Side: Student Directory List & Student File Timeline */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Directorio de Estudiantes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="student-directory-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Directorio de Estudiantes ({estudiantes.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona un estudiante para visualizar su historial completo de informes.
                </p>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    id="search-students-directory"
                  />
                </div>

                {/* Grade selector */}
                <div className="relative">
                  <select
                    value={filterGrado}
                    onChange={(e) => setFilterGrado(e.target.value)}
                    className="pl-2.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition font-semibold text-slate-600 appearance-none cursor-pointer"
                    id="filter-students-grade"
                  >
                    <option value="todos">Todos los Grados</option>
                    {listadoGradosUnicos.map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                  </select>
                  <ListFilter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Students List Grid */}
            {filteredEstudiantes.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium">No se encontraron estudiantes</p>
                <p className="text-xs text-slate-400 mt-0.5">Registra uno nuevo en el panel de la izquierda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {filteredEstudiantes.map((est) => {
                  const isSelected = selectedEstId === est.id;
                  const countReps = informesEstudiantes.filter(r => r.estudianteId === est.id).length;
                  
                  return (
                    <div
                      key={est.id}
                      onClick={() => setSelectedEstId(isSelected ? null : est.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/10'
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                      id={`student-card-${est.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {est.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {est.nombre}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {est.grado}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
                          {countReps} inf.
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToDelete(est);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition"
                          title="Eliminar Estudiante"
                          id={`del-student-btn-${est.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Historial Clínico/Pedagógico del Estudiante Seleccionado */}
          {selectedEstId && activeStudent && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 animate-fade-in" id="student-history-timeline">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-extrabold text-base shadow">
                    {activeStudent.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        Expediente: {activeStudent.nombre}
                      </h3>
                      <button
                        onClick={() => generateStudentReportPDF(activeStudent, activeStudentReports)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                        title="Descargar informe completo en PDF"
                        id={`download-pdf-btn-${activeStudent.id}`}
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {activeStudent.grado} • Registrado el {new Date(activeStudent.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-center">
                    <span className="block text-xs text-slate-400">Total Informes</span>
                    <span className="font-mono text-sm font-bold text-slate-100">{totalReports}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-center">
                    <span className="block text-xs text-slate-400">Excelente</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{excellentReports}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-center">
                    <span className="block text-xs text-slate-400">Con Alerta</span>
                    <span className="font-mono text-sm font-bold text-rose-400">{attentionReports}</span>
                  </div>
                </div>
              </div>

              {/* History Timeline of reports */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Línea de Tiempo de Avances
                </h4>

                {activeStudentReports.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-medium">No hay informes de avance registrados para este alumno</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Usa el formulario superior para crear el primero.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 pl-4 ml-2.5 space-y-6">
                    {activeStudentReports.map((rep) => {
                      // Ratings
                      let badgeColor = "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
                      let statusText = "Adecuado";
                      if (rep.estado === 'excelente') {
                        badgeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
                        statusText = "Excelente";
                      } else if (rep.estado === 'regular') {
                        badgeColor = "bg-slate-500/20 text-slate-300 border-slate-500/10";
                        statusText = "Regular";
                      } else if (rep.estado === 'atencion_requerida') {
                        badgeColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                        statusText = "Alerta / Crítico";
                      }

                      return (
                        <div key={rep.id} className="relative group" id={`timeline-item-${rep.id}`}>
                          {/* Timeline Dot Indicator */}
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            rep.estado === 'excelente' ? 'bg-emerald-500' : rep.estado === 'atencion_requerida' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`} />

                          <div className="bg-slate-800/50 border border-slate-800/80 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                                {new Date(rep.fecha).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                  {statusText}
                                </span>
                                
                                <button
                                  onClick={() => onEditInformeEstudiante(rep)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                  title="Editar"
                                  id={`edit-rep-timeline-${rep.id}`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteInformeEstudiante(rep.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                  title="Eliminar"
                                  id={`del-rep-timeline-${rep.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                              {rep.avance}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
      
      {/* Custom deletion confirmation modal */}
      <ConfirmModal
        isOpen={studentToDelete !== null}
        title="¿Eliminar Estudiante?"
        message={studentToDelete ? `¿Estás completamente segura de eliminar a ${studentToDelete.nombre}? \n\nEsta acción es irreversible y borrará de manera permanente su expediente clínico con todos sus ${informesEstudiantes.filter(r => r.estudianteId === studentToDelete.id).length} informes de avance registrados.` : ''}
        confirmText="Sí, Eliminar de inmediato"
        cancelText="No, Mantener Expediente"
        isDestructive={true}
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteEstudiante(studentToDelete.id);
            if (selectedEstId === studentToDelete.id) {
              setSelectedEstId(null);
            }
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
