/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Estudiante, InformeEstudiante, InformeExtra, EstadoInforme, CategoriaExtra } from './types';
import { INITIAL_ESTUDIANTES, INITIAL_INFORMES_ESTUDIANTES, INITIAL_INFORMES_EXTRA } from './mockData';
import CalendarioModulo from './components/CalendarioModulo';
import EstudiantesModulo from './components/EstudiantesModulo';
import ExtraModulo from './components/ExtraModulo';
import EditReportModal from './components/EditReportModal';
import PinScreen from './components/PinScreen';
import ConfirmModal from './components/ConfirmModal';
import LogoConfigModal from './components/LogoConfigModal';
import {
  testConnection,
  subscribeToEstudiantes,
  saveEstudianteToFirestore,
  deleteEstudianteFromFirestore,
  subscribeToInformesEstudiantes,
  saveInformeEstudianteToFirestore,
  updateInformeEstudianteInFirestore,
  deleteInformeEstudianteFromFirestore,
  subscribeToInformesExtra,
  saveInformeExtraToFirestore,
  updateInformeExtraInFirestore,
  deleteInformeExtraFromFirestore,
  clearAllFirestoreData
} from './lib/firebase';
import { 
  Calendar, 
  GraduationCap, 
  PlusCircle, 
  FolderPlus, 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Bookmark,
  Users,
  Search,
  Sliders,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Cloud,
  CloudCheck,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // --- Access Control Security PIN (1981) ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('bitacora_unlocked') === 'true';
  });

  // --- Realtime Firestore Data States with LocalStorage Fallback ---
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(() => {
    const saved = localStorage.getItem('bitacora_estudiantes');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Filter out any previous mock students
      return parsed.filter((e: Estudiante) => !['est-1', 'est-2', 'est-3', 'est-4'].includes(e.id));
    } catch {
      return [];
    }
  });

  const [informesEstudiantes, setInformesEstudiantes] = useState<InformeEstudiante[]>(() => {
    const saved = localStorage.getItem('bitacora_informes_estudiantes');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter((r: InformeEstudiante) => !r.id.startsWith('inf-est-1') && !r.id.startsWith('inf-est-2') && !r.id.startsWith('inf-est-3') && !r.id.startsWith('inf-est-4') && !r.id.startsWith('inf-est-5') && !r.id.startsWith('inf-est-6'));
    } catch {
      return [];
    }
  });

  const [informesExtra, setInformesExtra] = useState<InformeExtra[]>(() => {
    const saved = localStorage.getItem('bitacora_informes_extra');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter((r: InformeExtra) => !['inf-ext-1', 'inf-ext-2', 'inf-ext-3'].includes(r.id));
    } catch {
      return [];
    }
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Today's formatted date string YYYY-MM-DD
  const getTodayFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayFormatted());
  const [activeTab, setActiveTab] = useState<'calendario' | 'estudiantes' | 'extra'>('calendario');

  // --- Modal Edit States ---
  const [editingStudentReport, setEditingStudentReport] = useState<InformeEstudiante | null>(null);
  const [editingExtraReport, setEditingExtraReport] = useState<InformeExtra | null>(null);

  // --- Reset Confirmation Custom Modal State ---
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- Custom Institutional Logo Modal State ---
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Initial connection test and purge old dummy mock items from Firestore
  useEffect(() => {
    testConnection();
    
    // Check and purge legacy mock records if present
    const purgeOldMocks = async () => {
      const savedEst = localStorage.getItem('bitacora_estudiantes');
      if (savedEst && (savedEst.includes('Mateo Fernández') || savedEst.includes('est-1'))) {
        localStorage.removeItem('bitacora_estudiantes');
        localStorage.removeItem('bitacora_informes_estudiantes');
        localStorage.removeItem('bitacora_informes_extra');
        setEstudiantes([]);
        setInformesEstudiantes([]);
        setInformesExtra([]);
        await clearAllFirestoreData();
      }
    };
    purgeOldMocks();
  }, []);

  // --- Real-time Firebase Firestore Subscriptions ---
  useEffect(() => {
    let unsubscribeEst: (() => void) | undefined;
    let unsubscribeInfEst: (() => void) | undefined;
    let unsubscribeInfExt: (() => void) | undefined;

    try {
      unsubscribeEst = subscribeToEstudiantes((cloudEstudiantes) => {
        // Filter out legacy mock data IDs
        const filtered = cloudEstudiantes.filter(e => !['est-1', 'est-2', 'est-3', 'est-4'].includes(e.id));
        setEstudiantes(filtered);
        localStorage.setItem('bitacora_estudiantes', JSON.stringify(filtered));
        setIsCloudSynced(true);
      });

      unsubscribeInfEst = subscribeToInformesEstudiantes((cloudInformes) => {
        const filtered = cloudInformes.filter(r => !['inf-est-1', 'inf-est-2', 'inf-est-3', 'inf-est-4', 'inf-est-5', 'inf-est-6'].includes(r.id));
        setInformesEstudiantes(filtered);
        localStorage.setItem('bitacora_informes_estudiantes', JSON.stringify(filtered));
        setIsCloudSynced(true);
      });

      unsubscribeInfExt = subscribeToInformesExtra((cloudExtra) => {
        const filtered = cloudExtra.filter(r => !['inf-ext-1', 'inf-ext-2', 'inf-ext-3'].includes(r.id));
        setInformesExtra(filtered);
        localStorage.setItem('bitacora_informes_extra', JSON.stringify(filtered));
        setIsCloudSynced(true);
      });
    } catch (e) {
      console.warn("Firestore subscription error:", e);
    }

    return () => {
      unsubscribeEst?.();
      unsubscribeInfEst?.();
      unsubscribeInfExt?.();
    };
  }, []);

  // Sync to local storage as secondary offline backup
  useEffect(() => {
    localStorage.setItem('bitacora_estudiantes', JSON.stringify(estudiantes));
  }, [estudiantes]);

  useEffect(() => {
    localStorage.setItem('bitacora_informes_estudiantes', JSON.stringify(informesEstudiantes));
  }, [informesEstudiantes]);

  useEffect(() => {
    localStorage.setItem('bitacora_informes_extra', JSON.stringify(informesExtra));
  }, [informesExtra]);

  // --- Core CRUD Actions (Synced with Firestore) ---

  // 1. Students CRUD
  const handleAddEstudiante = async (nombre: string, grado: string) => {
    const newEst: Estudiante = {
      id: `est-${Date.now()}`,
      nombre,
      grado,
      createdAt: new Date().toISOString()
    };
    // Optimistic local update
    setEstudiantes(prev => [...prev, newEst]);
    // Remote cloud save
    await saveEstudianteToFirestore(newEst);
  };

  const handleDeleteEstudiante = async (id: string) => {
    // 1. Remove student locally & in cloud
    setEstudiantes(prev => prev.filter(e => e.id !== id));
    await deleteEstudianteFromFirestore(id);

    // 2. Cascade delete all student reports for this student
    const reportsToDelete = informesEstudiantes.filter(r => r.estudianteId === id);
    setInformesEstudiantes(prev => prev.filter(r => r.estudianteId !== id));
    for (const r of reportsToDelete) {
      await deleteInformeEstudianteFromFirestore(r.id);
    }

    // 3. Remove student ID from any extra reports participant lists
    setInformesExtra(prev => prev.map(rep => {
      if (rep.participantesIds.includes(id)) {
        const updated = {
          ...rep,
          participantesIds: rep.participantesIds.filter(pId => pId !== id)
        };
        updateInformeExtraInFirestore(rep.id, { participantesIds: updated.participantesIds });
        return updated;
      }
      return rep;
    }));
  };

  // 2. Student Reports CRUD
  const handleAddInformeEstudiante = async (estudianteId: string, fecha: string, avance: string, estado: EstadoInforme) => {
    const newReport: InformeEstudiante = {
      id: `inf-est-${Date.now()}`,
      estudianteId,
      fecha,
      avance,
      estado,
      createdAt: new Date().toISOString()
    };
    setInformesEstudiantes(prev => [newReport, ...prev]);
    await saveInformeEstudianteToFirestore(newReport);
  };

  const handleDeleteInformeEstudiante = async (id: string) => {
    setInformesEstudiantes(prev => prev.filter(r => r.id !== id));
    await deleteInformeEstudianteFromFirestore(id);
  };

  const handleSaveStudentReport = async (id: string, updated: Partial<InformeEstudiante>) => {
    setInformesEstudiantes(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    await updateInformeEstudianteInFirestore(id, updated);
  };

  // 3. Extra Reports CRUD
  const handleAddInformeExtra = async (titulo: string, fecha: string, descripcion: string, categoria: CategoriaExtra, participantesIds: string[]) => {
    const newExtra: InformeExtra = {
      id: `inf-ext-${Date.now()}`,
      titulo,
      fecha,
      descripcion,
      categoria,
      participantesIds,
      createdAt: new Date().toISOString()
    };
    setInformesExtra(prev => [newExtra, ...prev]);
    await saveInformeExtraToFirestore(newExtra);
  };

  const handleDeleteInformeExtra = async (id: string) => {
    setInformesExtra(prev => prev.filter(r => r.id !== id));
    await deleteInformeExtraFromFirestore(id);
  };

  const handleSaveExtraReport = async (id: string, updated: Partial<InformeExtra>) => {
    setInformesExtra(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    await updateInformeExtraInFirestore(id, updated);
  };

  // --- Export Data to JSON File Option ---
  const handleExportData = () => {
    const backup = {
      estudiantes,
      informesEstudiantes,
      informesExtra
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bitacora_backup_${getTodayFormatted()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // --- Reset All Data to Zero ---
  const handleClearAllData = async () => {
    setEstudiantes([]);
    setInformesEstudiantes([]);
    setInformesExtra([]);
    localStorage.removeItem('bitacora_estudiantes');
    localStorage.removeItem('bitacora_informes_estudiantes');
    localStorage.removeItem('bitacora_informes_extra');
    await clearAllFirestoreData();
    setShowResetConfirm(false);
  };

  // --- Statistics Helpers ---
  const totalAlumnos = estudiantes.length;
  const totalInformesDeAvance = informesEstudiantes.length;
  const totalIncidentesExtra = informesExtra.length;
  
  // Count reports that are "atención requerida"
  const informesCriticos = informesEstudiantes.filter(r => r.estado === 'atencion_requerida').length;

  if (!isUnlocked) {
    return (
      <PinScreen 
        correctPin="1981" 
        onUnlock={() => {
          sessionStorage.setItem('bitacora_unlocked', 'true');
          setIsUnlocked(true);
        }} 
      />
    );
  }
 
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans" id="app-root">
      
      {/* Top Professional Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Bitácora Psicóloga Milena
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <Cloud className="w-3 h-3 text-emerald-500 animate-pulse" />
                  Nube Firebase
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">
                Expedientes, Avances y Acompañamiento Psicopedagógico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action buttons: Logo Config, Clear All, Backup and Lock Screen */}
            <button
              onClick={() => setShowLogoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 shadow-2xs transition cursor-pointer"
              title="Configurar el logo y membrete institucional para los informes en PDF"
              id="btn-open-logo-config"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Logo / Membrete</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition cursor-pointer"
              title="Dejar todo en cero (Borrar estudiantes, informes y situaciones extra)"
              id="btn-clear-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vaciar Todo</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Exportar copia de seguridad en JSON"
              id="btn-export-backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Respaldar</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('bitacora_unlocked');
                setIsUnlocked(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition cursor-pointer"
              title="Bloquear bitácora"
              id="btn-lock-screen"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-workspace-container">
        
        {/* Statistics Widgets Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" id="quick-stats-widget-grid">
          
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Estudiantes
              </span>
              <span className="text-lg font-bold font-mono text-slate-800">{totalAlumnos}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Informes de Avance
              </span>
              <span className="text-lg font-bold font-mono text-slate-800">{totalInformesDeAvance}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Situaciones Extra
              </span>
              <span className="text-lg font-bold font-mono text-slate-800">{totalIncidentesExtra}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              informesCriticos > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Atención Crítica
              </span>
              <span className={`text-lg font-bold font-mono ${informesCriticos > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {informesCriticos}
              </span>
            </div>
          </div>

        </div>

        {/* Modular Navigation Tabs with Modern Pill Styling */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 max-w-lg mb-8" id="navigation-pills">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calendario'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-calendario"
          >
            <Calendar className="w-4 h-4" />
            Calendario
          </button>
          
          <button
            onClick={() => setActiveTab('estudiantes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'estudiantes'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-estudiantes"
          >
            <GraduationCap className="w-4 h-4" />
            Estudiantes
          </button>

          <button
            onClick={() => setActiveTab('extra')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'extra'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-extra"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Extra
          </button>
        </div>

        {/* Active Module Screen */}
        <div className="animate-fade-in" id="active-module-container">
          {activeTab === 'calendario' && (
            <CalendarioModulo
              estudiantes={estudiantes}
              informesEstudiantes={informesEstudiantes}
              informesExtra={informesExtra}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onDeleteInformeEstudiante={handleDeleteInformeEstudiante}
              onDeleteInformeExtra={handleDeleteInformeExtra}
              onEditInformeEstudiante={(rep) => setEditingStudentReport(rep)}
              onEditInformeExtra={(rep) => setEditingExtraReport(rep)}
              onSwitchTab={(tab) => {
                if (tab === 'estudiantes' || tab === 'extra') {
                  setActiveTab(tab);
                }
              }}
            />
          )}

          {activeTab === 'estudiantes' && (
            <EstudiantesModulo
              estudiantes={estudiantes}
              informesEstudiantes={informesEstudiantes}
              selectedDate={selectedDate}
              onAddEstudiante={handleAddEstudiante}
              onAddInformeEstudiante={handleAddInformeEstudiante}
              onDeleteEstudiante={handleDeleteEstudiante}
              onDeleteInformeEstudiante={handleDeleteInformeEstudiante}
              onEditInformeEstudiante={(rep) => setEditingStudentReport(rep)}
            />
          )}

          {activeTab === 'extra' && (
            <ExtraModulo
              estudiantes={estudiantes}
              informesExtra={informesExtra}
              selectedDate={selectedDate}
              onAddInformeExtra={handleAddInformeExtra}
              onDeleteInformeExtra={handleDeleteInformeExtra}
              onEditInformeExtra={(rep) => setEditingExtraReport(rep)}
            />
          )}
        </div>

      </main>

      {/* Global Edit Overlay Modal */}
      {(editingStudentReport || editingExtraReport) && (
        <EditReportModal
          estudiantes={estudiantes}
          editingStudentReport={editingStudentReport}
          editingExtraReport={editingExtraReport}
          onClose={() => {
            setEditingStudentReport(null);
            setEditingExtraReport(null);
          }}
          onSaveStudentReport={handleSaveStudentReport}
          onSaveExtraReport={handleSaveExtraReport}
        />
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="¿Dejar todo en cero?"
        message="Esta acción eliminará de forma permanente todos los estudiantes registrados, todos sus informes de avance y todas las situaciones extra registradas tanto localmente como en la base de datos de la nube. ¿Desea continuar?"
        confirmText="Sí, vaciar y dejar en cero"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleClearAllData}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Institutional Logo & Header Customization Modal */}
      <LogoConfigModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />

      {/* Modern Footer bar */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-16" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 Bitácora Psicóloga Milena. Sincronización en la nube activa.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
              Sincronizado con Firebase Firestore
            </span>
            <span>•</span>
            <span className="text-slate-400">Datos Seguros y Permanentes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

