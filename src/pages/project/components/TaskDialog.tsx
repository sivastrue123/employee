import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import ReactSelect, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import {
  Employee,
  Task,
  Option,
  TaskPriority,
  TaskStatus,
  ChecklistItem,
} from "@/types/projectTypes";

export const animatedComponents = makeAnimated();

const genId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
const toISOFromDateInput = (val: string) =>
  val ? new Date(val + "T00:00:00").toISOString() : undefined;
const dateInputFromISO = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : ""; // yyyy-mm-dd
const Section: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div className="section-card mb-4">
      <div className="section-head">
        <div className="section-title">{title}</div>
        {subtitle ? <div className="section-subtitle">{subtitle}</div> : null}
      </div>
      <Separator className="my-2" />
      {children}
    </div>
  );
};

type TaskDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Task, "_id"> & { _id?: string }) => void;
  employees: Employee[];
  employeeOptions: Option[];
  initial?: Task | null;
};

type FieldErrors = Partial<{
  title: string;
  description: string;
  start: string;
  due: string;
  actualEnd: string;
  estHrs: string;
  actualHrs: string;
  assignees: string;
  status: string;
  priority: string;
}>;

// …imports unchanged…

// — Keep your types as-is —

export const TaskDialog: React.FC<TaskDialogProps> = ({
  mode,
  open,
  onClose,
  onSave,
  employees,
  employeeOptions,
  initial,
}) => {
  // ----- Core State -----
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    initial?.priority ?? "Medium"
  );
  const [status, setStatus] = useState<TaskStatus>(
    initial?.status ?? "Not Started"
  );
  const [start, setStart] = useState<string>(
    dateInputFromISO(initial?.startDate)
  );
  const [due, setDue] = useState<string>(dateInputFromISO(initial?.dueDate));
  const [actualEnd, setActualEnd] = useState<string>(
    dateInputFromISO(initial?.actualEndDate)
  );
  const [estHrs, setEstHrs] = useState<number | "">(
    initial?.estimatedHours ?? ""
  );
  const [assignees, setAssignees] = useState<Option[]>(
    initial?.assigneeEmployeeIds
      ? (initial.assigneeEmployeeIds
          .map((eid) => {
            const emp = employees.find((e) => e.employee_id === eid);
            return emp
              ? {
                  value: emp.employee_id,
                  label:
                    `${emp.first_name} ${emp.last_name}`.trim() || emp.email,
                }
              : null;
          })
          .filter(Boolean) as Option[])
      : []
  );
  const [draftChecklist, setDraftChecklist] = useState<string>("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initial?.checklist ?? []
  );

  // ----- Validation State -----
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>(
    {} as any
  );
  const [actualHrs, setActualHrs] = useState<number | "">(
    initial?.actualHours ?? ""
  ); // NEW

  // Refs for focus management
  const actualEndRef = useRef<HTMLInputElement | null>(null);

  // ----- Hydrate on open/initial changes (no auto-erroring) -----
  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(initial?.priority ?? "Medium");
    setStatus(initial?.status ?? "Not Started");
    setStart(dateInputFromISO(initial?.startDate));
    setDue(dateInputFromISO(initial?.dueDate));
    setActualEnd(dateInputFromISO(initial?.actualEndDate));
    setEstHrs(initial?.estimatedHours ?? "");
    setAssignees(
      initial?.assigneeEmployeeIds
        ? (initial.assigneeEmployeeIds
            .map((eid) => {
              const emp = employees.find((e) => e.employee_id === eid);
              return emp
                ? {
                    value: emp.employee_id,
                    label:
                      `${emp.first_name} ${emp.last_name}`.trim() || emp.email,
                  }
                : null;
            })
            .filter(Boolean) as Option[])
        : []
    );
    setChecklist(initial?.checklist ?? []);
    setErrors({});
    setTouched({} as any);
    setActualHrs(initial?.actualHours ?? "");
  }, [open, initial, employees]);

  // ----- Validators -----
  const isValidDate = (v: string) =>
    !!v && !Number.isNaN(new Date(v).getTime());
  const dateObj = (v?: string) => (v ? new Date(v) : undefined);

  const validateAll = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!title.trim()) next.title = "Title is required.";
    if (!start) next.start = "Start date is required.";
    if (!due) next.due = "Due date is required.";
    if (!assignees.length)
      next.assignees = "At least one assignee is required.";

    const dStart = isValidDate(start) ? dateObj(start)! : undefined;
    const dDue = isValidDate(due) ? dateObj(due)! : undefined;
    const dActual = isValidDate(actualEnd) ? dateObj(actualEnd)! : undefined;

    if (start && !dStart) next.start = "Start date is invalid.";
    if (due && !dDue) next.due = "Due date is invalid.";
    if (actualEnd && !dActual) next.actualEnd = "Actual end date is invalid.";

    if (dStart && dDue && dDue < dStart)
      next.due = "Due date cannot be before start date.";
    if (dStart && dActual && dActual < dStart)
      next.actualEnd = "Actual end cannot be before start date.";

    // Completion dependencies
    if (status === "Completed") {
      if (!actualEnd)
        next.actualEnd =
          "Actual end date is required when status is Completed.";
      if (actualHrs === "" || typeof actualHrs !== "number")
        next.actualHrs = "Actual hours are required when status is Completed.";
    }

    // Priority/Status guardrails
    const allowedPriorities: TaskPriority[] = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];
    const allowedStatuses: TaskStatus[] = [
      "Not Started",
      "In Progress",
      "Completed",
    ];
    if (!allowedPriorities.includes(priority))
      next.priority = "Invalid priority.";
    if (!allowedStatuses.includes(status)) next.status = "Invalid status.";

    // Numeric bounds
    if (estHrs !== "" && (typeof estHrs !== "number" || estHrs < 0)) {
      next.estHrs = "Estimated hours must be a non-negative number.";
    } else if (typeof estHrs === "number" && estHrs > 10000) {
      next.estHrs = "Estimated hours seems unrealistic.";
    }
    if (actualHrs !== "" && (typeof actualHrs !== "number" || actualHrs < 0)) {
      next.actualHrs = "Actual hours must be a non-negative number.";
    } else if (typeof actualHrs === "number" && actualHrs > 10000) {
      next.actualHrs = "Actual hours seems unrealistic.";
    }

    return next;
  };
  // Show only errors for fields that have been interacted with
  const revealTouchedErrors = (all: FieldErrors) => {
    const scoped: FieldErrors = {};
    (Object.keys(all) as (keyof FieldErrors)[]).forEach((k) => {
      if (touched[k]) scoped[k] = all[k];
    });
    return scoped;
  };

  const onFieldBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const all = validateAll();
    setErrors(revealTouchedErrors(all));
  };

  // ----- Checklist ops (unchanged, but add ids if you want stable keys) -----
  const addChecklistItem = () => {
    const t = draftChecklist.trim();
    if (!t) return;
    setChecklist((cur) => [...cur, { text: t, done: false }]);
    setDraftChecklist("");
  };
  const removeChecklistItem = (id: string) =>
    setChecklist((cur) => cur.filter((c) => c._id !== id));
  const toggleChecklistItemLocal = (id: string) =>
    setChecklist((cur) =>
      cur.map((c) => (c._id === id ? { ...c, done: !c.done } : c))
    );

  useEffect(() => {
    const needsActualEnd = status === "Completed" && !actualEnd;
    if (needsActualEnd && actualEndRef.current) {
      actualEndRef.current.focus();
    }
  }, [status, actualEnd]);

  // ----- Save flow -----
  const handleSave = () => {
    const all = validateAll();
    if (Object.keys(all).length > 0) {
      // force-touch all relevant fields so errors render
      setTouched({
        title: true,
        start: true,
        due: true,
        actualEnd: true,
        estHrs: true,
        actualHrs: true,
        assignees: true,
        status: true,
        priority: true,
        description: true,
      } as any);
      setErrors(all);
      return;
    }

    onSave({
      ...(initial?._id ? { _id: initial._id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      startDate: toISOFromDateInput(start),
      dueDate: toISOFromDateInput(due),
      actualEndDate: toISOFromDateInput(actualEnd),
      estimatedHours: typeof estHrs === "number" ? estHrs : undefined,
      actualHours: typeof actualHrs === "number" ? actualHrs : undefined,
      assigneeEmployeeIds: assignees.map((a) => a.value),
      checklist,
    });
    onClose();
  };

  const canSave = Object.keys(validateAll()).length === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-screen max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            Right-size scope, assign the A-team, and lock the dates.
          </DialogDescription>
        </DialogHeader>

        {/* DETAILS */}
        <Section
          title="Details"
          subtitle="Set the strategic context and guardrails."
        >
          <div className="grid gap-4">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="t-title">Task Title</Label>
              <Input
                id="t-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => onFieldBlur("title")}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea
                id="t-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => onFieldBlur("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Priority */}
              <div className="grid gap-1.5">
                <Label htmlFor="t-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v: TaskPriority) => setPriority(v)}
                >
                  <SelectTrigger
                    id="t-priority"
                    aria-invalid={!!errors.priority}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-xs text-red-500">{errors.priority}</p>
                )}
              </div>

              {/* Status */}
              <div className="grid gap-1.5">
                <Label htmlFor="t-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v: TaskStatus) => setStatus(v)}
                >
                  <SelectTrigger id="t-status" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status}</p>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* SCHEDULE */}
        <Section
          title="Schedule"
          subtitle="Align timelines to drive predictable delivery."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Start (Required) */}
            <div className="grid gap-1.5">
              <Label htmlFor="t-start">
                Start Date{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="t-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                onBlur={() => onFieldBlur("start")}
                aria-required="true"
                aria-invalid={!!errors.start}
              />
              {errors.start && (
                <p className="text-xs text-red-500">{errors.start}</p>
              )}
            </div>

            {/* Due (Required) */}
            <div className="grid gap-1.5">
              <Label htmlFor="t-due">
                Due Date{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="t-due"
                type="date"
                value={due}
                min={start || undefined}
                onChange={(e) => setDue(e.target.value)}
                onBlur={() => onFieldBlur("due")}
                aria-required="true"
                aria-invalid={!!errors.due}
              />
              {errors.due && (
                <p className="text-xs text-red-500">{errors.due}</p>
              )}
            </div>

            {/* Actual End (conditional) */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="t-actual">Actual End</Label>
                {status === "Completed" && (
                  <Badge variant="destructive" className="text-[10px]">
                    Required when Completed
                  </Badge>
                )}
              </div>
              <Input
                id="t-actual"
                type="date"
                ref={actualEndRef}
                value={actualEnd}
                min={start || undefined}
                onChange={(e) => setActualEnd(e.target.value)}
                onBlur={() => onFieldBlur("actualEnd")}
                aria-invalid={!!errors.actualEnd}
                className={
                  errors.actualEnd
                    ? "ring-2 ring-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {errors.actualEnd && (
                <p className="text-xs text-red-500">{errors.actualEnd}</p>
              )}
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="flex mt-3">
          <div className="grid gap-1.5 w-1/2 mr-2">
              <Label htmlFor="t-est">Estimated Hours</Label>
            <Input
              id="t-est"
              type="number"
              min={0}
              value={estHrs}
              onChange={(e) => {
                const v = e.target.value;
                setEstHrs(v === "" ? "" : Math.max(0, Number(v) || 0));
              }}
              onBlur={() => onFieldBlur("estHrs")}
              placeholder="e.g., 8"
              aria-invalid={!!errors.estHrs}
            />
            {errors.estHrs && (
              <p className="text-xs text-red-500">{errors.estHrs}</p>
            )}

          </div>
            <div className="grid gap-1.5 w-1/2 ml-2">
              <div className="flex items-center justify-between">
              <Label htmlFor="t-actual-hrs">Actual Hours</Label>
              {status === "Completed" && (
                <Badge variant="destructive" className="text-[10px]">
                  Required when Completed
                </Badge>
              )}
            </div>
            <Input
              id="t-actual-hrs"
              type="number"
              min={0}
              placeholder="e.g., 6.5"
              value={actualHrs}
              onChange={(e) => {
                const v = e.target.value;
                setActualHrs(v === "" ? "" : Math.max(0, Number(v) || 0));
              }}
              onBlur={() => onFieldBlur("actualHrs")}
              aria-invalid={!!errors.actualHrs}
              className={
                errors.actualHrs ? "ring-2 ring-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.actualHrs && (
              <p className="text-xs text-red-500">{errors.actualHrs}</p>
            )}
            </div>
          </div>
        </Section>

        {/* ASSIGNMENT (Required) */}
        <Section
          title="Assignment"
          subtitle="Orchestrate the right talent against the right work."
        >
          <div className="grid gap-1.5">
            <Label>
              Assignees{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </Label>
            <ReactSelect
              components={animatedComponents}
              placeholder="Select Employees"
              isMulti
              options={employeeOptions}
              value={assignees}
              onChange={(selected) => {
                setAssignees(
                  selected ? [...(selected as MultiValue<Option>)] : []
                );
              }}
              onBlur={() => onFieldBlur("assignees")}
              classNamePrefix="rs"
              aria-invalid={!!errors.assignees}
              aria-required="true"
            />
            {errors.assignees && (
              <p className="text-xs text-red-500">{errors.assignees}</p>
            )}
            {assignees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {assignees.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* CHECKLIST (unchanged) */}
        <Section
          title="Checklist"
          subtitle="Break work into actionable, shippable units."
        >
          <div className="flex gap-2">
            <Input
              placeholder="Add checklist item"
              value={draftChecklist}
              onChange={(e) => setDraftChecklist(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="!bg-black !text-white"
              onClick={addChecklistItem}
            >
              Add
            </Button>
          </div>

          {checklist.length > 0 && (
            <div className="mt-3 grid gap-2">
              {checklist.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded border bg-white p-2 text-sm"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={c.done}
                      onChange={() => toggleChecklistItemLocal(c._id as string)}
                    />
                    <span
                      className={c.done ? "line-through text-slate-500" : ""}
                    >
                      {c.text}
                    </span>
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChecklistItem(c._id as string)}
                  >
                    <Trash2 className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="!bg-blue-500"
            disabled={!canSave}
          >
            {mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </div>

        {/* Lightweight section styling (unchanged) */}
        <style>{`
          .section-card { border: 1px solid rgba(0,0,0,0.06); border-radius: 10px; background: white; padding: 14px; }
          .section-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; }
          .section-title { font-weight: 600; font-size: 0.95rem; }
          .section-subtitle { color: rgb(100,116,139); font-size: 0.8rem; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
