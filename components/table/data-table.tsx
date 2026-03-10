import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTablePagination } from "./data-table-pagination";
import {
  Column,
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "../ui/skeleton"; // Make sure you have this import

type CommonDataTableProps<TData, TValue> = {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  onCellDoubleClick?: (row: TData, columnId: string) => void;
  isLoading?: boolean;
  skeletonRows?: number;
};

const getCommonPinningStyles = (column: Column<any>): React.CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
      ? "4px 0 4px -4px gray inset"
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    minWidth: column.getSize(),
    maxWidth: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

export function CommonDataTable<TData, TValue>({
  table,
  columns,
  onCellDoubleClick,
  isLoading = false,
  skeletonRows = 5,
}: CommonDataTableProps<TData, TValue>) {
  return (
    <>
      <div className="custom-table flex flex-col flex-grow rounded-md border relative overflow-y-scroll max-h-[calc(100vh-330px)]">
        <Table className="bg-card">
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="bg-background/95 sticky top-0 z-10"
                    style={{ ...getCommonPinningStyles(header.column) }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="min-h-24">
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {table.getHeaderGroups()[0].headers.map((header) => (
                    <TableCell
                      key={`skeleton-cell-${header.id}-${rowIndex}`}
                      style={{ ...getCommonPinningStyles(header.column) }}
                    >
                      <Skeleton className="h-6 w-full rounded-2xl" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table?.getRowModel()?.rows?.length > 0 ? (
              // Normal data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="bg-background/95"
                      style={{ ...getCommonPinningStyles(cell.column) }}
                      onDoubleClick={() =>
                        onCellDoubleClick?.(row.original, cell.column.id)
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && <DataTablePagination table={table} />}
    </>
  );
}
