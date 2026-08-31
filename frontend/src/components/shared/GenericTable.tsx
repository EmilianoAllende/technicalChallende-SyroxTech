import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
}

export function GenericTable<T extends { id: number | string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
}: GenericTableProps<T>) {
  return (
    <div className="rounded-md border border-amber-200 dark:border-[#5c2b07] bg-amber-50/60 dark:bg-[#3d1c04]/40 overflow-hidden">
      <Table>
        <TableHeader className="bg-black/5 dark:bg-black/20">
          <TableRow className="border-b-amber-200 dark:border-b-[#5c2b07]">
            {columns.map((col) => (
              <TableHead key={col.key} className="font-semibold text-slate-800 dark:text-slate-200">
                {col.header}
              </TableHead>
            ))}
            {(onView || onEdit || onDelete) && (
              <TableHead className="text-right font-semibold text-slate-800 dark:text-slate-200">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center h-24 text-slate-500">
                No hay resultados.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="hover:bg-black/5 dark:hover:bg-black/20 transition-colors border-b-amber-200/50 dark:border-b-[#5c2b07]/50">
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableCell className="text-right space-x-2">
                    {onView && (
                      <Button variant="ghost" size="icon" onClick={() => onView(row)} title="Ver detalles">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(row)} title="Editar">
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(row)} title="Eliminar">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
