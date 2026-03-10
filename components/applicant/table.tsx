"use client";
import {CommonDataTable} from "@/components/table/data-table";
import {
  ColumnFiltersState,
  getCoreRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import React, {useState} from "react";
import {useDebouncedValue} from "@wojtekmaj/react-hooks";
import {useQuery} from "@tanstack/react-query";
import {useBookColumn} from "./column";
import {DataTableToolbar} from "./data-table-toolbar";
import { getApplicants } from "@/query/get-applicants";


type Props = {};

const ApplicantTable = (props: Props) => {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const deboundedFilter = useDebouncedValue(columnFilters, 500);

  //   const { columns } = useCategoryTableColumn();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { columns } = useBookColumn();

  const { data: result, isLoading } = useQuery({
    queryKey: ['applicant', pagination, sorting, deboundedFilter],
    queryFn: async () =>
      await getApplicants(pagination, sorting, deboundedFilter),
  });

  const tableData: any[] = result ? result.data ?? [] : [];

  const tableDataCount: number = result ? result.count ?? 0 : 0;
  const table = useReactTable({
    data: tableData,
    columns: columns,
    rowCount: tableDataCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnPinning: {
        left: ["select", "sn"],
        right: ["actions"],
      },
      pagination,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} totalCount={tableDataCount}></DataTableToolbar>
      <CommonDataTable isLoading={isLoading} table={table} columns={columns} />
    </div>
  );
};

export default ApplicantTable;