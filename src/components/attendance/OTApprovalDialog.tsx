// components/attendance/OTApprovalDialog.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select as SSelect,
  SelectContent as SSelectContent,
  SelectItem as SSelectItem,
  SelectTrigger as SSelectTrigger,
  SelectValue as SSelectValue,
} from "@/components/ui/select";
import { fmtDay } from "../../../utils/attendanceData";
import { AttendanceRow, OTStatus } from "@/types/attendanceTypes";

type Props = {
  open: boolean;
  row: AttendanceRow | null;
  value: OTStatus;
  onValueChange: (v: OTStatus) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const OTApprovalDialog: React.FC<Props> = ({
  open,
  row,
  value,
  onValueChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Overtime Approval</DialogTitle>
          <DialogDescription>
            Validate and confirm the OT disposition for this entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            <div>
              <span className="font-medium">Employee:</span>{" "}
              {row?.employeeName ?? "—"}
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              {fmtDay(row?.attendanceDate)}
            </div>
            <div>
              <span className="font-medium">OT:</span> {row?.ot ?? "—"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Current:</span>
              {row?.otStatus ? (
                <Badge
                  variant={
                    row.otStatus === "Approved"
                      ? "default"
                      : row.otStatus === "Rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className="uppercase tracking-wide"
                >
                  {row.otStatus}
                </Badge>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="otStatusSelect">Set new status</Label>
            <SSelect value={value} onValueChange={onValueChange}>
              <SSelectTrigger id="otStatusSelect" className="w-full">
                <SSelectValue placeholder="Choose status" />
              </SSelectTrigger>
              <SSelectContent>
                <SSelectItem value="Pending">Pending</SSelectItem>
                <SSelectItem value="Approved">Approved</SSelectItem>
                <SSelectItem value="Rejected">Rejected</SSelectItem>
              </SSelectContent>
            </SSelect>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button className="!bg-sky-500 !text-white" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTApprovalDialog;
