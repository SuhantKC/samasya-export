"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { useQueryClient } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";

export type ApplicantWithData = Prisma.applicants_applicantGetPayload<{
  include: {
    applicants_applicantapartment: true;
    applicants_applicantdocument: true;
    applicants_applicantfixedsaving: true;
    applicants_applicantgovloan: true;
    applicants_applicantinvestment: true;
    applicants_applicantmortgageinvestment: true;
    applicants_applicantorginvestment: true;
    applicants_applicantorgmortgageinvestment: true;
    applicants_applicantotherdue: true;
    applicants_applicantsaving: true;
    applicants_applicantshare: true;
    cooperatives_branch: true;
    cooperatives_cooperative: true;
    locations_state: true;
    locations_district_applicants_applicant_c_district_id_idTolocations_district: true;
    locations_district_applicants_applicant_p_district_id_idTolocations_district: true;
    locations_municipality: true;
  };
}>;
export const useBookColumn = () => {
  const queryClient = useQueryClient();

  const columns: ColumnDef<ApplicantWithData>[] = [
    {
      id: "select",
      size: 32,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] bg-white"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "applicant_name_en",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applicant Name" />
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "applicant_phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "citizenship_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Citizenship No." />
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gender" />
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "dob",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DOB" />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        // Map status codes to labels if needed, or just display
        const statusMap: Record<string, string> = {
          'P': 'Pending',
          'A': 'Approved',
          'R': 'Rejected'
        };
        return (
          <div className="capitalize">
            {statusMap[status] || status}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "cooperatives_cooperative.name",
      id: "cooperative",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cooperative" />
      ),
      cell: ({ row }) => {
        return row.original.cooperatives_cooperative?.name || "-";
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString();
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "cooperative_id",
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "applicant_phone",
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
  ];
  return { columns };
};
