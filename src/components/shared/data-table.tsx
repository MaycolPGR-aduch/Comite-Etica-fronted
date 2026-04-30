"use client";

import { ReactNode, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
  statusAccessor?: (row: TData) => string;
  statusOptions?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  loading,
  statusAccessor,
  statusOptions = [],
  emptyTitle = "No hay datos",
  emptyDescription = "No se encontraron registros para mostrar.",
}: DataTableProps<TData>) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = useMemo(() => {
    if (!statusAccessor || statusFilter === "all") {
      return data;
    }

    return data.filter((row) => statusAccessor(row) === statusFilter);
  }, [data, statusAccessor, statusFilter]);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando informacion...</p>;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-4">
      {statusAccessor && statusOptions.length > 0 ? (
        <div className="max-w-xs">
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

      {filteredData.length === 0 ? (
        <EmptyState
          title="Sin coincidencias"
          description="No existen registros para el estado seleccionado."
        />
      ) : (
        <div className="rounded-lg border border-slate-200">
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
                <TableRow key={getRowId(row)}>
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
