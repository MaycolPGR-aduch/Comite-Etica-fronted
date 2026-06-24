export interface RequiredDocumentDefinition {
  key: string;
  label: string;
  tipoDocumento: string;
}

export const DOCUMENTOS_POR_TIPO_TRAMITE = {
  protocolo_estudiante: [
    {
      key: "protocolo",
      label: "Proyecto de investigacion",
      tipoDocumento: "protocolo",
    },
    {
      key: "consentimiento",
      label: "Consentimiento informado",
      tipoDocumento: "consentimiento",
    },
    {
      key: "carta",
      label: "Carta de presentacion",
      tipoDocumento: "carta",
    },
    {
      key: "instrumentos",
      label: "Instrumentos de recoleccion",
      tipoDocumento: "instrumentos",
    },
    {
      key: "boleta_pago",
      label: "Boleta de pago de tramite",
      tipoDocumento: "boleta_pago",
    },
  ],
  protocolo_tesista: [
    {
      key: "protocolo",
      label: "Proyecto de investigacion",
      tipoDocumento: "protocolo",
    },
    {
      key: "boleta_pago",
      label: "Boleta de pago de tramite",
      tipoDocumento: "boleta_pago",
    },
  ],
} as const;

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export const getRequiredDocumentsByTipoTramite = (
  tipoTramite?: string | null,
): RequiredDocumentDefinition[] => {
  const key = normalize(tipoTramite);
  if (key === "protocolo_tesista") {
    return [...DOCUMENTOS_POR_TIPO_TRAMITE.protocolo_tesista];
  }

  return [...DOCUMENTOS_POR_TIPO_TRAMITE.protocolo_estudiante];
};
