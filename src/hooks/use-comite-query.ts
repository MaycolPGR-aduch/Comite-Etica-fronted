"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  asignacionService,
  authService,
  chatService,
  configService,
  configuracionService,
  dashboardService,
  dictamenService,
  evaluacionService,
  expedientesService,
  iaService,
  notificationsService,
  reportesService,
  revisionAdministrativaService,
  usersService,
} from "@/services";
import type { DictamenArchivoResponse } from "@/services/dictamen.service";
import type {
  CreateUserPayload,
  CriterioEvaluado,
  ExpedienteStatus,
  NotificacionCreatePayload,
  LoginPayload,
  RegisterPayload,
  ReporteExportResult,
  Role,
} from "@/types";

export const queryKeys = {
  expedientes: (status?: ExpedienteStatus) => ["expedientes", status] as const,
  expediente: (id: string) => ["expediente", id] as const,
  dashboardInvestigador: ["dashboard", "investigador"] as const,
  bandejaSecretaria: ["dashboard", "secretaria"] as const,
  dashboardCoordinador: ["dashboard", "coordinador"] as const,
  bandejaEvaluador: ["dashboard", "evaluador"] as const,
  evaluaciones: ["evaluaciones"] as const,
  evaluacion: (id: string) => ["evaluaciones", id] as const,
  rubrica: ["rubrica"] as const,
  asignacionContexto: (id: string) => ["asignacion", id] as const,
  evaluadores: ["evaluadores"] as const,
  configuracion: ["configuracion"] as const,
  profile: ["auth", "profile"] as const,
  notificaciones: (filter?: "all" | "unread") => ["notificaciones", filter ?? "all"] as const,
  notificacion: (id: string) => ["notificaciones", id] as const,
  notificacionesSinLeer: ["notificaciones", "sin-leer"] as const,
  iaPreanalisis: (expedienteId: string) => ["ia", "preanalisis", expedienteId] as const,
  iaInconsistencias: (expedienteId: string) => ["ia", "inconsistencias", expedienteId] as const,
  iaObservaciones: (expedienteId: string) => ["ia", "observaciones", expedienteId] as const,
  iaResumen: (expedienteId: string) => ["ia", "resumen", expedienteId] as const,
  reportesExpedientesEstado: ["reportes", "expedientes-estado"] as const,
  reportesTiemposAtencion: ["reportes", "tiempos-atencion"] as const,
  reportesCargaEvaluadores: ["reportes", "carga-evaluadores"] as const,
  reportesResultadosEmitidos: ["reportes", "resultados-emitidos"] as const,
  reportesBusquedaExpedientes: (filters?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) =>
    [
      "reportes",
      "buscar-expedientes",
      filters?.estado ?? "",
      filters?.fechaInicio ?? "",
      filters?.fechaFin ?? "",
    ] as const,
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
  chatMiHilo: ["chat", "mios"] as const,
  chatMisNoLeidos: ["chat", "mios", "no-leidos"] as const,
  chatConversaciones: ["chat", "conversaciones"] as const,
  chatSolicitantes: ["chat", "solicitantes"] as const,
  chatHilo: (solicitanteId: string) => ["chat", "hilo", solicitanteId] as const,
  chatTotalNoLeidos: ["chat", "no-leidos"] as const,
};

// ==================== CHAT SOLICITANTE-SECRETARÍA ====================
// Polling: hilo abierto 4s, bandeja 10s, badges 20s (sin WebSockets).

export const useChatMiHilo = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.chatMiHilo,
    queryFn: () => chatService.getMiHilo(),
    enabled,
    refetchInterval: 4000,
    retry: false,
  });

export const useChatMisNoLeidos = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.chatMisNoLeidos,
    queryFn: () => chatService.getMisNoLeidos(),
    enabled,
    refetchInterval: 20000,
    retry: false,
  });

export const useEnviarMensajeSolicitante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (texto: string) => chatService.enviarComoSolicitante(texto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMiHilo });
    },
  });
};

