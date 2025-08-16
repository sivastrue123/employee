import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Project } from "utils/projectData";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export const columns: ColumnDef<Project>[] = [
  //   {
  //     id: "actions",
  //     cell: ({ row }) => {
  //       const project = row.original;

  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem
  //               onClick={() => navigator.clipboard.writeText(project.projectName)}
  //             >
  //               ProjectName
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>View customer</DropdownMenuItem>
  //             <DropdownMenuItem>View payment details</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     },
  //   },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        //   className="w-4 h-4 rounded-md !text-black !data-[state=checked]:bg-black"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("projectName")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="!text-center"> Status</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "projectDescription",
    header: () => <div className="!text-center">Description</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("projectDescription")}</div>
    ),
  },
  {
    accessorKey: "totalMembers",
    header: () => <div className="!text-center"> Total Members</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("totalMembers")}</div>
    ),
  },
  {
    accessorKey: "progress",
    header: () => <div className="!text-center">Progress</div>,
    cell: ({ row }) => (
      <Progress className="text-center" value={row.getValue("progress")}>
        {row.getValue("progress")}
      </Progress>
    ),
  },
  {
    accessorKey: "startDate",
    header: () => <div className="!text-center">Start Date</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("startDate")}</div>
    ),
  },
  {
    accessorKey: "endDate",
    header: () => <div className="!text-center">End Date</div>,
    cell: ({ row }) => {
      const endDate: any = row.getValue("endDate");
      if (!endDate || endDate === " ") {
        return <div className="text-center ">-</div>;
      } else {
        return <div className="text-center ">{endDate}</div>;
      }
    },
  },
  {
    accessorKey: "manager",
    header: () => <div className="!text-center">Manager</div>,
    cell: ({ row }) => {
      const manager: any = row.getValue("manager");
      return <div className="text-center font-medium">{manager.name}</div>;
    },
  },
  {
    accessorKey: "teamMembers",
    header: () => <div className="!text-center"> Team Members</div>,
    cell: ({ row }) => {
      const TeamMembers: any = row.getValue("teamMembers");
      return (
        <div className="flex justify-center -space-x-3">
          {TeamMembers && TeamMembers.length > 0 ? (
            TeamMembers.length <= 2 ? (
              TeamMembers.map((member: any, index: number) => (
                <img
                  key={index}
                  className="h-8 w-8 rounded-full ring ring-white"
                  src={member.imgSrc}
                  alt={member.name}
                />
              ))
            ) : (
              <>
                <img
                  className="h-8 w-8 rounded-full ring ring-white"
                  src={TeamMembers[0].imgSrc}
                  alt={TeamMembers[0].name}
                />
                <img
                  className="h-8 w-8 rounded-full ring ring-white"
                  src={TeamMembers[1].imgSrc}
                  alt={TeamMembers[1].name}
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 font-semibold text-white ring ring-white">
                  {TeamMembers.length - 2}
                </div>
              </>
            )
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 font-semibold text-white ring ring-white">
              <Avatar className="h-8 w-8">
                <AvatarImage src={""} />
                <AvatarFallback className="!bg-gray-300 !text-white !font-semibold">
                  N/A
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "budget",
    header: () => <div className="text-center">Budget</div>,
    cell: ({ row }) => {
      const amount: any = row.getValue("budget");

      let formatted;
      if (amount && amount?.allocated) {
        formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(parseFloat(amount?.allocated));
      } else {
        formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(0);
      }
      return <div className="text-center font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "lastUpdated",
    header: () => <div className="!text-center">Last Updated</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("lastUpdated")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: () => <div className="!text-center">Created On</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("createdOn")}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: () => <div className="!text-center">Created By</div>,
    cell: ({ row }) => {
      const createdBy: any = row.getValue("createdBy");
      return <div className="text-center font-medium">{createdBy.name}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(project.projectName)}
            >
              Copy Project Name
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
