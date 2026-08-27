/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Estudiante, InformeEstudiante, InformeExtra } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  BookOpen, 
  AlertTriangle, 
  User, 
  Trash2, 
  Edit3,
  CheckCircle,
  FileText,
  Clock,
  Plus,
  Download
} from 'lucide-react';
import { generateStudentReportPDF, generateExtraReportPDF } from '../utils/pdfGenerator';

interface CalendarioModuloProps {
  estudiantes: Estudiante[];
  informesEstudiantes: InformeEstudiante[];
  informesExtra: InformeExtra[];
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  onDeleteInformeEstudiante: (id: string) => void;
  onDeleteInformeExtra: (id: string) => void;
  onEditInformeEstudiante: (informe: InformeEstudiante) => void;
  onEditInformeExtra: (informe: InformeExtra) => void;
  onSwitchTab: (tab: string) => void; // allow quick action to create reports
}

export default function CalendarioModulo({
  estudiantes,
  informesEstudiantes,
  informesExtra,
  selectedDate,
  setSelectedDate,
  onDeleteInformeEstudiante,
  onDeleteInformeExtra,
  onEditInformeEstudiante,
  onEditInformeExtra,
  onSwitchTab
}: CalendarioModuloProps) {
  // Current calendar month view state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Helper: Get number of days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get the first day of the month as day of week (0: Sun, 1: Mon, ..., 6: Sat)
  const getFirstDayOfMonth = (year: number, month: number) => {
    // We want Monday as index 0, so adjust Sun (0) to 6, Mon (1) to 0, etc.
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    const formattedToday = formatDateString(d);
    setSelectedDate(formattedToday);
  };

  // Format Date to YYYY-MM-DD with local timezone offset safety
  const formatDateString = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if a specific date has reports
  const getReportsForDate = (dateStr: string) => {
    const studentReps = informesEstudiantes.filter(r => r.fecha === dateStr);
    const extraReps = informesExtra.filter(r => r.fecha === dateStr);
    return {
      studentReps,
      extraReps,
      total: studentReps.length + extraReps.length
    };
  };

  // Render Calendar Grid cells
  const renderCalendarDays = () => {
    const cells = [];
    
    // Empty cells for padding before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12 bg-slate-50/50 border border-slate-100 rounded-lg"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dayString;
      const { studentReps, extraReps, total } = getReportsForDate(dayString);
      
      const isToday = 
        today.getDate() === day && 
        today.getMonth() === currentMonth && 
        today.getFullYear() === currentYear;

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => setSelectedDate(dayString)}
          id={`cal-day-${dayString}`}
          className={`h-14 p-1.5 border rounded-xl flex flex-col justify-between transition-all relative group ${
            isSelected
              ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/10 z-10'
              : isToday
              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 font-bold hover:bg-slate-50'
              : 'border-slate-100 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {/* Day Number */}
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isToday && !isSelected ? 'bg-emerald-500 text-white' : ''
          } ${
            isSelected ? 'text-indigo-900 bg-indigo-100' : 'text-slate-700'
          }`}>
            {day}
          </span>

          {/* Dots/Badges indicating reports */}
          {total > 0 && (
            <div className="flex gap-1 justify-center w-full mt-1">
              {studentReps.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" title={`${studentReps.length} Informe(s) Estudiante`} />
              )}
              {extraReps.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title={`${extraReps.length} Informe(s) Extra`} />
              )}
            </div>
          )}
        </button>
      );
    }

    return cells;
  };

  // Filtered lists for the active selected day
  const reportsOnSelectedDay = informesEstudiantes.filter(r => r.fecha === selectedDate);
  const extraOnSelectedDay = informesExtra.filter(r => r.fecha === selectedDate);
  const hasAnyReports = reportsOnSelectedDay.length > 0 || extraOnSelectedDay.length > 0;

  // Format selected date nicely for human reading
  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper to resolve student name from id
  const getStudentName = (id: string) => {
    const est = estudiantes.find(e => e.id === id);
    return est ? est.nombre : "Estudiante no registrado";
  };

  const getStudentGrade = (id: string) => {
    const est = estudiantes.find(e => e.id === id);
    return est ? est.grado : "";
  };

  return (
    <div className="space-y-6" id="calendario-modulo-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Monthly Calendar Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col" id="calendar-view-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Calendario de Informes
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 border border-slate-200 transition"
                title="Mes Anterior"
                id="btn-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="font-semibold text-sm text-slate-800 min-w-28 text-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
                {meses[currentMonth]} {currentYear}
              </span>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 border border-slate-200 transition"
                title="Siguiente Mes"
                id="btn-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoToToday}
                className="ml-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                id="btn-go-to-today"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {diasSemana.map((day, idx) => (
              <span key={idx} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {renderCalendarDays()}
          </div>

          {/* Legend indicator list */}
          <div className="border-t border-slate-100 pt-4 mt-6 flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span>Informes de Estudiantes (Avances)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Informes Extra (Imprevistos / Actividades)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Daily Agenda of Selected Date */}
        <div className="lg:col-span-5 flex flex-col space-y-4" id="agenda-selected-day-card">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                  Agenda del día seleccionado
                </span>
                <h3 className="text-base font-extrabold capitalize mt-1 text-slate-100">
                  {formatReadableDate(selectedDate)}
                </h3>
              </div>
              <div className="bg-white/10 text-white px-2.5 py-1 rounded-lg text-xs font-mono">
                {selectedDate}
              </div>
            </div>

            <div className="flex gap-4 mt-4 text-xs text-slate-300">
              <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex-1">
                <span className="block font-bold text-white text-lg">{reportsOnSelectedDay.length}</span>
                <span>Avances</span>
              </div>
              <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex-1">
                <span className="block font-bold text-white text-lg">{extraOnSelectedDay.length}</span>
                <span>Sit. Extra</span>
              </div>
            </div>
          </div>

          {/* List of reports */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Documentos del Día ({reportsOnSelectedDay.length + extraOnSelectedDay.length})
              </h4>

              {!hasAnyReports ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-medium">No se redactaron informes este día</p>
                  <p className="text-xs text-slate-400 max-w-[280px] mt-1 leading-relaxed">
                    Usa los módulos de Estudiantes o Extra para añadir tu primer reporte para esta fecha.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onSwitchTab('estudiantes')}
                      className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl border border-indigo-200 transition"
                      id="btn-quick-informe-est"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Informe Estudiante
                    </button>
                    <button
                      onClick={() => onSwitchTab('extra')}
                      className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 transition"
                      id="btn-quick-informe-ext"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Informe Extra
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Student reports */}
                  {reportsOnSelectedDay.map((rep) => {
                    // Status coloring
                    let badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                    let label = "Adecuado";
                    if (rep.estado === 'excelente') {
                      badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      label = "Excelente";
                    } else if (rep.estado === 'regular') {
                      badgeColor = "bg-slate-50 text-slate-700 border-slate-200";
                      label = "Regular";
                    } else if (rep.estado === 'atencion_requerida') {
                      badgeColor = "bg-rose-50 text-rose-700 border-rose-100 animate-pulse";
                      label = "Requiere Atención";
                    }

                    return (
                      <div 
                        key={rep.id} 
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
                        id={`card-inf-est-${rep.id}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                                Avance Estudiantil
                              </span>
                              <h5 className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {getStudentName(rep.estudianteId)}
                              </h5>
                              <p className="text-[10px] text-slate-400">{getStudentGrade(rep.estudianteId)}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                            {rep.avance}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rep.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const est = estudiantes.find(e => e.id === rep.estudianteId);
                              if (est) {
                                return (
                                  <button
                                    onClick={() => generateStudentReportPDF(est, [rep])}
                                    className="p-1 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                                    title="Descargar este Informe en PDF"
                                    id={`pdf-inf-est-${rep.id}`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            <button
                              onClick={() => onEditInformeEstudiante(rep)}
                              className="p-1 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Editar"
                              id={`edit-inf-est-${rep.id}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteInformeEstudiante(rep.id)}
                              className="p-1 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Eliminar"
                              id={`del-inf-est-${rep.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Extra reports */}
                  {extraOnSelectedDay.map((rep) => {
                    // Category styling
                    let categoryColor = "bg-amber-50 text-amber-700 border-amber-100";
                    let label = "Imprevisto";
                    if (rep.categoria === 'reunion') {
                      categoryColor = "bg-purple-50 text-purple-700 border-purple-100";
                      label = "Reunión";
                    } else if (rep.categoria === 'observacion') {
                      categoryColor = "bg-blue-50 text-blue-700 border-blue-100";
                      label = "Observación Gral";
                    } else if (rep.categoria === 'urgencia') {
                      categoryColor = "bg-rose-50 text-rose-700 border-rose-100 font-bold";
                      label = "Urgencia / Alerta";
                    } else if (rep.categoria === 'actividad') {
                      categoryColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      label = "Actividad";
                    }

                    return (
                      <div 
                        key={rep.id} 
                        className="bg-amber-50/20 border border-amber-200/80 rounded-xl p-4 hover:shadow-sm hover:border-amber-300 transition flex flex-col justify-between"
                        id={`card-inf-ext-${rep.id}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                                Situación Extra
                              </span>
                              <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                                {rep.titulo}
                              </h5>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor}`}>
                              {label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-amber-100/50">
                            {rep.descripcion}
                          </p>

                          {rep.participantesIds.length > 0 && (
                            <div className="mt-2 pl-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                                Pacientes/Estudiantes participantes:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {rep.participantesIds.map(partId => (
                                  <span key={partId} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    {getStudentName(partId)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rep.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => generateExtraReportPDF(rep, estudiantes)}
                              className="p-1 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Descargar este Informe en PDF"
                              id={`pdf-inf-ext-${rep.id}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditInformeExtra(rep)}
                              className="p-1 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Editar"
                              id={`edit-inf-ext-${rep.id}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteInformeExtra(rep.id)}
                              className="p-1 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Eliminar"
                              id={`del-inf-ext-${rep.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
