import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Users, BookOpen, UserCheck, HardHat, Award, BarChart3, Brain, 
  LogOut, Shield, MapPin, Database, Sparkles, Lock, Unlock, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isMockMode, changeRoleSimulated } = useAuth();
  
  // Estado para capturar las respuestas de simulación de cada API de módulo
  const [apiData, setApiData] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [loadingModules, setLoadingModules] = useState({});

  // Lista de Módulos Universitarios Requeridos
  const modulesList = [
    {
      id: 'students',
      title: 'Gestión de Estudiantes',
      description: 'Control de matrículas, expedientes estudiantiles, asignaciones de becas y residencias.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO', 'PROFESOR'],
      endpoint: 'students/dashboard/',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'academic',
      title: 'Procesos Académicos',
      description: 'Planificación docente, control de planes de estudio (Plan E), asignaturas y horarios.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO', 'PROFESOR', 'ESTUDIANTE', 'SOPORTE_TECNICO'],
      endpoint: 'academic/dashboard/',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'hr',
      title: 'Recursos Humanos',
      description: 'Contratos del claustro docente, nómina de salarios, categorías docentes e incidencias.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO'],
      endpoint: 'hr/dashboard/',
      icon: UserCheck,
      color: 'from-red-600 to-rose-600',
    },
    {
      id: 'maintenance',
      title: 'Mantenimiento e Incidencias',
      description: 'Gestión de reparaciones del campus, inventario de laboratorios informáticos y equipos.',
      allowedRoles: ['ADMINISTRADOR', 'SOPORTE_TECNICO'],
      endpoint: 'maintenance/dashboard/',
      icon: HardHat,
      color: 'from-amber-600 to-orange-600',
    },
    {
      id: 'research',
      title: 'Proyectos de Investigación',
      description: 'Tesis de grado, maestrías, publicaciones científicas, patentes y eventos.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO', 'PROFESOR'],
      endpoint: 'research/dashboard/',
      icon: Award,
      color: 'from-violet-600 to-purple-600',
    },
    {
      id: 'analytics',
      title: 'Analítica Universitaria',
      description: 'Cuadros de mando estratégicos, tasas de aprobación, eficiencia académica y reportes.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO'],
      endpoint: 'analytics/dashboard/',
      icon: BarChart3,
      color: 'from-pink-600 to-fuchsia-600',
    },
    {
      id: 'ai_modules',
      title: 'Inteligencia Artificial',
      description: 'Modelos predictivos locales de deserción estudiantil y analítica de encuestas mediante NLP.',
      allowedRoles: ['ADMINISTRADOR', 'DECANO', 'PROFESOR', 'SOPORTE_TECNICO'],
      endpoint: 'ai/dashboard/',
      icon: Brain,
      color: 'from-cyan-600 to-sky-600',
    },
  ];

  const handleSimulateApi = async (mod) => {
    // Si el usuario no tiene permisos según el frontend, podemos simular el bloqueo
    const hasPermission = mod.allowedRoles.includes(user.role);
    
    setLoadingModules(prev => ({ ...prev, [mod.id]: true }));
    setApiData(prev => ({ ...prev, [mod.id]: null }));
    setApiErrors(prev => ({ ...prev, [mod.id]: null }));

    // Pequeño retardo visual para simular respuesta de red de servidor
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!hasPermission) {
      setApiErrors(prev => ({ 
        ...prev, 
        [mod.id]: `Acceso Denegado (RBAC): El rol "${user.role}" no tiene permisos para acceder al endpoint /api/${mod.endpoint}` 
      }));
      setLoadingModules(prev => ({ ...prev, [mod.id]: false }));
      return;
    }

    try {
      if (user.isMock) {
        // Simular respuesta del backend en modo offline (Mock)
        let mockResponse = {};
        if (mod.id === 'students') {
          mockResponse = {
            modulo: "Gestión de Estudiantes (Simulado)",
            datos: [
              { id: 1, nombre: "Carlos Gómez", carrera: "Ingeniería Informática", año: 4, estado: "Activo" },
              { id: 2, nombre: "Ana Leyva", carrera: "Ingeniería Informática", año: 3, estado: "Activo" }
            ]
          };
        } else if (mod.id === 'academic') {
          mockResponse = {
            modulo: "Procesos Académicos (Simulado)",
            semestre: "Segundo Semestre 2026",
            planes: ["Plan E - Informática", "Plan E - Industrial"]
          };
        } else if (mod.id === 'hr') {
          mockResponse = {
            modulo: "Recursos Humanos (Simulado)",
            total_profesores: 182,
            ultimo_pago: "2026-05-25"
          };
        } else if (mod.id === 'maintenance') {
          mockResponse = {
            modulo: "Mantenimiento (Simulado)",
            solicitudes_pendientes: 8,
            laboratorios: ["Laboratorio de Redes UHO"]
          };
        } else if (mod.id === 'research') {
          mockResponse = {
            modulo: "Proyectos de Investigación (Simulado)",
            investigaciones: ["Optimización de Tránsito usando IA"]
          };
        } else if (mod.id === 'analytics') {
          mockResponse = {
            modulo: "Analítica Universitaria (Simulado)",
            tasa_promocion: "87.4%",
            eficiencia: "91.2%"
          };
        } else if (mod.id === 'ai_modules') {
          mockResponse = {
            modulo: "Inteligencia Artificial UHO (Simulado)",
            modelos: ["Predictor de Deserción", "Analizador de Sentimientos NLP"]
          };
        }

        setApiData(prev => ({ ...prev, [mod.id]: mockResponse }));
      } else {
        // Llamada API real al Backend Django REST
        const response = await API.get(mod.endpoint);
        setApiData(prev => ({ ...prev, [mod.id]: response.data }));
      }
    } catch (err) {
      setApiErrors(prev => ({ 
        ...prev, 
        [mod.id]: err.response?.data?.detail || "Error al conectar con la API del Backend. Compruebe que Django está corriendo." 
      }));
    } finally {
      setLoadingModules(prev => ({ ...prev, [mod.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* HEADER DE LA UNIVERSIDAD */}
      <header className="glass sticky top-0 z-40 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-uho to-emerald-800 text-white shadow-lg shadow-uho/10">
              <Sparkles className="h-6 w-6 text-uho-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Informatización UHO
                <span className="text-xs px-2 py-0.5 rounded-full bg-uho-accent/10 text-uho-accent border border-uho-accent/20">
                  DevOps Boilerplate
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Universidad de Holguín "Oscar Lucero Moya"
              </p>
            </div>
          </div>

          {/* PERFIL DE USUARIO Y SIMULADOR DE ROLES */}
          <div className="flex items-center flex-wrap gap-4">
            {/* RBAC SELECTOR */}
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Shield className="h-4 w-4 text-uho-accent" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol Activo:</span>
              <select 
                value={user?.role} 
                onChange={(e) => changeRoleSimulated(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer hover:text-uho-accent transition-colors"
              >
                <option value="ADMINISTRADOR" className="bg-slate-900">ADMINISTRADOR</option>
                <option value="DECANO" className="bg-slate-900">DECANO</option>
                <option value="PROFESOR" className="bg-slate-900">PROFESOR</option>
                <option value="ESTUDIANTE" className="bg-slate-900">ESTUDIANTE</option>
                <option value="SOPORTE_TECNICO" className="bg-slate-900">SOPORTE TÉCNICO</option>
              </select>
            </div>

            {/* USER STATS */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-slate-500">{user?.departamento}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-950/30 text-slate-400 hover:text-red-400 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* BANNER INSTITUCIONAL */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-uho/40 via-emerald-950/20 to-slate-950 border border-slate-800/80 p-8 mb-8">
          <div className="absolute right-0 top-0 h-full w-[350px] opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-uho-accent h-full w-full">
              <polygon points="50,15 90,35 90,65 50,85 10,65 10,35" />
            </svg>
          </div>

          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[11px] font-bold uppercase tracking-wider">
              Sistema de Desarrollo Institucional
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-4 leading-tight">
              Development System for an Informatization Process for the University of Holguín (UHO)
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Plantilla base corporativa y deslocalizada desarrollada bajo estándares DevOps y arquitectura modular escalable. Utilice el selector de roles del menú superior para simular de forma inmediata los filtros de seguridad (RBAC) y auditar la trazabilidad de peticiones.
            </p>

            {isMockMode && (
              <div className="inline-flex items-center gap-2 mt-5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                <Database className="h-4 w-4" />
                <span>Simulación Local Activada (Offline). No requiere backend activo.</span>
              </div>
            )}
          </div>
        </div>

        {/* METRICAS RAPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Matrícula UHO', val: '5,420', desc: 'Estudiantes Activos', icon: Users, color: 'text-blue-400' },
            { label: 'Proyectos Activos', val: '42', desc: 'Investigación & Desarrollo', icon: BookOpen, color: 'text-emerald-400' },
            { label: 'Soporte de Redes', val: '8', desc: 'Solicitudes Pendientes', icon: HardHat, color: 'text-amber-400' },
            { label: 'Modelos de IA', val: '2 En Línea', desc: 'Predictores Activos', icon: Brain, color: 'text-cyan-400' },
          ].map((card, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-900">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100">{card.val}</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* SECCION DE MODULOS */}
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Database className="h-5 w-5 text-uho-accent" />
          Módulos del Sistema Universitario
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modulesList.map((mod) => {
            const hasPermission = mod.allowedRoles.includes(user.role);
            const mockResponse = apiData[mod.id];
            const mockError = apiErrors[mod.id];
            const isLoading = loadingModules[mod.id];

            return (
              <div key={mod.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-900/60 overflow-hidden relative">
                {/* Indicador de permiso de Frontend en la esquina superior del card */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  {hasPermission ? (
                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Permitido
                    </span>
                  ) : (
                    <span className="bg-red-950/60 text-red-400 border border-red-800/40 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Restringido
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${mod.color} text-white shadow-md`}>
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-base">{mod.title}</h4>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                        Ruta: /api/{mod.endpoint}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-5">
                    {mod.description}
                  </p>

                  {/* ROLES AUTORIZADOS */}
                  <div className="mb-6">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                      Roles Autorizados (RBAC):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.allowedRoles.map((role) => (
                        <span 
                          key={role} 
                          className={`text-[9px] px-2 py-0.5 rounded-md font-semibold border ${
                            role === user.role
                              ? 'bg-uho-accent/15 text-uho-accent border-uho-accent/30 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AREA DE SIMULACION Y RESPUESTA DE API */}
                <div className="mt-auto space-y-4">
                  
                  {/* BOTON EJECUTAR */}
                  <button
                    onClick={() => handleSimulateApi(mod)}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                      hasPermission
                        ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200'
                        : 'bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-300'
                    }`}
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Consultar Módulo</span>
                        {hasPermission ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5 text-red-400" />}
                      </>
                    )}
                  </button>

                  {/* RESPUESTA EXITOSA DE LA API */}
                  {mockResponse && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-xs animate-fadeIn">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Respuesta Exitosa (HTTP 200 OK):</span>
                      </div>
                      <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto p-2 bg-slate-950/80 rounded-lg max-h-[150px]">
                        {JSON.stringify(mockResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* RESPUESTA ERRONEA / BLOQUEADA */}
                  {mockError && (
                    <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs animate-fadeIn">
                      <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Fallo de Seguridad (HTTP 403 Forbidden):</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                        {mockError}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
