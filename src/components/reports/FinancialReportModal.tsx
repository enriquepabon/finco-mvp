'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Lightbulb, Trophy, Zap, Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
}

interface ReportData {
  resumen_ejecutivo: {
    titulo: string;
    descripcion: string;
    salud_financiera: number;
    estado_salud: string;
    estado_emoji: string;
    mensaje_motivacional: string;
  };
  analisis_presupuesto_vs_real: {
    ingresos: {
      presupuestado: number;
      real: number;
      cumplimiento_pct: number;
      evaluacion: string;
      estado: string;
    };
    gastos: {
      presupuestado: number;
      real: number;
      cumplimiento_pct: number;
      evaluacion: string;
      estado: string;
      detalle_fijos: {
        presupuestado: number;
        real: number;
      };
      detalle_variables: {
        presupuestado: number;
        real: number;
      };
    };
    ahorros: {
      meta: number;
      real: number;
      cumplimiento_pct: number;
      evaluacion: string;
      estado: string;
    };
  };
  analisis_regla_503020: {
    necesidades: {
      actual_pct: number;
      ideal_pct: number;
      diferencia_pct: number;
      evaluacion: string;
      recomendacion: string;
    };
    deseos: {
      actual_pct: number;
      ideal_pct: number;
      diferencia_pct: number;
      evaluacion: string;
      recomendacion: string;
    };
    ahorros: {
      actual_pct: number;
      ideal_pct: number;
      diferencia_pct: number;
      evaluacion: string;
      recomendacion: string;
    };
    resumen_general: string;
  };
  recomendaciones_prioritarias: Array<{
    titulo: string;
    descripcion: string;
    prioridad: string;
    categoria: string;
    impacto_esperado: string;
    pasos_accion: string[];
  }>;
  objetivos_sugeridos: Array<{
    objetivo: string;
    plazo: string;
    meta_numerica: string;
    pasos: string[];
    razon: string;
  }>;
  areas_mejora?: Array<{
    area: string;
    problema_identificado: string;
    impacto: string;
    solucion_propuesta: string;
  }>;
}

