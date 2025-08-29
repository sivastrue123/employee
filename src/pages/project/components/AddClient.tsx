// components/clients/AddClientSheet.tsx
import React, { useState, useMemo } from "react";
import ReactSelect from "react-select";
import { Plus } from "lucide-react";

import { animatedComponents } from "./TaskDialog.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { Option, ProjectWithTasks } from "@/types/projectTypes";
import { toISOFromDateInput } from "../../../../utils/projectUtils.js";
import { createClinet } from "@/api/createClient"; // keeping your API name
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/toast/ToastProvider"; // ✅ your in-house toast

interface AddClientSheetProps {
  onCreated?: () => void;
  employeeOptions: Option[];
}

export const AddClient: React.FC<AddClientSheetProps> = ({
  onCreated,
  employeeOptions,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ownerOpt, setOwnerOpt] = useState<Option | undefined>();
  const [team, setTeam] = useState("");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<any>("NOT STARTED");
  const [due, setDue] = useState<string>("");

  // touched state gates when errors appear
  const [touched, setTouched] = useState<{ name?: boolean; owner?: boolean }>({});

  const errors = useMemo(() => {
    const e: { name?: string; owner?: string } = {};
    if (!name.trim()) e.name = "Client name is required.";
    if (!ownerOpt?.value) e.owner = "Lead is required.";
    return e;
  }, [name, ownerOpt]);

  const isValid = Object.keys(errors).length === 0;

  const reset = () => {
    setName("");
    setOwnerOpt(undefined);
    setTeam("");
    setTags("");
    setProgress(0);
    setStatus("NOT STARTED");
    setDue("");
    setTouched({});
  };

  const handleCreate = async () => {
    if (!isValid) {
      // reveal errors + toast
      setTouched({ name: true, owner: true });
      const missing = [
        !name.trim() ? "Client Name" : null,
        !ownerOpt?.value ? "Lead" : null,
      ]
        .filter(Boolean)
        .join(" and ");
      toast.error(`${missing} ${missing.includes(" and ") ? "are" : "is"} required.`, {
        title: "Missing required fields",
        durationMs: 4000,
        position: "top-center",
      });
      return;
    }

    const loadingId = toast.info("Standing up the client record…", {
      durationMs: 0,
      position: "top-center",
      dismissible: true,
    });

    try {
      const newProject: ProjectWithTasks = {
        name: name.trim(),
        owner: ownerOpt?.value as string, // required
        team: team.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        progress: Math.max(0, Math.min(100, Number(progress) || 0)),
        status,
        dueDate: toISOFromDateInput(due) ?? new Date().toISOString(),
        tasks: [],
      };

      const response = await createClinet(newProject, user?.employee_id);

      toast.remove(loadingId);
      // console.log(response)
      if (response?.status === 201 || response?.status === 200) {
        toast.success("Client created successfully.", {
          title: "All set",
          durationMs: 2000,
          position: "top-center",
        });
        onCreated?.();
        reset();
        setOpen(false);
      } else {
        toast.warning?.("The server responded unexpectedly.", {
          title: `Status ${response?.status ?? "—"}`,
          durationMs: 3000,
          position: "top-center",
        });
      }
    } catch (err: any) {
      toast.remove(loadingId);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "We couldn’t create the client right now.";
      toast.error(msg, {
        title: "Create failed",
        durationMs: 4500,
        position: "top-center",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <SheetTrigger asChild>
        <Button className="gap-2 !bg-sky-500">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl !p-4 !overflow-auto">
        <SheetHeader>
          <SheetTitle>Create Client</SheetTitle>
          <SheetDescription>
            Spin up a net-new client artifact. You can recalibrate fields post-MVP.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-4">
          {/* Client Name (required) */}
          <div className="grid gap-2">
            <Label htmlFor="np-name">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-required="true"
              aria-invalid={!!errors.name}
              placeholder="e.g., Acme Corp"
            />
            {touched.name && errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Lead (required) */}
          <div className="grid gap-2">
            <Label htmlFor="np-owner">
              Lead <span className="text-red-500">*</span>
            </Label>
            <ReactSelect
              inputId="np-owner"
              components={animatedComponents}
              placeholder="Select Lead"
              options={employeeOptions}
              value={ownerOpt}
              onChange={(selected: any) => setOwnerOpt(selected ?? undefined)}
              onBlur={() => setTouched((t) => ({ ...t, owner: true }))}
              classNamePrefix="rs"
              aria-invalid={!!errors.owner}
              aria-required="true"
            />
            {touched.owner && errors.owner && (
              <p className="text-xs text-red-500">{errors.owner}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="np-team">Team</Label>
            <Input
              id="np-team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="np-tags">Tags (comma separated)</Label>
            <Input
              id="np-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="api, design, billing"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="np-progress">Progress (%)</Label>
            <Input
              id="np-progress"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT STARTED">Not Started</SelectItem>
                <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem> {/* fixed label */}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="np-due">Due Date</Label>
            <Input
              id="np-due"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="ghost">Cancel</Button>
          </SheetClose>
          <Button
            onClick={handleCreate}
            className="!bg-sky-500"
            disabled={!isValid}
            aria-disabled={!isValid}
            title={!isValid ? "Fill required fields to proceed" : undefined}
          >
            Create Client
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
