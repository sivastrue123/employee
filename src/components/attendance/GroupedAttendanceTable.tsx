// components/attendance/GroupedAttendanceTable.tsx
import React from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDateTime, fmtDay } from "../../../utils/attendanceData";
import { AttendanceRow } from "@/types/attendanceTypes";

type Props = {
  groups: Map<string, AttendanceRow[]>;
  openGroups: Record<string, boolean>;
  toggleGroup: (k: string) => void;

  // header toggle-all
  allOpen: boolean;
  toggleAllGroups: () => void;

  // infinite scroll
  attachTriggerRef: (flatIndex: number) => (el: HTMLTableRowElement | null) => void;
  loadingMore: boolean;
  hasMore: boolean;
  rowsLength: number;

  // actions
  onOpenOTDialog: (row: AttendanceRow) => void;
};

const GroupedAttendanceTable: React.FC<Props> = ({
  groups,
  openGroups,
  toggleGroup,
  allOpen,
  toggleAllGroups,
  attachTriggerRef,
  loadingMore,
  hasMore,
  rowsLength,
  onOpenOTDialog,
}) => {
  return (
    <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="rounded-xl border bg-white shadow-sm">
      <div className="overflow-auto pr-12">
        <Table className="min-w-full text-sm">
          <TableHeader className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
            <TableRow>
              {/* Sticky Date header with expand/collapse-all */}
              <TableHead className="whitespace-nowrap sticky left-0 z-20 bg-slate-50">
                <button
                  type="button"
                  onClick={toggleAllGroups}
                  className="flex items-center gap-1 hover:text-slate-900 text-slate-700"
                  title={allOpen ? "Collapse all dates" : "Expand all dates"}
                >
                  Date
                  <ChevronsUpDown className={`h-4 w-4 transition-transform ${allOpen ? "rotate-180" : ""}`} />
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap">Employee Name</TableHead>
              <TableHead className="whitespace-nowrap">Department</TableHead>
              <TableHead className="whitespace-nowrap">Clock In</TableHead>
              <TableHead className="whitespace-nowrap">Clock Out</TableHead>
              <TableHead className="whitespace-nowrap">Total Hours Worked</TableHead>
              <TableHead className="whitespace-nowrap">OT</TableHead>
              <TableHead className="whitespace-nowrap">OT Status</TableHead>
              <TableHead className="whitespace-nowrap">OT Approval</TableHead>
              <TableHead className="whitespace-nowrap">Late</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created By</TableHead>
              <TableHead className="whitespace-nowrap">Created On</TableHead>
              <TableHead className="whitespace-nowrap">Edited By</TableHead>
              <TableHead className="whitespace-nowrap">Edited On</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* groups */}
            {Array.from(groups.entries()).length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="h-56 text-center align-middle">
                  <div className="mx-auto max-w-sm">
                    <div className="mb-2 text-5xl">🗓️</div>
                    <div className="text-lg font-semibold text-slate-900">No results in this view</div>
                    <div className="mt-1 text-sm text-slate-600">Try widening your date range or clearing filters.</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (() => {
                let flatIndex = 0;
                const nodes: React.ReactNode[] = [];

                for (const [key, items] of Array.from(groups.entries())) {
                  const dayLabel = format(parseISO(items[0].attendanceDate), "PPP");
                  const open = !!openGroups[key];

                  // group header
                  nodes.push(
                    <TableRow key={`hdr-${key}`} className="bg-slate-50/70">
                      <TableCell colSpan={15} className="!p-0">
                        <div
                          className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => toggleGroup(key)}
                          role="button"
                        >
                          <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                          <span className="font-semibold">{dayLabel}</span>
                          <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                            {items.length} record{items.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );

                  // rows when open
                  if (open) {
                    for (const row of items) {
                      const refCb = attachTriggerRef(flatIndex);
                      flatIndex += 1;

                      nodes.push(
                        <TableRow key={row.id} ref={refCb} className="even:bg-slate-50/40 hover:bg-amber-50/60 transition-colors">
                          {/* sticky date cell */}
                          <TableCell className="font-medium sticky left-0 z-10 bg-white">{fmtDay(row.attendanceDate)}</TableCell>
                          <TableCell>{row.employeeName ?? "—"}</TableCell>
                          <TableCell>{row.employeeDepartment ?? "—"}</TableCell>
                          <TableCell>{row.clockIn == "" ? "—" : row.clockIn}</TableCell>
                          <TableCell>{row.clockOut == "" ? "—" : row.clockOut}</TableCell>
                          <TableCell>{row.worked ?? "—"}</TableCell>
                          <TableCell>{row.ot ?? "—"}</TableCell>
                          <TableCell>
                            {row.otStatus ? (
                              <Badge
                                variant={
                                  row.otStatus === "Approved" ? "default" : row.otStatus === "Rejected" ? "destructive" : "secondary"
                                }
                                className="uppercase tracking-wide"
                              >
                                {row.otStatus}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {row.ot ? (
                              <Button variant="outline" size="sm" onClick={() => onOpenOTDialog(row)} title="Review & approve OT">
                                Review
                              </Button>
                            ) : (
                              <span className="text-slate-400">No OT</span>
                            )}
                          </TableCell>
                          <TableCell>{row.late ?? "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={row.status === "Present" ? "default" : "destructive"}
                              className="uppercase tracking-wide"
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.createdBy?.name ?? "—"}</TableCell>
                          <TableCell>{fmtDateTime(row.createdAt)}</TableCell>
                          <TableCell>
                            {row.editedBy?.name == " " || !row.editedBy?.name ? "—" : row.editedBy?.name}
                          </TableCell>
                          <TableCell>{fmtDateTime(row.editedAt)}</TableCell>
                        </TableRow>
                      );
                    }
                  }
                }

                // tail loader / caught-up
                if (loadingMore && rowsLength > 9 && hasMore) {
                  nodes.push(
                    <TableRow key="loading-more">
                      <TableCell colSpan={15} className="py-4 text-center text-slate-500">
                        Loading more…
                      </TableCell>
                    </TableRow>
                  );
                }
                if (!hasMore && rowsLength >= 10) {
                  nodes.push(
                    <TableRow key="caught-up">
                      <TableCell colSpan={15} className="py-4 text-center text-slate-400">
                        You’re all caught up.
                      </TableCell>
                    </TableRow>
                  );
                }

                return nodes;
              })()
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default GroupedAttendanceTable;
