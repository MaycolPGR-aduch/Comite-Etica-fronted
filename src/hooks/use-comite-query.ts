"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  asignacionService,
  authService,
  configuracionService,
  consolidacionService,
  dashboardService,
  evaluacionService,
  expedientesService,
  revisionAdministrativaService,
} from "@/services";
import type {
  Evaluacion,
  ExpedienteStatus,
  LoginPayload,
  Recommendation,
  RiskLevel,
} from "@/types";

export const queryKeys = {
  expedientes: (status?: ExpedienteStatus) => ["expedientes", status] as const,
  expediente: (id: string) => ["expediente", id] as const,
  dashboardInvestigador: ["dashboard", "investigador"] as const,
  bandejaSecretaria: ["dashboard", "secretaria"] as const,
  dashboardCoordinador: ["dashboard", "coordinador"] as const,
  bandejaEvaluador: (id: string) => ["dashboard", "evaluador", id] as const,
  asignacionContexto: (id: string) => ["asignacion", id] as const,
  evaluadores: ["evaluadores"] as const,
  consolidacion: (id: string) => ["consolidacion", id] as const,
  configuracion: ["configuracion"] as const,
};

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
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
  useMutation({ mutationFn: asignacionService.asignarEvaluadores });

export const useBandejaEvaluador = (evaluadorId: string) =>
  useQuery({
    queryKey: queryKeys.bandejaEvaluador(evaluadorId),
    queryFn: () => evaluacionService.getBandejaEvaluador(evaluadorId),
    enabled: Boolean(evaluadorId),
  });

export const useContextoEvaluacion = (id: string) =>
  useQuery({
    queryKey: ["evaluacion", id],
    queryFn: () => evaluacionService.getContextoEvaluacion(id),
    enabled: Boolean(id),
  });

export const useGuardarEvaluacion = () =>
  useMutation({
    mutationFn: (payload: {
      expedienteId: string;
      evaluadorId: string;
      riesgo: RiskLevel;
      recomendacion: Recommendation;
      secciones: Evaluacion["secciones"];
      enviar: boolean;
    }) => evaluacionService.saveEvaluacion(payload),
  });

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