export const useChatConversaciones = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.chatConversaciones,
    queryFn: () => chatService.getConversaciones(),
    enabled,
    refetchInterval: 10000,
    retry: false,
  });

export const useChatSolicitantes = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.chatSolicitantes,
    queryFn: () => chatService.getSolicitantes(),
    enabled,
  });

export const useChatHilo = (solicitanteId: string | null) =>
  useQuery({
    queryKey: queryKeys.chatHilo(solicitanteId ?? ""),
    queryFn: () => chatService.getHiloDeSolicitante(solicitanteId as string),
    enabled: Boolean(solicitanteId),
    refetchInterval: 4000,
    retry: false,
  });

export const useEnviarMensajeSecretaria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ solicitanteId, texto }: { solicitanteId: string; texto: string }) =>
      chatService.enviarComoSecretaria(solicitanteId, texto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHilo(variables.solicitanteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatConversaciones });
    },
  });
};

export const useChatTotalNoLeidos = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.chatTotalNoLeidos,
    queryFn: () => chatService.getTotalNoLeidos(),
    enabled,
    refetchInterval: 20000,
    retry: false,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });

export const useMyProfile = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authService.getMyProfile(),
    enabled,
  });

export const useNotificaciones = (
  filter: "all" | "unread" = "all",
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.notificaciones(filter),
    queryFn: async () => {
      const notifications = await notificationsService.list();
      return filter === "unread" ? notifications.filter((item) => !item.leida) : notifications;
    },
    enabled,
    retry: false,
  });

export const useNotificacionById = (id: string) =>
  useQuery({
    queryKey: queryKeys.notificacion(id),
    queryFn: () => notificationsService.getById(id),
    enabled: Boolean(id),
  });

export const useNotificacionesSinLeer = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.notificacionesSinLeer,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled,
    retry: false,
  });

export const useCrearNotificacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificacionCreatePayload) => notificationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("all") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("unread") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificacionesSinLeer });
    },
  });
};

export const useMarcarNotificacionLeida = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, leida }: { id: string; leida: boolean }) =>
      notificationsService.updateReadStatus(id, leida),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificacion(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("all") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("unread") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificacionesSinLeer });
    },
  });
};

export const useMarcarTodasNotificacionesLeidas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("all") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones("unread") });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificacionesSinLeer });
    },
  });
};

export const useExpedientes = (status?: ExpedienteStatus) =>
  useQuery({
    queryKey: queryKeys.expedientes(status),
    queryFn: () => expedientesService.list(status),
  });

export const useExpedienteDetalle = (id: string) =>
  useQuery({
    queryKey: queryKeys.expediente(id),
    queryFn: () => expedientesService.getById(id),
    enabled: Boolean(id),
  });

export const useCrearBorrador = () =>
  useMutation({ mutationFn: expedientesService.createDraft });

export const useExpedienteCatalogos = () =>
  useQuery({
    queryKey: ["expediente-catalogos"],
    queryFn: () => expedientesService.getCatalogos(),
  });

export const useCrearExpedienteDinamico = () =>
  useMutation({ mutationFn: expedientesService.createExpedienteDinamico });

export const useProyectosElegiblesCambioTitulo = () =>
  useQuery({
    queryKey: ["proyectos-elegibles-cambio-titulo"],
    queryFn: () => expedientesService.getProyectosElegiblesCambioTitulo(),
  });

export const useCrearCambioTitulo = () =>
  useMutation({ mutationFn: expedientesService.createCambioTitulo });

export const useEliminarExpediente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesService.deleteExpediente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expedientes"] });
    },
  });
};

export const useFechaLimite = () =>
  useQuery({
    queryKey: ["fecha-limite"],
    queryFn: () => configService.getFechaLimite(),
  });

export const useSetFechaLimite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fechaLimite: string | null) => configService.setFechaLimite(fechaLimite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fecha-limite"] });
    },
  });
};

