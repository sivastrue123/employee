// components/attendance/BulkMoreSheet.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Option } from "@/types/attendanceTypes";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employeeOptions: Option[];
  selectedEmployees: Option[];
  setSelectedEmployees: (opts: Option[]) => void;
  selectedStatus: Option | null;
  setSelectedStatus: (opt: Option | null) => void;
  attendanceStatus: Option[];
  reason: string;
  setReason: (s: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  // present-time fields
  clockInTime: string;
  setClockInTime: (s: string) => void;
  clockOutTime: string;
  setClockOutTime: (s: string) => void;
  clockInMeridiem: "AM" | "PM";
  setClockInMeridiem: (m: "AM" | "PM") => void;
  clockOutMeridiem: "AM" | "PM";
  setClockOutMeridiem: (m: "AM" | "PM") => void;

  // ISO preview (optional strings)
  clockInISO?: string | null;
  clockOutISO?: string | null;
};

const BulkMoreSheet: React.FC<Props> = ({
  open,
  onOpenChange,
  employeeOptions,
  selectedEmployees,
  setSelectedEmployees,
  selectedStatus,
  setSelectedStatus,
  attendanceStatus,
  reason,
  setReason,
  submitting,
  onSubmit,
  clockInTime,
  setClockInTime,
  clockOutTime,
  setClockOutTime,
  clockInMeridiem,
  setClockInMeridiem,
  clockOutMeridiem,
  setClockOutMeridiem,
  clockInISO,
  clockOutISO,
}) => {
  const animatedComponents = makeAnimated();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Absence Entry</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit}>
          <div className="p-2 space-y-4">
            <Label>Employees</Label>
            <Select<Option, true>
              components={animatedComponents}
              placeholder="Select Employees"
              isMulti
              options={employeeOptions}
              value={selectedEmployees}
              onChange={(selected) =>
                setSelectedEmployees(selected ? [...selected] : [])
              }
            />

            <Label>Attendance Status</Label>
            <Select<Option, false>
              closeMenuOnSelect
              components={animatedComponents}
              placeholder="Select Status"
              options={attendanceStatus}
              value={selectedStatus}
              onChange={(selected) => setSelectedStatus(selected)}
              isMulti={false}
            />

            {selectedStatus?.value === "Present" && (
              <div className="mt-2 space-y-3">
                <div>
                  <Label className="mb-1 block">Clock In (12-hour)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="hh:mm"
                      value={clockInTime}
                      onChange={(e) => setClockInTime(e.target.value)}
                      inputMode="numeric"
                      pattern="^(\d{1,2}):([0-5]\d)$"
                      className="w-32"
                    />
                    <select
                      className="border rounded px-2 py-2"
                      value={clockInMeridiem}
                      onChange={(e) =>
                        setClockInMeridiem(e.target.value as "AM" | "PM")
                      }
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block">Clock Out (12-hour)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="hh:mm"
                      value={clockOutTime}
                      onChange={(e) => setClockOutTime(e.target.value)}
                      inputMode="numeric"
                      pattern="^(\d{1,2}):([0-5]\d)$"
                      className="w-32"
                    />
                    <select
                      className="border rounded px-2 py-2"
                      value={clockOutMeridiem}
                      onChange={(e) =>
                        setClockOutMeridiem(e.target.value as "AM" | "PM")
                      }
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {clockInISO && (
                    <div>
                      Clock In → <code>{clockInISO}</code>
                    </div>
                  )}
                  {clockOutISO && (
                    <div>
                      Clock Out → <code>{clockOutISO}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Label>Reason</Label>
            <textarea
              className="w-full border-[2px]"
              maxLength={200}
              placeholder="Max 200 characters allowed"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              className="!bg-sky-500 !text-white !w-full"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default BulkMoreSheet;
