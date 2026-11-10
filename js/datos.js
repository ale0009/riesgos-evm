// Datos tomados de trabajos académicos (Universidad ECCI, 2026), anonimizados.
// Ningún valor numérico de este archivo es inventado: todos salen de las tablas de la fuente.

/** Caso 1: plan de gestión de riesgos (PMBOK 7 + ISO 31000). Escala de 3 niveles. */
export const CASO_PROVEEDOR = {
  id: "proveedor",
  nombre: "Proveedor regional de servicios gestionados y data centers",
  subtitulo:
    "Caso de estudio: formalizar el flujo de aprovisionamiento y activación del monitoreo de servicios de red para clientes empresariales.",
  marco: "PMBOK 7.ª ed. + ISO 31000:2018",
  // Tabla 2 de la fuente: Alto (P x I >= 10), Medio (5 <= P x I <= 9), Bajo (P x I <= 4).
  escala: [
    { nivel: "Bajo", min: 1, max: 4 },
    { nivel: "Medio", min: 5, max: 9 },
    { nivel: "Alto", min: 10, max: 25 },
  ],
  escalaP: [
    "Raro: menos del 10 %",
    "Improbable: entre 10 % y 30 %",
    "Posible: entre 30 % y 50 %",
    "Probable: entre 50 % y 70 %",
    "Casi seguro: más del 70 %",
  ],
  escalaI: [
    "Insignificante: sin efecto apreciable",
    "Menor: se resuelve con un ajuste menor",
    "Moderado: requiere esfuerzo y recursos adicionales",
    "Mayor: afecta alcance, cronograma o presupuesto",
    "Crítico: compromete los objetivos centrales",
  ],
  // Tabla 5 de la fuente.
  indicadores: {
    adopcion: { nombre: "Tasa de adopción del flujo", meta: ">= 90 %", frecuencia: "Semanal", desc: "Porcentaje de solicitudes procesadas con el nuevo flujo frente al total del periodo." },
    activacion: { nombre: "Tiempo de activación del monitoreo", meta: "Reducción >= 40 %", frecuencia: "Por solicitud", desc: "Tiempo promedio desde la solicitud hasta la activación efectiva del monitoreo." },
    sla: { nombre: "Cumplimiento de SLA contractuales", meta: ">= 90 %", frecuencia: "Mensual", desc: "Porcentaje de solicitudes que cumplen el tiempo máximo de activación del contrato." },
    materializados: { nombre: "Riesgos materializados", meta: "0 riesgos Alto", frecuencia: "Quincenal", desc: "Riesgos cuyo disparador se activó en el periodo, por nivel." },
    eficacia: { nombre: "Eficacia de las mitigaciones", meta: ">= 85 %", frecuencia: "Mensual", desc: "Acciones de mitigación ejecutadas a tiempo frente a las planificadas." },
    errores: { nombre: "Tasa de errores de configuración", meta: "< 2 por 100", frecuencia: "Mensual", desc: "Incidentes por IPs cruzadas o enrutamientos incorrectos por cada 100 solicitudes activadas." },
    capacitacion: { nombre: "Cobertura de capacitación", meta: "100 %", frecuencia: "Por fase", desc: "Integrantes de ingeniería y validación que aprobaron la capacitación con >= 80 %." },
  },
  // Indicadores que la fuente asocia de forma explícita a un riesgo (texto de "Acciones prioritarias").
  // El resto se sigue con los indicadores generales "materializados" y "eficacia".
  indicadoresGenerales: ["materializados", "eficacia"],
  riesgos: [
    { id: "R01", titulo: "Resistencia al cambio organizacional", desc: "Resistencia al cambio del equipo de ingeniería o validación frente al nuevo flujo formal de aprovisionamiento centralizado.", categoria: "Organizacional", p: 4, i: 4, nivelFuente: "Alto", disparador: "Quejas formales o incumplimiento del nuevo proceso en los primeros 15 días hábiles posteriores al Go-Live.", responsable: "Gerencia de Operaciones", estrategia: "Mitigar", acciones: "Talleres de gestión del cambio con metodología ADKAR; sesiones de co-diseño del flujo con ambos equipos; comunicación temprana de beneficios y participación en decisiones de diseño.", contingencia: "Sesiones de mediación facilitadas por la Gerencia de Operaciones; ajuste del flujo según retroalimentación del equipo; refuerzo de comunicación ejecutiva.", frecuencia: "Mensual", indicadores: ["adopcion", "capacitacion"] },
    { id: "R02", titulo: "Falta de patrocinio activo", desc: "Ausencia de patrocinio activo de la Gerencia de Operaciones durante la implementación del plan de gestión integrada.", categoria: "Organizacional", p: 2, i: 5, nivelFuente: "Alto", disparador: "Demora superior a cinco días hábiles en aprobaciones clave del proyecto o ausencia injustificada del patrocinador.", responsable: "Líder del proyecto", estrategia: "Mitigar", acciones: "Reuniones quincenales formales de seguimiento con el patrocinador; dashboard ejecutivo de avance; acuerdos de disponibilidad firmados al inicio del proyecto.", contingencia: "Escalamiento al comité directivo de la organización para reactivar el compromiso del patrocinador o designar uno alterno con poder de decisión equivalente.", frecuencia: "Quincenal", indicadores: [] },
    { id: "R03", titulo: "Errores de configuración IP en pruebas", desc: "Errores de configuración de IPs cruzadas o enrutamientos incorrectos durante las pruebas del nuevo flujo de aprovisionamiento.", categoria: "Técnico", p: 3, i: 5, nivelFuente: "Alto", disparador: "Reporte de incidentes de red durante la fase de pruebas UAT o en ambiente de preproducción.", responsable: "Equipo de Ingeniería de Red", estrategia: "Mitigar", acciones: "Checklist técnico de validación previo a la activación del nodo; ambiente de pruebas aislado del entorno de producción; revisión doble (peer review) de configuraciones críticas.", contingencia: "Rollback inmediato de la configuración afectada; activación del protocolo de incidentes de red de la organización; cuarentena del nodo afectado.", frecuencia: "Por sprint", indicadores: ["errores"] },
    { id: "R04", titulo: "Integración ITSM fallida (API)", desc: "Integración fallida entre el módulo ITSM y la plataforma de monitoreo (Zabbix o PRTG) por incompatibilidades de API o cambios en endpoints.", categoria: "Técnico", p: 3, i: 4, nivelFuente: "Alto", disparador: "Prueba de integración API fallida en la Fase 4 o respuesta HTTP 4xx/5xx persistente.", responsable: "Arquitecto técnico", estrategia: "Mitigar", acciones: "Prueba de concepto (PoC) de integración API en la Fase 2; documentación de contratos de API; definición de un flujo manual de aprobación como alternativa de transición.", contingencia: "Activar el flujo manual de aprobación mediante la herramienta existente mientras se resuelve la integración técnica; involucrar al proveedor del ITSM.", frecuencia: "Semanal", indicadores: [] },
    { id: "R05", titulo: "Disponibilidad insuficiente del equipo técnico", desc: "Disponibilidad insuficiente del equipo técnico por carga operativa paralela en otros frentes de la organización.", categoria: "Recursos", p: 4, i: 3, nivelFuente: "Alto", disparador: "Participación inferior al 60 % en sesiones de diagnóstico o pruebas durante dos semanas consecutivas.", responsable: "Gerencia de Operaciones", estrategia: "Mitigar", acciones: "Acuerdos formales de disponibilidad firmados con la Gerencia de Operaciones; sesiones programadas en horarios de baja carga operativa; documentación continua como respaldo de conocimiento.", contingencia: "Redistribuir tareas al integrante de respaldo identificado; extender el cronograma de la fase afectada en un máximo de una semana; activar plan de continuidad del recurso.", frecuencia: "Quincenal", indicadores: [] },
    { id: "R06", titulo: "Incumplimiento del cronograma", desc: "Incumplimiento de plazos del cronograma por subestimación de tiempos en las fases de diseño o pruebas.", categoria: "Cronograma", p: 3, i: 3, nivelFuente: "Medio", disparador: "Índice SPI inferior a 0,8 en dos semanas consecutivas según el seguimiento del cronograma.", responsable: "Líder del proyecto", estrategia: "Mitigar", acciones: "Control semanal de los índices CPI y SPI; buffer de tiempo del 10 % por fase; reuniones semanales de seguimiento del cronograma con el equipo del proyecto.", contingencia: "Compresión del cronograma (fast-tracking) en actividades no críticas; reasignación de recursos disponibles; renegociación de hitos con el patrocinador.", frecuencia: "Semanal", indicadores: [] },
    { id: "R07", titulo: "Incremento del presupuesto", desc: "Incremento del presupuesto por necesidad de adquirir licencias ITSM adicionales no previstas en el plan original.", categoria: "Presupuesto", p: 2, i: 3, nivelFuente: "Medio", disparador: "Cotización de la herramienta seleccionada que supera en más del 15 % el presupuesto aprobado.", responsable: "Líder del proyecto", estrategia: "Evitar", acciones: "Priorizar herramientas de código abierto (GLPI, osTicket) o licencias corporativas existentes en la organización; evaluar costo-beneficio formal antes de la Fase 3.", contingencia: "Solicitar presupuesto de contingencia (10 %) a la Gerencia; reducir el alcance al producto mínimo viable (MVP) con las funcionalidades esenciales del flujo.", frecuencia: "Por fase", indicadores: [] },
    { id: "R08", titulo: "Rotación de personal clave", desc: "Rotación de personal técnico clave que concentra el conocimiento del proceso actual de aprovisionamiento.", categoria: "Recursos", p: 2, i: 4, nivelFuente: "Medio", disparador: "Renuncia o transferencia formal de un ingeniero sénior con rol crítico durante la ejecución del proyecto.", responsable: "Gerencia de Operaciones", estrategia: "Mitigar", acciones: "Documentación continua del proceso desde el inicio del proyecto; capacitación cruzada entre miembros del equipo; identificación de un respaldo técnico para cada rol crítico.", contingencia: "Incorporar un recurso de reemplazo con perfil técnico equivalente; ajustar el cronograma en una semana adicional; aplicar onboarding acelerado.", frecuencia: "Mensual", indicadores: [] },
    { id: "R09", titulo: "Cambio regulatorio de la CRC", desc: "Cambios regulatorios de la CRC (Comisión de Regulación de Comunicaciones) que modifiquen los requisitos de calidad y continuidad del servicio durante el proyecto.", categoria: "Legal / Regulatorio", p: 1, i: 4, nivelFuente: "Bajo", disparador: "Publicación de una nueva resolución CRC que modifique los SLA de activación o calidad del servicio.", responsable: "Líder del proyecto", estrategia: "Aceptar", acciones: "Monitoreo mensual de las publicaciones de la CRC; inclusión de una cláusula de actualización regulatoria en el diseño del flujo para facilitar ajustes futuros.", contingencia: "Adaptar los criterios de SLA del flujo a los nuevos requisitos regulatorios en la siguiente versión del plan; comunicar a los clientes empresariales el ajuste pertinente.", frecuencia: "Mensual", indicadores: [] },
    { id: "R10", titulo: "Alcance mal definido", desc: "Alcance mal definido que genere solicitudes de cambio excesivas durante la ejecución del proyecto.", categoria: "Alcance", p: 2, i: 3, nivelFuente: "Medio", disparador: "Más de tres solicitudes formales de cambio de alcance recibidas en el mismo mes calendario.", responsable: "Líder del proyecto", estrategia: "Mitigar", acciones: "Acta de constitución detallada y aprobada; proceso formal de control de cambios desde el inicio (CCB); definición clara del producto mínimo viable del flujo.", contingencia: "Aplicar el proceso de control de cambios; evaluar el impacto de cada solicitud antes de aprobar; renegociar el alcance con el patrocinador si fuese necesario.", frecuencia: "Por sprint", indicadores: [] },
    { id: "R11", titulo: "Baja adopción tras el Go-Live", desc: "Baja adopción del nuevo flujo por parte del equipo de validación tras el Go-Live del sistema.", categoria: "Organizacional", p: 3, i: 4, nivelFuente: "Alto", disparador: "Tasa de uso del nuevo flujo inferior al 70 % en las dos primeras semanas posteriores al Go-Live.", responsable: "Gerencia de Operaciones", estrategia: "Mitigar", acciones: "Plan de capacitación con evaluación mínima del 80 % de aprobación; acompañamiento durante las primeras dos semanas del Go-Live; indicadores de uso visibles para la Gerencia.", contingencia: "Sesiones de refuerzo de capacitación; simplificación de pasos del flujo según la retroalimentación de los usuarios; incentivos por adopción temprana.", frecuencia: "Quincenal", indicadores: ["adopcion", "capacitacion"] },
    { id: "R12", titulo: "Fallas de disponibilidad del ITSM", desc: "Fallas en la disponibilidad del sistema ITSM durante las pruebas de carga y rendimiento previas al Go-Live.", categoria: "Técnico", p: 2, i: 3, nivelFuente: "Medio", disparador: "Tiempo de respuesta del sistema superior a cinco segundos en pruebas de carga con concurrencia simulada.", responsable: "Arquitecto técnico", estrategia: "Mitigar", acciones: "Definición de un SLA de disponibilidad del sistema ITSM no inferior al 99,5 %; pruebas de carga en ambiente de preproducción; plan de mantenimiento preventivo programado.", contingencia: "Activar el flujo manual de respaldo; notificar a los equipos afectados; escalar al proveedor del ITSM por incumplimiento de SLA.", frecuencia: "Por sprint", indicadores: [] },
  ],
};

