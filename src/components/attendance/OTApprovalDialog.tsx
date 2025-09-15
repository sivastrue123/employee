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
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Overtime Approval
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Review the employee’s OT request and set the appropriate status.
          </DialogDescription>
        </DialogHeader>

        {/* Employee Details */}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Employee</span>
            <span>{row?.employeeName ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Date</span>
            <span>{fmtDay(row?.attendanceDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">OT Hours</span>
            <span>{row?.ot ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">Current Status</span>
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

        {/* Status Selector */}
        <div className="space-y-2">
          <Label htmlFor="otStatusSelect">Set New Status</Label>
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

        {/* Footer Actions */}
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="!bg-sky-600 text-white hover:bg-sky-700"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTApprovalDialog;
