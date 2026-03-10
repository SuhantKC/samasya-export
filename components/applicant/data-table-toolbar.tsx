"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Table } from "@tanstack/react-table";
import { Download, ListRestart, Search, Trash2Icon, Calendar, User, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { ApplicantWithData } from "./column";
import { getCooperatives } from "@/query/get-cooperatives";
import { exportToCSV } from "@/lib/export-csv";
import { getAllApplicantsForExport } from "@/query/get-applicants";
import { Loader2 } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  totalCount?: number;
}

export function DataTableToolbar<TData>({
  table,
  totalCount = 0,
}: DataTableToolbarProps<TData>) {
  const [cooperatives, setCooperatives] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getCooperatives().then(setCooperatives);
  }, []);

  const calculateAmounts = (applicant: ApplicantWithData) => {
    const sumStr = (arr: any[], key: string) => 
      arr.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
    const sumInt = (arr: any[], key: string) => 
      arr.reduce((sum, item) => sum + (item[key] || 0), 0);

    return {
      "Saving Amount": sumInt(applicant.applicants_applicantsaving, 'saving_amount'),
      "Fixed Saving Amount": sumInt(applicant.applicants_applicantfixedsaving, 'fixed_saving_amount'),
      "Share Total Amount": sumStr(applicant.applicants_applicantshare, 'share_total_amount'),
      "Apartment Booking Deposit": sumStr(applicant.applicants_applicantapartment, 'booking_deposit_amount'),
      "Apartment Due Amount": sumStr(applicant.applicants_applicantapartment, 'due_amount'),
      "Government Loan Due": sumStr(applicant.applicants_applicantgovloan, 'loan_due_amount'),
      "Investment Principal": sumStr(applicant.applicants_applicantinvestment, 'principal_amount'),
      "Investment Due Amount": sumStr(applicant.applicants_applicantinvestment, 'inv_due_amount'),
      "Org Investment Principal": sumStr(applicant.applicants_applicantorginvestment, 'org_due_principal'),
      "Org Investment Due": sumStr(applicant.applicants_applicantorginvestment, 'org_due_amount'),
      "Other Claim Amount": sumStr(applicant.applicants_applicantotherdue, 'other_claim_amount'),
    };
  };

  const handleExportRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    
    let rowsToExport: ApplicantWithData[] = [];

    if (selectedRows.length > 0) {
      rowsToExport = selectedRows.map(r => r.original as ApplicantWithData);
    } else {
      // Export All Filtered
      try {
        setIsExporting(true);
        const filters = table.getState().columnFilters;
        const allData = await getAllApplicantsForExport(filters);
        rowsToExport = allData as unknown as ApplicantWithData[];
      } catch (error) {
        toast.error("Failed to fetch data for export");
        return;
      } finally {
        setIsExporting(false);
      }
    }

    if (rowsToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const data = rowsToExport.map(item => {
      const amounts = calculateAmounts(item);
      return {
        "Applicant Name": item.applicant_name_en,
        "Phone": item.applicant_phone,
        "Citizenship Number": item.citizenship_number,
        "Gender": item.gender,
        "Date of Birth": item.dob,
        "State": item.locations_state?.name || "-",
        "Permanent District": item.locations_district_applicants_applicant_p_district_id_idTolocations_district?.name || "-",
        "Permanent Municipality": item.locations_municipality?.name || "-",
        "Permanent Ward No": item.p_ward_no,
        "Current District": item.locations_district_applicants_applicant_c_district_id_idTolocations_district?.name || "-",
        "Current Municipality": item.locations_municipality?.name || "-",
        "Current Ward No": item.c_ward_no || "-",
        "Bank Account Number": item.bank_account_number,
        "Bank Name": item.bank_name,
        "Bank Branch": item.bank_branch_name,
        ...amounts
      };
    });

    exportToCSV(data, `applicants-${Date.now()}`);
    toast.success("Exported successfully!");
  };

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <div className="flex flex-col gap-4 p-4 bg-background/95 rounded-xl border">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex items-center w-[250px] gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Name/Phone..."
            value={(table.getColumn("applicant_name_en")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("applicant_name_en")?.setFilterValue(event.target.value);
            }}
            className="h-9"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select
            onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "All"}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="P">Pending</SelectItem>
              <SelectItem value="A">Approved</SelectItem>
              <SelectItem value="R">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cooperative Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Cooperative:</span>
          <Select
            onValueChange={(value) => table.getColumn("cooperative_id")?.setFilterValue(value)}
            value={(table.getColumn("cooperative_id")?.getFilterValue() as string) ?? "All"}
          >
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Select Cooperative" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Cooperatives</SelectItem>
              {cooperatives.map((coop) => (
                <SelectItem key={coop.id.toString()} value={coop.id.toString()}>
                  {coop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select
            onValueChange={(value) => table.getColumn("created_at")?.setFilterValue(value)}
            value={(table.getColumn("created_at")?.getFilterValue() as string) ?? "All"}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Created At" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Time</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This week">This Week</SelectItem>
              <SelectItem value="This month">This Month</SelectItem>
              <SelectItem value="This year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-9"
          >
            <Trash2Icon className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportRows}
            disabled={isExporting}
            className="h-9"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isSelected 
              ? `Export Selected (${table.getFilteredSelectedRowModel().rows.length})` 
              : `Export All (${totalCount})`
            }
          </Button>
        </div>
      </div>

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
          <div>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="h-8 hover:text-destructive"
          >
            <ListRestart className="mr-2 h-4 w-4" /> Deselect All
          </Button>
        </div>
      )}
    </div>
  );
}