/** Caso 2: taller de matriz de riesgos para un sistema web de gestión académica. Escala de 4 niveles. */
export const CASO_ACADEMICO = {
  id: "academico",
  nombre: "Sistema web de gestión académica",
  subtitulo:
    "Caso del taller: registro de estudiantes, notas, reportes y acceso 24/7. Cuatro meses, cinco desarrolladores, presupuesto limitado y requerimientos poco definidos.",
  marco: "PMBOK (6.ª y 7.ª ed.) + Scrum",
  // Actividad 3 de la fuente.
  escala: [
    { nivel: "Bajo", min: 1, max: 5 },
    { nivel: "Medio", min: 6, max: 10 },
    { nivel: "Alto", min: 11, max: 19 },
    { nivel: "Crítico", min: 20, max: 25 },
  ],
  escalaP: null,
  escalaI: null,
  indicadores: {},
  indicadoresGenerales: [],
  riesgos: [
    { id: "R01", titulo: "Cambios frecuentes en requerimientos", categoria: "Gestión", p: 5, i: 4, nivelFuente: "Crítico", estrategia: "Mitigar", acciones: "Reuniones semanales con el cliente para validar y congelar requerimientos por sprint. Uso de Change Request formal." },
    { id: "R02", titulo: "Abandono o renuncia de un desarrollador clave", categoria: "Organizacional", p: 3, i: 5, nivelFuente: "Alto", estrategia: "Mitigar", acciones: "Documentar conocimiento técnico, promover pair-programming y mantener un plan de onboarding actualizado." },
    { id: "R03", titulo: "Fallas en la integración del módulo de reportes con la base de datos", categoria: "Técnico", p: 4, i: 4, nivelFuente: "Alto", estrategia: "Mitigar", acciones: "Realizar pruebas de integración continua (CI/CD). Definir contratos de API desde la fase de diseño." },
    { id: "R04", titulo: "Exceso en el presupuesto por cambios de alcance", categoria: "Gestión", p: 4, i: 5, nivelFuente: "Crítico", estrategia: "Evitar", acciones: "Establecer un contrato con alcance fijo. Implementar control de cambios con aprobación formal del sponsor." },
    { id: "R05", titulo: "Baja disponibilidad del servidor (uptime < 99 %)", categoria: "Técnico", p: 3, i: 4, nivelFuente: "Alto", estrategia: "Transferir", acciones: "Contratar proveedor cloud con SLA garantizado (AWS / Azure). Incluir cláusula de penalización en el contrato." },
    { id: "R06", titulo: "Retrasos en la entrega por estimaciones incorrectas", categoria: "Gestión", p: 4, i: 4, nivelFuente: "Alto", estrategia: "Mitigar", acciones: "Usar Planning Poker para estimar. Añadir buffer del 20 % en el cronograma. Revisiones semanales de avance." },
    { id: "R07", titulo: "Vulnerabilidades de seguridad en el acceso al sistema", categoria: "Técnico", p: 3, i: 5, nivelFuente: "Alto", estrategia: "Mitigar", acciones: "Implementar autenticación de doble factor (2FA), cifrado HTTPS, auditorías de código y pruebas de penetración." },
    { id: "R08", titulo: "Cambios en normativa de protección de datos (habeas data)", categoria: "Externo", p: 2, i: 5, nivelFuente: "Medio", estrategia: "Mitigar", acciones: "Contratar asesoría legal desde el inicio. Diseñar el sistema con privacidad desde el diseño (Privacy by Design)." },
    { id: "R09", titulo: "Resistencia al cambio por parte de usuarios finales", categoria: "Organizacional", p: 3, i: 3, nivelFuente: "Medio", estrategia: "Mitigar", acciones: "Plan de gestión del cambio: capacitaciones, manuales de usuario y sesiones demostrativas antes del go-live." },
    { id: "R10", titulo: "Incompatibilidad con navegadores o dispositivos móviles", categoria: "Técnico", p: 3, i: 3, nivelFuente: "Medio", estrategia: "Mitigar", acciones: "Desarrollo responsive desde el inicio. Pruebas en múltiples navegadores (Chrome, Firefox, Safari, Edge)." },
    { id: "R11", titulo: "Pérdida de datos por fallo en el sistema de backups", categoria: "Técnico", p: 2, i: 5, nivelFuente: "Medio", estrategia: "Mitigar", acciones: "Configurar backups automáticos diarios en al menos dos ubicaciones. Pruebas de restauración mensuales." },
    { id: "R12", titulo: "Falta de disponibilidad del cliente para validaciones", categoria: "Externo", p: 3, i: 4, nivelFuente: "Alto", estrategia: "Mitigar", acciones: "Establecer en el contrato compromisos de disponibilidad del cliente (mínimo 4 horas/semana). Stakeholder management." },
  ],
};

export const CASOS = [CASO_PROVEEDOR, CASO_ACADEMICO];

/** Ejercicio de valor ganado (EVM) sobre un desarrollo ágil: caso didáctico de una empresa logística. */
export const EJERCICIO_EVM = {
  totalSP: 24,
  velocidad: 8, // SP por sprint
  sprints: 3,
  costoSprint: 5800, // USD
  bac: 17400, // 5.800 x 3
  // Seguimiento real reportado por la fuente al cierre del Sprint 2 (acumulado).
  corteFuente: { sprint: 2, spCompletados: 14, costoReal: 12500 },
  // Resultados publicados en la fuente (para las pruebas).
  resultadosFuente: {
    pv: 11600, ev: 10150, ac: 12500, cv: -2350, sv: -1450,
    cpi: 0.812, spi: 0.875, eac: 21428.57, eacSpi: 19885.71,
    sobrecosto: 4029, sobrecostoPct: 23.2,
  },
};