export default function FinancialReportModal({ isOpen, onClose, budgetId }: FinancialReportModalProps) {
  console.log('🎯 FinancialReportModal montado - isOpen:', isOpen, 'budgetId:', budgetId);
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [userEmail, setUserEmail] = useState<string>(''); // Email del usuario logueado
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔍 Modal useEffect - isOpen:', isOpen, 'report:', !!report);
    if (isOpen) {
      if (!report) {
        console.log('🚀 Iniciando generación de reporte...');
        generateReport();
      }
      loadUserEmail(); // Cargar el email del usuario logueado
    }
  }, [isOpen]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const supabase = (await import('@supabase/supabase-js')).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch('/api/generate-financial-report-fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ budgetId })
      });

      if (!response.ok) {
        throw new Error('Error generando reporte');
      }

      const data = await response.json();
      console.log('📊 Datos recibidos del backend:', data);
      console.log('📋 Reporte parseado:', data.report);
      
      if (!data.report) {
        throw new Error('El backend no devolvió un reporte válido');
      }
      
      setReport(data.report);
      console.log('✅ Reporte establecido en el estado');
    } catch (err) {
      console.error('❌ Error generando reporte:', err);
      setError('Error generando el reporte. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar el email del usuario
  const loadUserEmail = async () => {
    try {
      const supabase = (await import('@supabase/supabase-js')).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setEmailAddress(session.user.email); // Pre-llenar el campo de email
        console.log('✅ Email del usuario cargado:', session.user.email);
      }
    } catch (err) {
      console.warn('⚠️ No se pudo cargar el email del usuario:', err);
    }
  };

  const exportReportToPDF = async () => {
    if (!report) return;
    
    setExportingPDF(true);
    
    try {
      // Crear el PDF directamente con jsPDF (sin html2canvas)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      
      // Helper para agregar nueva página si es necesario
      const checkPageBreak = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      // Helper para agregar texto con wrap
      const addWrappedText = (text: string, fontSize: number, color: number[], maxWidth: number, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        if (isBold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(fontSize * 0.5);
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
      };
      
      // 1. HEADER
      pdf.setFillColor(147, 51, 234); // Purple-600
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MentorIA', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Reporte Financiero con IA', pageWidth / 2, 25, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 33, { align: 'center' });
      
      yPosition = 50;
      
      // 2. SALUD FINANCIERA
      checkPageBreak(30);
      pdf.setFillColor(243, 244, 246); // Gray-100
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      
      const healthScore = report.resumen_ejecutivo?.salud_financiera || 0;
      const healthLabel = report.resumen_ejecutivo?.estado_salud || 'N/A';
      const healthColor = healthScore >= 80 ? [34, 197, 94] : healthScore >= 60 ? [234, 179, 8] : healthScore >= 40 ? [249, 115, 22] : [239, 68, 68];
      
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99); // Gray-600
      pdf.setFont('helvetica', 'bold');
      pdf.text('SALUD FINANCIERA', margin + 5, yPosition + 8);
      
      pdf.setFontSize(32);
      pdf.setTextColor(healthColor[0], healthColor[1], healthColor[2]);
      pdf.text(`${healthScore}`, pageWidth / 2 - 15, yPosition + 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text(healthLabel, pageWidth / 2 + 5, yPosition + 20);
      
      yPosition += 35;
      
      // 3. RESUMEN EJECUTIVO
      checkPageBreak(15);
      addWrappedText('RESUMEN EJECUTIVO', 16, [88, 28, 135], contentWidth, true);
      yPosition += 3;
      const resumen = report.resumen_ejecutivo?.descripcion || 'No disponible';
      addWrappedText(resumen, 11, [75, 85, 99], contentWidth);
      yPosition += 3;
      if (report.resumen_ejecutivo?.mensaje_motivacional) {
        addWrappedText(`"${report.resumen_ejecutivo.mensaje_motivacional}"`, 10, [147, 51, 234], contentWidth);
      }
      yPosition += 5;
      
      // 4. PRESUPUESTO VS REAL
      if (report.analisis_presupuesto_vs_real) {
        checkPageBreak(15);
        addWrappedText('PRESUPUESTO VS REAL', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        // Ingresos
        const income = report.analisis_presupuesto_vs_real.ingresos;
        if (income) {
          addWrappedText(`Ingresos: $${income.real.toLocaleString('es-CO')} / $${income.presupuestado.toLocaleString('es-CO')} (${income.cumplimiento_pct}%)`, 10, [34, 197, 94], contentWidth);
          if (income.evaluacion) {
            addWrappedText(income.evaluacion, 9, [107, 114, 128], contentWidth);
            yPosition += 2;
          }
        }
        
        // Gastos
        const expenses = report.analisis_presupuesto_vs_real.gastos;
        if (expenses) {
          const expColor = expenses.cumplimiento_pct <= 100 ? [34, 197, 94] : [239, 68, 68];
          addWrappedText(`Gastos: $${expenses.real.toLocaleString('es-CO')} / $${expenses.presupuestado.toLocaleString('es-CO')} (${expenses.cumplimiento_pct}%)`, 10, expColor, contentWidth);
          if (expenses.evaluacion) {
            addWrappedText(expenses.evaluacion, 9, [107, 114, 128], contentWidth);
            yPosition += 2;
          }
        }
        
        // Ahorros
        const savings = report.analisis_presupuesto_vs_real.ahorros;
        if (savings) {
          addWrappedText(`Ahorros: $${savings.real.toLocaleString('es-CO')} / $${savings.meta.toLocaleString('es-CO')} (${savings.cumplimiento_pct}%)`, 10, [147, 51, 234], contentWidth);
          if (savings.evaluacion) {
            addWrappedText(savings.evaluacion, 9, [107, 114, 128], contentWidth);
            yPosition += 2;
          }
        }
        
        yPosition += 5;
      }
      
      // 5. REGLA 50/30/20
      if (report.analisis_regla_503020) {
        checkPageBreak(15);
        addWrappedText('REGLA 50/30/20', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        addWrappedText(`Necesidades (esenciales): ${report.analisis_regla_503020.necesidades_pct}% (Ideal: 50%)`, 10, [75, 85, 99], contentWidth);
        addWrappedText(`Deseos (no esenciales): ${report.analisis_regla_503020.deseos_pct}% (Ideal: 30%)`, 10, [75, 85, 99], contentWidth);
        addWrappedText(`Ahorros: ${report.analisis_regla_503020.ahorros_pct}% (Ideal: 20%)`, 10, [75, 85, 99], contentWidth);
        
        if (report.analisis_regla_503020.evaluacion) {
          yPosition += 2;
          addWrappedText(report.analisis_regla_503020.evaluacion, 9, [75, 85, 99], contentWidth);
        }
        
        yPosition += 5;
      }
      
      // 6. INDICADORES CLAVE
      if (report.indicadores_clave) {
        checkPageBreak(20);
        addWrappedText('INDICADORES CLAVE', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        const ind = report.indicadores_clave;
        if (ind.patrimonio_neto !== undefined) {
          addWrappedText(`Patrimonio Neto: $${ind.patrimonio_neto.toLocaleString('es-CO')}`, 10, [75, 85, 99], contentWidth);
        }
        if (ind.capacidad_ahorro_mensual !== undefined) {
          addWrappedText(`Capacidad de Ahorro: $${ind.capacidad_ahorro_mensual.toLocaleString('es-CO')}/mes`, 10, [75, 85, 99], contentWidth);
        }
        if (ind.nivel_endeudamiento_pct !== undefined) {
          const debtColor = ind.nivel_endeudamiento_pct > 50 ? [239, 68, 68] : [34, 197, 94];
          addWrappedText(`Nivel de Endeudamiento: ${ind.nivel_endeudamiento_pct}%`, 10, debtColor, contentWidth);
        }
        if (ind.fondo_emergencia_meses !== undefined) {
          const emergencyColor = ind.fondo_emergencia_meses >= 6 ? [34, 197, 94] : ind.fondo_emergencia_meses >= 3 ? [234, 179, 8] : [239, 68, 68];
          addWrappedText(`Fondo de Emergencia: ${ind.fondo_emergencia_meses} meses`, 10, emergencyColor, contentWidth);
        }
        
        yPosition += 5;
      }
      
      // 7. RECOMENDACIONES PRIORITARIAS
      if (report.recomendaciones_prioritarias && report.recomendaciones_prioritarias.length > 0) {
        checkPageBreak(15);
        addWrappedText('RECOMENDACIONES PRIORITARIAS', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        report.recomendaciones_prioritarias.forEach((rec: any, index: number) => {
          checkPageBreak(15);
          
          // Título de recomendación
          const titulo = rec.titulo || rec.recomendacion || `Recomendacion ${index + 1}`;
          addWrappedText(`${index + 1}. ${titulo}`, 11, [88, 28, 135], contentWidth, true);
          
          // Descripción
          if (rec.descripcion) {
            addWrappedText(rec.descripcion, 9, [75, 85, 99], contentWidth);
          }
          
          // Prioridad y categoría
          if (rec.prioridad || rec.categoria) {
            const prioridadColor = rec.prioridad === 'Alta' ? [239, 68, 68] : rec.prioridad === 'Media' ? [234, 179, 8] : [34, 197, 94];
            const metaText = `${rec.prioridad ? `Prioridad: ${rec.prioridad}` : ''}${rec.categoria ? ` | Categoria: ${rec.categoria}` : ''}`;
            addWrappedText(metaText, 8, prioridadColor, contentWidth);
          }
          
          // Pasos de acción
          if (rec.pasos_accion && rec.pasos_accion.length > 0) {
            addWrappedText('Pasos:', 9, [107, 114, 128], contentWidth, true);
            rec.pasos_accion.forEach((paso: string) => {
              addWrappedText(`  - ${paso}`, 8, [107, 114, 128], contentWidth - 5);
            });
          }
          
          yPosition += 3;
        });
        
        yPosition += 2;
      }
      
      // 8. ÁREAS DE MEJORA
      if (report.areas_mejora && report.areas_mejora.length > 0) {
        checkPageBreak(15);
        addWrappedText('AREAS DE MEJORA', 14, [239, 68, 68], contentWidth, true);
        yPosition += 3;
        
        report.areas_mejora.forEach((area: any, index: number) => {
          checkPageBreak(12);
          
          // Título del área
          const areaTitle = area.area || `Area ${index + 1}`;
          addWrappedText(`${index + 1}. ${areaTitle}`, 11, [239, 68, 68], contentWidth, true);
          
          // Problema identificado
          if (area.problema_identificado) {
            addWrappedText(`Problema: ${area.problema_identificado}`, 9, [107, 114, 128], contentWidth);
          }
          
          // Impacto
          if (area.impacto) {
            addWrappedText(`Impacto: ${area.impacto}`, 9, [107, 114, 128], contentWidth);
          }
          
          // Solución propuesta
          if (area.solucion_propuesta) {
            addWrappedText(`Solucion: ${area.solucion_propuesta}`, 9, [34, 197, 94], contentWidth);
          }
          
          yPosition += 2;
        });
        
        yPosition += 2;
      }
      
      // 9. OBJETIVOS SUGERIDOS
      if (report.objetivos_sugeridos && report.objetivos_sugeridos.length > 0) {
        checkPageBreak(15);
        addWrappedText('OBJETIVOS SUGERIDOS', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        report.objetivos_sugeridos.forEach((obj: any, index: number) => {
          checkPageBreak(12);
          
          // Título del objetivo
          const objTitle = obj.objetivo || `Objetivo ${index + 1}`;
          addWrappedText(`${index + 1}. ${objTitle}`, 11, [88, 28, 135], contentWidth, true);
          
          // Plazo y meta numérica
          if (obj.plazo || obj.meta_numerica) {
            const metaText = `${obj.plazo ? `Plazo: ${obj.plazo}` : ''}${obj.meta_numerica ? ` | Meta: ${obj.meta_numerica}` : ''}`;
            addWrappedText(metaText, 9, [107, 114, 128], contentWidth);
          }
          
          // Razón
          if (obj.razon) {
            addWrappedText(`Por que: ${obj.razon}`, 9, [75, 85, 99], contentWidth);
          }
          
          // Pasos
          if (obj.pasos && obj.pasos.length > 0) {
            addWrappedText('Pasos:', 9, [107, 114, 128], contentWidth, true);
            obj.pasos.forEach((paso: string) => {
              addWrappedText(`  - ${paso}`, 8, [107, 114, 128], contentWidth - 5);
            });
          }
          
          yPosition += 2;
        });
      }
      
      // 10. ANÁLISIS DE COMPORTAMIENTO
      if (report.analisis_comportamiento) {
        checkPageBreak(15);
        addWrappedText('ANALISIS DE COMPORTAMIENTO', 14, [88, 28, 135], contentWidth, true);
        yPosition += 3;
        
        // Hábitos
        if (report.analisis_comportamiento.habitos) {
          const hab = report.analisis_comportamiento.habitos;
          addWrappedText('Habitos Financieros:', 11, [88, 28, 135], contentWidth, true);
          
          if (hab.racha_actual !== undefined) {
            addWrappedText(`Racha actual: ${hab.racha_actual} dias`, 9, [34, 197, 94], contentWidth);
          }
          if (hab.consistencia_pct !== undefined) {
            addWrappedText(`Consistencia: ${hab.consistencia_pct}%`, 9, [34, 197, 94], contentWidth);
          }
          if (hab.evaluacion) {
            addWrappedText(hab.evaluacion, 9, [75, 85, 99], contentWidth);
          }
          if (hab.siguiente_milestone) {
            addWrappedText(`Proximo logro: ${hab.siguiente_milestone}`, 9, [147, 51, 234], contentWidth);
          }
          
          yPosition += 2;
        }
        
        // Gamificación
        if (report.analisis_comportamiento.gamificacion) {
          const gam = report.analisis_comportamiento.gamificacion;
          addWrappedText('Gamificacion:', 11, [88, 28, 135], contentWidth, true);
          
          if (gam.badges_ganados !== undefined) {
            addWrappedText(`Logros obtenidos: ${gam.badges_ganados}`, 9, [234, 179, 8], contentWidth);
          }
          if (gam.proximo_badge) {
            addWrappedText(`Proximo logro: ${gam.proximo_badge}`, 9, [107, 114, 128], contentWidth);
          }
        }
      }
      
      // FOOTER
      const footerY = pageHeight - 10;
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175); // Gray-400
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generado por MentorIA - Tu asistente financiero con IA', pageWidth / 2, footerY, { align: 'center' });
      
      // Generar nombre de archivo dinámico
      const now = new Date();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const fileName = `MentorIA_Reporte_${month}_${year}.pdf`;
      
      // Descargar el PDF
      pdf.save(fileName);
      
      console.log('✅ PDF exportado exitosamente:', fileName);
    } catch (err) {
      console.error('❌ Error exportando PDF:', err);
      setError('Error al exportar el PDF. Por favor intenta de nuevo.');
    } finally {
      setExportingPDF(false);
    }
  };

  const sendReportByEmail = async () => {
    console.log('📧 sendReportByEmail iniciado');
    console.log('  - reportContentRef.current:', !!reportContentRef.current);
    console.log('  - report:', !!report);
    console.log('  - emailAddress:', emailAddress);
    
    if (!reportContentRef.current) {
      console.error('❌ No hay reportContentRef.current');
      setError('Error: No se pudo obtener el contenido del reporte');
      return;
    }
    
    if (!report) {
      console.error('❌ No hay report');
      setError('Error: No hay reporte generado');
      return;
    }
    
    // Si no hay email, usar el del usuario logueado
    const finalEmail = emailAddress.trim() || userEmail;
    
    if (!finalEmail) {
      console.error('❌ No hay emailAddress ni userEmail');
      setError('Por favor ingresa un email válido');
      return;
    }
    
    setSendingEmail(true);
    setError(null);
    
    try {
      // Obtener el HTML del reporte
      console.log('📄 Obteniendo HTML del reporte...');
      const reportHTML = reportContentRef.current.outerHTML;
      console.log('  - HTML length:', reportHTML.length);
      
      // Get auth token
      console.log('🔐 Obteniendo sesión de Supabase...');
      const supabase = (await import('@supabase/supabase-js')).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No hay sesión activa');
        setError('No hay sesión activa');
        return;
      }
      console.log('✅ Sesión obtenida, user:', session.user.email);

      // Enviar email
      console.log('📤 Enviando request a /api/send-report-email...');
      console.log('📧 Email destinatario final:', finalEmail);
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          budgetId,
          recipientEmail: finalEmail,
          reportHtml: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>MentorIA - Reporte Financiero</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6; }
                .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(to right, #2563eb, #9333ea); padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .header p { color: #e0e7ff; margin: 8px 0 0 0; }
                .content { padding: 30px; }
                .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                .footer a { color: #9333ea; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⚡ MentorIA - Tu Reporte Financiero</h1>
                  <p>Análisis personalizado con Inteligencia Artificial</p>
                </div>
                <div class="content">
                  ${reportHTML}
                </div>
                <div class="footer">
                  <p>Este reporte fue generado automáticamente por <a href="#">MentorIA</a></p>
                  <p>© ${new Date().getFullYear()} MentorIA. Todos los derechos reservados.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error en response:', errorData);
        // Mostrar mensaje más detallado si es problema de configuración
        if (errorData.details && errorData.details.includes('RESEND_API_KEY')) {
          setError(`⚠️ ${errorData.error}\n\n${errorData.details}\n\n💡 ${errorData.setup}`);
        } else {
          setError(errorData.error || 'Error enviando email');
        }
        return;
      }

      const result = await response.json();
      console.log('✅ Email enviado exitosamente:', result);
      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailAddress('');
        setEmailSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Error enviando email:', err);
      setError(`Error al enviar el email: ${err.message || 'Por favor intenta de nuevo.'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) {
    console.log('❌ Modal NO se muestra porque isOpen es false');
    return null;
  }

  console.log('🎨 Renderizando modal - loading:', loading, 'error:', !!error, 'report:', !!report);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'Positivo') return 'text-green-600 bg-green-50';
    if (estado === 'Negativo') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPrioridadColor = (prioridad: string) => {
    if (prioridad === 'Alta') return 'bg-red-100 text-red-700';
    if (prioridad === 'Media') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      {console.log('🖼️ Renderizando contenido del modal')}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={() => {
            console.log('❌ Click en overlay - cerrando modal');
            onClose();
          }}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" style={{ position: 'relative', zIndex: 1000 }}>
          {console.log('📦 Renderizando panel del modal')}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Reporte Financiero con IA
                  </h3>
                  <p className="text-sm text-blue-100">Análisis personalizado por MentorIA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Generando tu reporte personalizado...</p>
                <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={generateReport}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}

            {report && (
              <div ref={reportContentRef} className="space-y-6">
                {/* Resumen Ejecutivo */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {report.resumen_ejecutivo.titulo}
                      </h4>
                      <p className="text-gray-700 mb-4">
                        {report.resumen_ejecutivo.descripcion}
                      </p>
                    </div>
                    <div className="text-4xl ml-4">
                      {report.resumen_ejecutivo.estado_emoji}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Salud Financiera</div>
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-gray-900">
                          {report.resumen_ejecutivo.salud_financiera}
                        </span>
                        <span className="text-lg text-gray-500">/100</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(report.resumen_ejecutivo.salud_financiera)}`}>
                          {report.resumen_ejecutivo.estado_salud}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 italic">
                      💡 {report.resumen_ejecutivo.mensaje_motivacional}
                    </p>
                  </div>
                </div>

                {/* Presupuesto vs Real */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Presupuesto vs Real
                  </h4>

                  <div className="space-y-4">
                    {/* Ingresos */}
                    <div className={`p-4 rounded-lg border ${getEstadoColor(report.analisis_presupuesto_vs_real.ingresos.estado)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">💰 Ingresos</span>
                        <span className="text-2xl font-bold">
                          {report.analisis_presupuesto_vs_real.ingresos.cumplimiento_pct}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Presupuestado: ${report.analisis_presupuesto_vs_real.ingresos.presupuestado.toLocaleString()}</div>
                        <div>Real: ${report.analisis_presupuesto_vs_real.ingresos.real.toLocaleString()}</div>
                      </div>
                      <p className="text-sm mt-2">{report.analisis_presupuesto_vs_real.ingresos.evaluacion}</p>
                    </div>

                    {/* Gastos */}
                    <div className={`p-4 rounded-lg border ${getEstadoColor(report.analisis_presupuesto_vs_real.gastos.estado)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">💸 Gastos</span>
                        <span className="text-2xl font-bold">
                          {report.analisis_presupuesto_vs_real.gastos.cumplimiento_pct}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Presupuestado: ${report.analisis_presupuesto_vs_real.gastos.presupuestado.toLocaleString()}</div>
                        <div>Real: ${report.analisis_presupuesto_vs_real.gastos.real.toLocaleString()}</div>
                        <div className="pt-2 border-t border-gray-200 mt-2">
                          <div>Fijos: ${report.analisis_presupuesto_vs_real.gastos.detalle_fijos.real.toLocaleString()}</div>
                          <div>Variables: ${report.analisis_presupuesto_vs_real.gastos.detalle_variables.real.toLocaleString()}</div>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{report.analisis_presupuesto_vs_real.gastos.evaluacion}</p>
                    </div>

                    {/* Ahorros */}
                    <div className={`p-4 rounded-lg border ${getEstadoColor(report.analisis_presupuesto_vs_real.ahorros.estado)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">🐷 Ahorros</span>
                        <span className="text-2xl font-bold">
                          {report.analisis_presupuesto_vs_real.ahorros.cumplimiento_pct}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Meta: ${report.analisis_presupuesto_vs_real.ahorros.meta.toLocaleString()}</div>
                        <div>Real: ${report.analisis_presupuesto_vs_real.ahorros.real.toLocaleString()}</div>
                      </div>
                      <p className="text-sm mt-2">{report.analisis_presupuesto_vs_real.ahorros.evaluacion}</p>
                    </div>
                  </div>
                </div>

                {/* Regla 50/30/20 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Regla 50/30/20
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">{report.analisis_regla_503020.resumen_general}</p>

                  <div className="space-y-3">
                    {/* Necesidades */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Necesidades (50%)</span>
                        <span className="text-sm font-bold text-gray-900">
                          {report.analisis_regla_503020.necesidades.actual_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full ${report.analisis_regla_503020.necesidades.actual_pct <= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(report.analisis_regla_503020.necesidades.actual_pct, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{report.analisis_regla_503020.necesidades.recomendacion}</p>
                    </div>

                    {/* Deseos */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Deseos (30%)</span>
                        <span className="text-sm font-bold text-gray-900">
                          {report.analisis_regla_503020.deseos.actual_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full ${report.analisis_regla_503020.deseos.actual_pct <= 30 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min(report.analisis_regla_503020.deseos.actual_pct, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{report.analisis_regla_503020.deseos.recomendacion}</p>
                    </div>

                    {/* Ahorros */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Ahorros (20%)</span>
                        <span className="text-sm font-bold text-gray-900">
                          {report.analisis_regla_503020.ahorros.actual_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full ${report.analisis_regla_503020.ahorros.actual_pct >= 20 ? 'bg-purple-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min(report.analisis_regla_503020.ahorros.actual_pct, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{report.analisis_regla_503020.ahorros.recomendacion}</p>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones Prioritarias */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                    Recomendaciones Prioritarias
                  </h4>

                  <div className="space-y-4">
                    {report.recomendaciones_prioritarias.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{rec.titulo}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(rec.prioridad)}`}>
                            {rec.prioridad}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.descripcion}</p>
                        
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Impacto esperado:</p>
                          <p className="text-sm text-blue-700">{rec.impacto_esperado}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Pasos a seguir:</p>
                          <ol className="space-y-1">
                            {rec.pasos_accion.map((paso, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                {paso}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objetivos Sugeridos */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Objetivos Sugeridos
                  </h4>

                  <div className="space-y-4">
                    {report.objetivos_sugeridos.map((obj, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{obj.objetivo}</h5>
                          <span className="text-sm px-2 py-1 bg-white rounded-full text-gray-700 border border-gray-200">
                            {obj.plazo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Meta: {obj.meta_numerica}</p>
                        <p className="text-sm text-gray-700 italic mb-3">"{obj.razon}"</p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Cómo lograrlo:</p>
                          <ul className="space-y-1">
                            {obj.pasos.map((paso, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start">
                                <span className="text-blue-600 mr-2 flex-shrink-0">{i + 1}.</span>
                                {paso}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Áreas de Mejora */}
                {report.areas_mejora && report.areas_mejora.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                      Áreas de Mejora
                    </h4>

                    <div className="space-y-3">
                      {report.areas_mejora.map((area, index) => (
                        <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h5 className="font-medium text-orange-900 mb-2">{area.area}</h5>
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Problema:</span> {area.problema_identificado}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Impacto:</span> {area.impacto}
                          </p>
                          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            <span className="font-medium">Solución:</span> {area.solucion_propuesta}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Reporte generado por <span className="font-medium text-purple-600">MentorIA</span>
            </p>
            <div className="flex items-center space-x-3">
              {report && (
                <>
                  <button
                    onClick={() => {
                      console.log('🖱️ CLICK EN "Enviar por Email" - Abriendo modal');
                      setShowEmailModal(true);
                    }}
                    disabled={sendingEmail}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar por Email</span>
                  </button>
                  <button
                    onClick={exportReportToPDF}
                    disabled={exportingPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingPDF ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Descargar PDF</span>
                      </>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Email - FUERA del modal del reporte */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          {console.log('📧 MODAL DE EMAIL RENDERIZADO - showEmailModal:', showEmailModal)}
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity"
              onClick={() => !sendingEmail && setShowEmailModal(false)}
            />
            
            <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 z-[10000]" style={{ boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-600" />
                  Enviar Reporte por Email
                </h3>
                <button
                  onClick={() => !sendingEmail && setShowEmailModal(false)}
                  disabled={sendingEmail}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">¡Email enviado!</h4>
                  <p className="text-gray-600">
                    El reporte se ha enviado exitosamente a <span className="font-medium">{emailAddress}</span>
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Ingresa el email al que deseas enviar el reporte financiero.
                  </p>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección de Email {userEmail && <span className="text-xs text-gray-500">(pre-llenado con tu email)</span>}
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={emailAddress}
                        onChange={(e) => {
                          console.log('📝 Email input changed:', e.target.value);
                          setEmailAddress(e.target.value);
                        }}
                        disabled={sendingEmail}
                        placeholder={userEmail || "ejemplo@email.com"}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {userEmail && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Puedes cambiar el email o dejarlo así para recibirlo en {userEmail}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          console.log('🖱️ CLICK EN BOTÓN ENVIAR');
                          console.log('  - emailAddress:', emailAddress);
                          console.log('  - userEmail:', userEmail);
                          console.log('  - sendingEmail:', sendingEmail);
                          sendReportByEmail();
                        }}
                        disabled={sendingEmail}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      {sendingEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Enviar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      disabled={sendingEmail}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

