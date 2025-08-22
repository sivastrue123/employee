import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { ColumnDef } from "@tanstack/react-table";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Attendance } from "utils/attendanceData";

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "attendanceDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          {column.getIsSorted()
            ? column.getIsSorted() === "desc"
              ? " 🔽"
              : " 🔼"
            : ""}
        </Button>
      );
    },
    cell: ({ row }) => {format(parseISO(row.original.attendanceDate), "PPP")}, // Format date nicely
    filterFn: (row, columnId, filterValue: { from?: Date; to?: Date }) => {
      // Custom filter function for date range
      const dateString = row.getValue(columnId) as string;
      const date = parseISO(dateString);

      if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // No filter applied
      }

      const { from, to } = filterValue;

      if (from && to) {
        return isWithinInterval(date, { start: from, end: to });
      }
      if (from) {
        return date >= from;
      }
      if (to) {
        return date <= to;
      }
      return true;
    },
  },
  {
    accessorKey: "clockIn",
    header: "Clock In",
  },
  {
    accessorKey: "clockOut",
    header: "Clock Out",
  },
    {
    accessorKey: "worked",
    header: " Total Hours Worked",
  },
  {
    accessorKey: "ot",
    header: "OT",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "Present" | "Absent";
      const variant = status === "Present" ? "default" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];
