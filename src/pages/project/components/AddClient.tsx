// components/clients/AddClientSheet.tsx
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import ReactSelect from "react-select";
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
import { Plus } from "lucide-react";
import { Option, ProjectWithTasks } from "@/types/projectTypes";
import { toISOFromDateInput } from "../../../../utils/projectUtils.js";
import { createClinet } from "@/api/createClient"; // assuming your API spelling
import { useAuth } from "@/context/AuthContext";

// normalizing to your site's canonical status
type CanonicalProjectStatus = "On Track" | "At Risk" | "Blocked";

interface AddClientSheetProps {
  onCreated?: (project: ProjectWithTasks) => void;
  employeeOptions: Option[];
}

export const AddClient: React.FC<AddClientSheetProps> = ({
  onCreated,
  employeeOptions,
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ownerOpt, setOwnerOpt] = useState<any>();
  const [team, setTeam] = useState("");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<CanonicalProjectStatus>("On Track");
  const [due, setDue] = useState<string>("");

  const reset = () => {
    setName("");
    setOwnerOpt(undefined);
    setTeam("");
    setTags("");
    setProgress(0);
    setStatus("On Track");
    setDue("");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const newProject: ProjectWithTasks = {
      name: name.trim(),
      owner: ownerOpt?.label ?? "—",
      team: team.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      progress: Math.max(0, Math.min(100, Number(progress) || 0)),
      status, // normalized statuses
      dueDate: toISOFromDateInput(due) ?? new Date().toISOString(),
      tasks: [],
    };

    // Persist to backend
    const response = await createClinet(newProject, user?.employee_id);
    // console.log(response);

    onCreated?.(newProject); // let parent hydrate UI
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
            Spin up a net-new client artifact. You can recalibrate fields
            post-MVP.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="np-name">Client Name</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="np-owner">Lead</Label>
            <ReactSelect
              components={animatedComponents}
              placeholder="Select Lead"
              options={employeeOptions}
              value={ownerOpt}
              onChange={(selected: any) => setOwnerOpt(selected ?? undefined)}
            />
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
            <Select
              value={status}
              onValueChange={(v: CanonicalProjectStatus) => setStatus(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On Track">On Track</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
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
          <Button onClick={handleCreate} className="!bg-sky-500">
            Create Client
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
