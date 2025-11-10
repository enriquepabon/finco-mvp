'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface FinancialReportProps {
  className?: string;
}

interface ReportData {
  resumen_ejecutivo: {
    titulo: string;
    descripcion: string;
    puntuacion_financiera: string;
    estado_general: string;
  };
  indicadores_clave: {
    patrimonio_neto: number;
    capacidad_ahorro_mensual: number;
    nivel_endeudamiento_pct: number;
    fondo_emergencia_meses: number;
    presupuesto_usado_pct: number;
  };
  analisis_detallado: {
    ingresos: {
      evaluacion: string;
      recomendaciones: string[];
    };
    gastos: {
      evaluacion: string;
      recomendaciones: string[];
    };
    activos: {
      evaluacion: string;
      recomendaciones: string[];
    };
    deudas: {
      evaluacion: string;
      recomendaciones: string[];
    };
  };
  recomendaciones_prioritarias: Array<{
    titulo: string;
    descripcion: string;
    prioridad: string;
    impacto: string;
  }>;
  objetivos_sugeridos: Array<{
    objetivo: string;
    plazo: string;
    pasos: string[];
  }>;
}

export default function FinancialReport({ className = '' }: FinancialReportProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    loadLatestReport();
  }, []);

  const loadLatestReport = async () => {
    try {
      // Intentar cargar desde localStorage primero (fallback)
      const savedReport = localStorage.getItem('financial_report');
      if (savedReport) {
        const reportData = JSON.parse(savedReport);
        setReport(reportData.report);
        setLastGenerated(reportData.generated_at);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Intentar cargar desde Supabase (si la tabla existe)
      try {
        const { data: reports, error } = await supabase
          .from('financial_reports')
          .select('*')
          .eq('user_id', session.user.id)
          .order('generated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.log('Tabla financial_reports no existe aún, usando localStorage');
          return;
        }

        if (reports && reports.length > 0) {
          setReport(reports[0].report_data);
          setLastGenerated(reports[0].generated_at);
        }
      } catch (dbError) {
        console.log('Error accediendo a base de datos, usando localStorage:', dbError);
      }
    } catch (error) {
      console.error('Error cargando reporte:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Obtener el presupuesto activo del usuario con timeout
      const budgetPromise = supabase
        .from('budgets')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Timeout de 5 segundos para la consulta del presupuesto
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout obteniendo presupuesto')), 5000)
      );

      const { data: budgets, error: budgetError } = await Promise.race([
        budgetPromise,
        timeoutPromise
      ]) as any;

      if (budgetError || !budgets || budgets.length === 0) {
        throw new Error('No se encontró un presupuesto activo. Crea un presupuesto primero desde la sección de Presupuesto.');
      }

      const budgetId = budgets[0].id;

      const response = await fetch('/api/generate-financial-report-fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ budgetId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generando reporte');
      }

      const data = await response.json();
      setReport(data.report);
      const currentTime = new Date().toISOString();
      setLastGenerated(currentTime);

      // Guardar en localStorage como fallback
      localStorage.setItem('financial_report', JSON.stringify({
        report: data.report,
        generated_at: currentTime
      }));

    } catch (error) {
      console.error('Error generando reporte:', error);
      setError(error instanceof Error ? error.message : 'Error generando reporte');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return 'text-green-600 bg-green-100';
    if (numScore >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excelente':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bueno':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'regular':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (!report) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Reporte Financiero
          </h3>
          <p className="text-slate-600 mb-6">
            Genera un análisis completo de tu situación financiera con recomendaciones personalizadas.
          </p>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generando reporte...
              </div>
            ) : (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Generar reporte
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {report.resumen_ejecutivo.titulo}
              </h2>
              {lastGenerated && (
                <p className="text-sm text-slate-500">
                  Generado el {new Date(lastGenerated).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-700 mb-4">{report.resumen_ejecutivo.descripcion}</p>
            <div className="flex items-center">
              {getStatusIcon(report.resumen_ejecutivo.estado_general)}
              <span className="ml-2 font-medium text-slate-900">
                {report.resumen_ejecutivo.estado_general}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getScoreColor(report.resumen_ejecutivo.puntuacion_financiera)}`}>
              {report.resumen_ejecutivo.puntuacion_financiera}
            </div>
            <p className="text-sm text-slate-600 mt-2">Puntuación Financiera</p>
          </div>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-600">Patrimonio Neto</h3>
          <p className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('es-CO', { 
              style: 'currency', 
              currency: 'COP', 
              minimumFractionDigits: 0 
            }).format(report.indicadores_clave.patrimonio_neto)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-600">Capacidad de Ahorro</h3>
          <p className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('es-CO', { 
              style: 'currency', 
              currency: 'COP', 
              minimumFractionDigits: 0 
            }).format(report.indicadores_clave.capacidad_ahorro_mensual)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-600">Nivel de Endeudamiento</h3>
          <p className="text-2xl font-bold text-slate-900">
            {report.indicadores_clave.nivel_endeudamiento_pct}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-600">Fondo de Emergencia</h3>
          <p className="text-2xl font-bold text-slate-900">
            {report.indicadores_clave.fondo_emergencia_meses} meses
          </p>
        </div>
      </div>

      {/* Recomendaciones Prioritarias */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Recomendaciones Prioritarias
        </h3>
        <div className="space-y-4">
          {report.recomendaciones_prioritarias.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-900">{rec.titulo}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.prioridad)}`}>
                  {rec.prioridad}
                </span>
              </div>
              <p className="text-slate-700 mb-2">{rec.descripcion}</p>
              <p className="text-sm text-slate-600">
                <strong>Impacto:</strong> {rec.impacto}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Objetivos Sugeridos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Objetivos Sugeridos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.objetivos_sugeridos.map((objetivo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900">{objetivo.objetivo}</h4>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {objetivo.plazo}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Pasos a seguir:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {objetivo.pasos.map((paso, pasoIndex) => (
                    <li key={pasoIndex} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {paso}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 