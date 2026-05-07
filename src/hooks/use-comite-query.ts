"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  asignacionService,
  authService,
  configuracionService,
  consolidacionService,
  dashboardService,
  evaluacionService,
  expedientesService,
  revisionAdministrativaService,
  usersService,
} from "@/services";
import type {
  Evaluacion,
  ExpedienteStatus,
  LoginPayload,
  RegisterPayload,
  Recommendation,
  Role,
  RiskLevel,
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
  asignacionContexto: (id: string) => ["asignacion", id] as const,
  evaluadores: ["evaluadores"] as const,
  consolidacion: (id: string) => ["consolidacion", id] as const,
  configuracion: ["configuracion"] as const,
  profile: ["auth", "profile"] as const,
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
};

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });

export const useMyProfile = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authService.getMyProfile(),
  });

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

export const useRegistrarDocumentoExpediente = () =>
  useMutation({
    mutationFn: (payload: {
      expedienteId: string;
      nombreArchivo: string;
      tipoDocumento: string;
      esObligatorio?: boolean;
    }) =>
      expedientesService.registrarDocumento(payload.expedienteId, {
        nombreArchivo: payload.nombreArchivo,
        tipoDocumento: payload.tipoDocumento,
        esObligatorio: payload.esObligatorio,
      }),
  });

export const useEnviarExpediente = () =>
  useMutation({
    mutationFn: (expedienteId: string) => expedientesService.enviarExpediente(expedienteId),
  });

export const useReenviarSubsanacion = () =>
  useMutation({ mutationFn: ({ expedienteId, respuestas }: { expedienteId: string; respuestas: Array<{ observacionId: string; respuesta: string }> }) => expedientesService.reenviarSubsanacion(expedienteId, respuestas) });

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
  useMutation({ mutationFn: revisionAdministrativaService.registrarRevision });

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

export const useGuardarEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      evaluacionId: string;
      riesgo: RiskLevel;
      recomendacion: Recommendation;
      secciones: Evaluacion["secciones"];
      enviar: boolean;
    }) => evaluacionService.saveEvaluacion(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluacion(payload.evaluacionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bandejaEvaluador });
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluaciones });
    },
  });
};

export const useConsolidacion = (id: string) =>
  useQuery({
    queryKey: queryKeys.consolidacion(id),
    queryFn: () => consolidacionService.getComparativa(id),
    enabled: Boolean(id),
  });

export const useGenerarDictamen = () =>
  useMutation({ mutationFn: ({ expedienteId, decisionFinal, resumen }: { expedienteId: string; decisionFinal: "Aprobado" | "Desaprobado" | "Observado"; resumen: string }) => consolidacionService.generarDictamenMock(expedienteId, decisionFinal, resumen) });

export const useConfiguracionCatalogos = () =>
  useQuery({
    queryKey: queryKeys.configuracion,
    queryFn: () => configuracionService.getCatalogos(),
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