export const useRegistrarDocumentoExpediente = () =>
  useMutation({
    mutationFn: (payload: {
      expedienteId: string;
      file: File;
      tipoDocumento: string;
      esObligatorio?: boolean;
    }) =>
      expedientesService.registrarDocumento(payload.expedienteId, {
        file: payload.file,
        tipoDocumento: payload.tipoDocumento,
        esObligatorio: payload.esObligatorio,
      }),
  });

export const useDescargarDocumentoExpediente = () =>
  useMutation({
    mutationFn: ({
      expedienteId,
      documentoId,
      preferredFileName,
      mode,
    }: {
      expedienteId: string;
      documentoId: string;
      preferredFileName?: string;
      mode?: "preview" | "download";
    }) => expedientesService.descargarDocumento(expedienteId, documentoId, preferredFileName, mode),
  });

export const useEnviarExpediente = () =>
  useMutation({
    mutationFn: (expedienteId: string) => expedientesService.enviarExpediente(expedienteId),
  });

export const useReenviarSubsanacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expedienteId,
      observaciones,
    }: {
      expedienteId: string;
      observaciones: string;
    }) => expedientesService.reenviarSubsanacion(expedienteId, { observaciones }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expediente(variables.expedienteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expedientes() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardInvestigador });
      queryClient.invalidateQueries({ queryKey: queryKeys.bandejaSecretaria });
    },
  });
};

export const useDashboardInvestigador = () =>
  useQuery({
    queryKey: queryKeys.dashboardInvestigador,
    queryFn: () => dashboardService.getInvestigadorDashboard(),
  });

export const useBandejaSecretaria = () =>
  useQuery({
    queryKey: queryKeys.bandejaSecretaria,
    queryFn: () => dashboardService.getSecretariaResumen(),
  });

export const useDashboardCoordinador = () =>
  useQuery({
    queryKey: queryKeys.dashboardCoordinador,
    queryFn: () => dashboardService.getCoordinadorDashboard(),
  });

export const usePendientesRevisionAdministrativa = () =>
  useQuery({
    queryKey: ["revision-administrativa", "pendientes"],
    queryFn: () => revisionAdministrativaService.getPendientes(),
  });

export const useRegistrarRevisionAdministrativa = () =>
  {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: revisionAdministrativaService.registrarRevision,
      onSuccess: (_, payload) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bandejaSecretaria });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCoordinador });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardInvestigador });
        queryClient.invalidateQueries({ queryKey: ["expedientes"] });
        queryClient.invalidateQueries({ queryKey: queryKeys.expediente(payload.expedienteId) });
      },
    });
  };

export const useEvaluadoresDisponibles = () =>
  useQuery({
    queryKey: queryKeys.evaluadores,
    queryFn: () => asignacionService.getEvaluadoresDisponibles(),
  });

export const useContextoAsignacion = (id: string) =>
  useQuery({
    queryKey: queryKeys.asignacionContexto(id),
    queryFn: () => asignacionService.getExpedienteParaAsignacion(id),
    enabled: Boolean(id),
  });

export const useAsignarEvaluadores = () =>
  {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: asignacionService.asignarEvaluadores,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.evaluaciones });
        queryClient.invalidateQueries({ queryKey: queryKeys.bandejaEvaluador });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCoordinador });
        queryClient.invalidateQueries({ queryKey: ["expedientes"] });
      },
    });
  };

export const useBandejaEvaluador = () =>
  useQuery({
    queryKey: queryKeys.bandejaEvaluador,
    queryFn: () => evaluacionService.listMisEvaluaciones(),
  });

export const useEvaluaciones = () =>
  useQuery({
    queryKey: queryKeys.evaluaciones,
    queryFn: () => evaluacionService.list(),
  });

export const useCrearEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expedienteId: string) => evaluacionService.create(expedienteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluaciones });
      queryClient.invalidateQueries({ queryKey: queryKeys.bandejaEvaluador });
    },
  });
};

export const useContextoEvaluacion = (id: string) =>
  useQuery({
    queryKey: queryKeys.evaluacion(id),
    queryFn: () => evaluacionService.getContextoEvaluacion(id),
    enabled: Boolean(id),
  });

