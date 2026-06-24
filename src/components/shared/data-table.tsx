"use client";

import { Search } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableColumn<TData> {
  key: string;
  header: string;
  cell: (row: TData) => ReactNode;
  className?: string;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  loading?: boolean;
  searchAccessor?: (row: TData) => string | string[];
  searchPlaceholder?: string;
  searchLabel?: string;
  statusAccessor?: (row: TData) => string;
  statusOptions?: string[];
  /**
   * Devuelve la fecha (ISO) de la fila. Si se provee, habilita el filtro por
   * rango de fechas y ordena los registros de forma descendente (más reciente
   * primero).
   */
  dateAccessor?: (row: TData) => string | null | undefined;
  dateLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const toDateKey = (value: string | null | undefined) => {
  if (!value) return "";
  // Soporta ISO completo ("2026-06-20T14:30:00") o fecha simple ("2026-06-20").
  return value.slice(0, 10);
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  loading,
  searchAccessor,
  searchPlaceholder = "Buscar registros",
  searchLabel = "Buscar en la tabla",
  statusAccessor,
  statusOptions = [],
  dateAccessor,
  dateLabel = "Fecha de creación",
  emptyTitle = "No hay datos",
  emptyDescription = "No se encontraron registros para mostrar.",
}: DataTableProps<TData>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredData = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm);

    const result = data.filter((row) => {
      if (statusAccessor && statusFilter !== "all" && statusAccessor(row) !== statusFilter) {
        return false;
      }

      if (dateAccessor && (dateFrom || dateTo)) {
        const rowDate = toDateKey(dateAccessor(row));
        if (!rowDate) return false;
        if (dateFrom && rowDate < dateFrom) return false;
        if (dateTo && rowDate > dateTo) return false;
      }

      if (searchAccessor && normalizedSearchTerm.length > 0) {
        const searchValue = searchAccessor(row);
        const haystack = Array.isArray(searchValue) ? searchValue.join(" ") : searchValue;
        if (!normalizeText(haystack).includes(normalizedSearchTerm)) {
          return false;
        }
      }

      return true;
    });

    if (dateAccessor) {
      return [...result].sort((a, b) =>
        toDateKey(dateAccessor(b)).localeCompare(toDateKey(dateAccessor(a))),
      );
    }

    return result;
  }, [data, searchAccessor, searchTerm, statusAccessor, statusFilter, dateAccessor, dateFrom, dateTo]);

  const hasActiveFilters =
    Boolean(searchAccessor && searchTerm.trim()) ||
    Boolean(statusAccessor && statusFilter !== "all") ||
    Boolean(dateAccessor && (dateFrom || dateTo));

  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-4">
      {searchAccessor || (statusAccessor && statusOptions.length > 0) || dateAccessor ? (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/40 p-3">
          {searchAccessor ? (
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                aria-label={searchLabel}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          ) : null}

          {statusAccessor && statusOptions.length > 0 ? (
            <div className="min-w-[220px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {dateAccessor ? (
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-date-from">
                  {dateLabel}: desde
                </label>
                <Input
                  id="filter-date-from"
                  type="date"
                  className="w-[160px]"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-date-to">
                  hasta
                </label>
                <Input
                  id="filter-date-to"
                  type="date"
                  className="w-[160px]"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Limpiar filtros
            </Button>
          ) : null}

          <p className="text-xs text-muted-foreground sm:ml-auto">
            Mostrando {filteredData.length} de {data.length}
          </p>
        </div>
      ) : null}

      {filteredData.length === 0 ? (
        <EmptyState
          title={data.length === 0 ? emptyTitle : "Sin coincidencias"}
          description={
            data.length === 0
              ? emptyDescription
              : "No existen registros que coincidan con los filtros aplicados."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={getRowId(row)} className="transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
