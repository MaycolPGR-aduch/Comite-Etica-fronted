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
  emptyTitle?: string;
  emptyDescription?: string;
}

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
  emptyTitle = "No hay datos",
  emptyDescription = "No se encontraron registros para mostrar.",
}: DataTableProps<TData>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm);

    return data.filter((row) => {
      if (statusAccessor && statusFilter !== "all" && statusAccessor(row) !== statusFilter) {
        return false;
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
  }, [data, searchAccessor, searchTerm, statusAccessor, statusFilter]);

  const hasActiveFilters =
    Boolean(searchAccessor && searchTerm.trim()) || Boolean(statusAccessor && statusFilter !== "all");

  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-4">
      {searchAccessor || (statusAccessor && statusOptions.length > 0) ? (
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

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
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