export const useIAPreanalisis = (expedienteId: string) =>
  useQuery({
    queryKey: queryKeys.iaPreanalisis(expedienteId),
    queryFn: () => iaService.getPreanalisis(expedienteId),
    enabled: Boolean(expedienteId),
  });

export const useIAInconsistencias = (expedienteId: string) =>
  useQuery({
    queryKey: queryKeys.iaInconsistencias(expedienteId),
    queryFn: () => iaService.getInconsistencias(expedienteId),
    enabled: Boolean(expedienteId),
  });

export const useIAObservacionesSugeridas = (expedienteId: string) =>
  useQuery({
    queryKey: queryKeys.iaObservaciones(expedienteId),
    queryFn: () => iaService.getObservacionesSugeridas(expedienteId),
    enabled: Boolean(expedienteId),
  });

export const useIAResumen = (expedienteId: string) =>
  useQuery({
    queryKey: queryKeys.iaResumen(expedienteId),
    queryFn: () => iaService.getResumen(expedienteId),
    enabled: Boolean(expedienteId),
  });

export const useDeclararConflictoEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evaluacionId: string) => evaluacionService.declararConflicto(evaluacionId),
    onSuccess: (_, evaluacionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluacion(evaluacionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bandejaEvaluador });
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluaciones });
    },
  });
};

export const useRubrica = () =>
  useQuery({
    queryKey: queryKeys.rubrica,
    queryFn: () => evaluacionService.getRubrica(),
    staleTime: 1000 * 60 * 60,
  });

export const useGuardarRubrica = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      evaluacionId: string;
      criterios: CriterioEvaluado[];
      observaciones?: string;
      enviar: boolean;
    }) => evaluacionService.saveRubrica(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluacion(payload.evaluacionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bandejaEvaluador });
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluaciones });
    },
  });
};

export const useDescargarArchivoDictamen = () =>
  useMutation<
    DictamenArchivoResponse,
    Error,
    {
      dictamenId: string;
      preferredFileName?: string;
    }
  >({
    mutationFn: ({
      dictamenId,
      preferredFileName,
    }) => dictamenService.descargarArchivoDictamen(dictamenId, preferredFileName),
  });

export const useConfiguracionCatalogos = () =>
  useQuery({
    queryKey: queryKeys.configuracion,
    queryFn: () => configuracionService.getCatalogos(),
  });

export const useReporteExpedientesPorEstado = () =>
  useQuery({
    queryKey: queryKeys.reportesExpedientesEstado,
    queryFn: () => reportesService.getExpedientesPorEstado(),
  });

export const useReporteTiemposAtencion = () =>
  useQuery({
    queryKey: queryKeys.reportesTiemposAtencion,
    queryFn: () => reportesService.getTiemposAtencion(),
  });

export const useReporteCargaEvaluadores = () =>
  useQuery({
    queryKey: queryKeys.reportesCargaEvaluadores,
    queryFn: () => reportesService.getCargaEvaluadores(),
  });

export const useReporteResultadosEmitidos = () =>
  useQuery({
    queryKey: queryKeys.reportesResultadosEmitidos,
    queryFn: () => reportesService.getResultadosEmitidos(),
  });

export const useReporteBuscarExpedientes = (filters?: {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}) =>
  useQuery({
    queryKey: queryKeys.reportesBusquedaExpedientes(filters),
    queryFn: () => reportesService.buscarExpedientes(filters),
  });

export const useExportarReporte = () =>
  useMutation({
    mutationFn: (tipo: string): Promise<ReporteExportResult> => reportesService.exportar(tipo),
  });

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: () => usersService.list(),
  });

export const useUserById = (id: string) =>
  useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersService.getById(id),
    enabled: Boolean(id),
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      id: string;
      data: { nombre?: string; apellido?: string; rol?: Role; activo?: boolean };
    }) => usersService.update(payload.id, payload.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};
