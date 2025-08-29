import React, { useMemo, useState, useEffect } from "react";
import { format, isAfter, parseISO } from "date-fns";
import {
  ArrowUpDown,
  CalendarIcon,
  Search,
  TagIcon,
  User2,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  PlusCircle,
  Trash2,
  CheckSquare,
  Edit3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { projectData, type ProjectStatus } from "../../../utils/projectData";
import axios from "axios";

import {
  Employee,
  SortState,
  TaskStatus,
  Option,
  ProjectWithTasks,
  SortId,
  Task,
} from "@/types/projectTypes";
import { animatedComponents, TaskDialog } from "./components/TaskDialog";
import { createClinet } from "@/api/createClient";
import ReactSelect from "react-select";
import { useAuth } from "@/context/AuthContext";

const kpiCard = {
  base: "rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4",
  title: "text-sm font-medium text-slate-500",
  value: "text-2xl font-semibold text-slate-900",
  sub: "text-xs text-slate-500",
} as const;

const pageSize = 10;

const statusVariant = (
  s: ProjectStatus
): "default" | "secondary" | "destructive" => {
  switch (s) {
    case "On Track":
      return "default";
    case "At Risk":
      return "secondary";
    case "Blocked":
      return "destructive";
  }
};
const genId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
const toISOFromDateInput = (val: string) =>
  val ? new Date(val + "T00:00:00").toISOString() : undefined;

const employeeFullName = (e: Employee) =>
  `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim();
const isOverdue = (dueISO?: string, actualISO?: string) => {
  if (!dueISO) return false;
  const due = parseISO(dueISO);
  if (actualISO) {
    const actual = parseISO(actualISO);
    return actual.getTime() > due.getTime();
  }
  const now = new Date();
  return now.getTime() > due.getTime();
};
const formatMaybe = (iso?: string) =>
  iso ? format(parseISO(iso), "PPP") : "—";

// color classes for task status badge
const taskStatusClass = (s: TaskStatus) =>
  ({
    "Not Started": "border-slate-300 text-slate-700 bg-slate-50",
    "In Progress": "border-blue-300 text-blue-700 bg-blue-50",
    Completed: "border-green-300 text-green-700 bg-green-50",
  }[s]!);

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortState>({
    id: "dueDate",
    desc: false,
  });
  const [page, setPage] = useState(1);

  // employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const getAllEmployees = async () => {
    const response = await axios.get("/api/employee/getAllEmployee");
    setEmployees(response?.data ?? []);
  };
  useEffect(() => {
    getAllEmployees();
  }, []);

  // react-select options
  const employeeSelectOptions: Option[] = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.employee_id,
        label: `${emp.first_name} ${emp.last_name}`.trim() || emp.email,
      })),
    [employees]
  );
  const employeesByEmployeeId = useMemo(() => {
    const m = new Map<string, Employee>();
    employees.forEach((e) => m.set(e.employee_id, e));
    return m;
  }, [employees]);

  // projects
  const [projects, setProjects] = useState<ProjectWithTasks[]>(() =>
    projectData.map((p) => ({ ...p, tasks: [] }))
  );

  // KPIs
  const [dueSoon, setDueSoon] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  useEffect(() => {
    const now = new Date();
    const in14 = new Date(now);
    in14.setDate(now.getDate() + 14);
    let dueSoonC = 0;
    let riskC = 0;
    for (const p of projects) {
      const d = parseISO(p.dueDate);
      if (!isAfter(d, in14)) dueSoonC += 1;
      if (p.status === "At Risk" || p.status === "Blocked") riskC += 1;
    }
    setDueSoon(dueSoonC);
    setRiskCount(riskC);
  }, [projects]);

  // search + sort
  const filteredAndSorted: ProjectWithTasks[] = useMemo(() => {
    let current = [...projects];
    if (query.trim()) {
      const q = query.toLowerCase();
      current = current.filter((p) => {
        const hay = [
          p.name,
          p.owner,
          p.team ?? "",
          ...(p.tags ?? []),
          p.status,
          format(parseISO(p.dueDate), "PP"),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (sorting) {
      current.sort((a, b) => {
        if (sorting.id === "name")
          return sorting.desc
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        if (sorting.id === "owner")
          return sorting.desc
            ? b.owner.localeCompare(a.owner)
            : a.owner.localeCompare(b.owner);
        if (sorting.id === "progress")
          return sorting.desc
            ? b.progress - a.progress
            : a.progress - b.progress;
        const A = parseISO(a.dueDate).getTime();
        const B = parseISO(b.dueDate).getTime();
        return sorting.desc ? B - A : A - B;
      });
    }
    return current;
  }, [projects, query, sorting]);

  // pagination
  useEffect(() => setPage(1), [query, sorting]);
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (id: SortId) =>
    setSorting((prev) =>
      prev && prev.id === id ? { id, desc: !prev.desc } : { id, desc: false }
    );

  // row expansion
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id));

  // add project
  const [addOpen, setAddOpen] = useState(false);
  const [npName, setNpName] = useState("");
  const [npOwner, setNpOwner] = useState<any>();

  const [npTeam, setNpTeam] = useState("");
  const [npTags, setNpTags] = useState("");
  const [npProgress, setNpProgress] = useState<number>(0);
  const [npStatus, setNpStatus] = useState<ProjectStatus>("On Track");
  const [npDue, setNpDue] = useState<string>("");

  const resetNewProject = () => {
    setNpName("");
    setNpOwner("");
    setNpTeam("");
    setNpTags("");
    setNpProgress(0);
    setNpStatus("On Track");
    setNpDue("");
  };
  const createProject = async () => {
    if (!npName.trim()) return;
    const newProject: ProjectWithTasks = {
      // id: genId("proj"),
      name: npName.trim(),
      owner: npOwner?.value || "—",
      team: npTeam.trim() || undefined,
      tags: npTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      progress: Math.max(0, Math.min(100, Number(npProgress) || 0)),
      status: npStatus,
      dueDate: toISOFromDateInput(npDue) ?? new Date().toISOString(),
      tasks: [],
    };
    const response = await createClinet(newProject, user?.employee_id);
    console.log(response);
    // setProjects((cur) => [newProject, ...cur]);
    resetNewProject();
    setAddOpen(false);
  };

  // Task dialog state (create/edit)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [taskDialogProjectId, setTaskDialogProjectId] = useState<string | null>(
    null
  );
  const [taskDialogInitial, setTaskDialogInitial] = useState<Task | null>(null);

  const openCreateTask = (projectId: string) => {
    setTaskDialogProjectId(projectId);
    setTaskDialogMode("create");
    setTaskDialogInitial(null);
    setTaskDialogOpen(true);
  };
  const openEditTask = (projectId: string, task: Task) => {
    setTaskDialogProjectId(projectId);
    setTaskDialogMode("edit");
    setTaskDialogInitial(task);
    setTaskDialogOpen(true);
  };

  const saveTaskFromDialog = (payload: Omit<Task, "id"> & { id?: string }) => {
    if (!taskDialogProjectId) return;
    if (taskDialogMode === "create") {
      const newTask: Task = {
        id: genId("task"),
        ...payload,
      };
      setProjects((cur) =>
        cur.map((p) =>
          p.id === taskDialogProjectId
            ? { ...p, tasks: [newTask, ...p.tasks] }
            : p
        )
      );
    } else {
      // edit
      setProjects((cur) =>
        cur.map((p) =>
          p.id !== taskDialogProjectId
            ? p
            : {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === payload.id ? { ...t, ...payload, id: t.id } : t
                ),
              }
        )
      );
    }
  };

  // checklist toggle & remove
  const toggleChecklistItem = (
    projectId: string,
    taskId: string,
    itemId: string
  ) => {
    setProjects((cur) =>
      cur.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: (p.tasks ?? []).map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c
                  ),
                }
          ),
        };
      })
    );
  };
  const removeTask = (projectId: string, taskId: string) => {
    setProjects((cur) =>
      cur.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      )
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Clients
          </p>
          <p className="mt-1 text-slate-600">
            Track current clients, managers, status, and deadlines — at a
            glance.
          </p>
        </div>

        {/* Add Project CTA */}
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 !bg-sky-500">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl  !p-4 !overflow-auto">
            <SheetHeader>
              <SheetTitle>Create Client</SheetTitle>
              <SheetDescription>
                Stand up a net-new initiative. You can re-platform the data
                model later when the API lands.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="np-name">Client Name</Label>
                <Input
                  id="np-name"
                  value={npName}
                  onChange={(e) => setNpName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-owner">Lead</Label>
                {/* <Input
                  id="np-owner"
                  value={npOwner}
                  onChange={(e) => setNpOwner(e.target.value)}
                /> */}
                <ReactSelect
                  components={animatedComponents}
                  placeholder="Select Lead"
                  // isMulti
                  options={employeeSelectOptions}
                  value={npOwner}
                  onChange={(selected: any) =>
                    setNpOwner(selected ? selected : "")
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-team">Team</Label>
                <Input
                  id="np-team"
                  value={npTeam}
                  onChange={(e) => setNpTeam(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-tags">Tags (comma separated)</Label>
                <Input
                  id="np-tags"
                  value={npTags}
                  onChange={(e) => setNpTags(e.target.value)}
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
                  value={npProgress}
                  onChange={(e) => setNpProgress(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={npStatus}
                  onValueChange={(v: ProjectStatus) => setNpStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT STARTED">Not Started </SelectItem>
                    <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="COMPLETED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-due">Due Date</Label>
                <Input
                  id="np-due"
                  type="date"
                  value={npDue}
                  onChange={(e) => setNpDue(e.target.value)}
                />
              </div>
            </div>

            <SheetFooter className="mt-6 ">
              <SheetClose asChild>
                <Button variant="ghost">Cancel</Button>
              </SheetClose>
              <Button onClick={createProject} className="!bg-sky-500">
                Create Client
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Total Clients</div>
          <div className={kpiCard.value}>{projects.length}</div>
          <div className={kpiCard.sub}>Currently active</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Due in 14 Days</div>
          <div className={kpiCard.value}>{dueSoon}</div>
          <div className={kpiCard.sub}>Keep an eye on deadlines</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>At Risk / Blocked</div>
          <div className={kpiCard.value}>{riskCount}</div>
          <div className={kpiCard.sub}>Needs attention</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Searchable Fields</div>
          <div className={kpiCard.value}>Name, Owner, Tags</div>
          <div className={kpiCard.sub}>Try “api”, “Design”, “Blocked”…</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                aria-label="Search projects"
                placeholder="Search clients, owners, team, tags…"
                className="w-[300px] pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                <Search className=" w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {total} result{total === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Data card */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-auto">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("name")}
                    className="px-0"
                  >
                    Client <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("owner")}
                    className="px-0"
                  >
                    Manager <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Team</TableHead>
                <TableHead className="whitespace-nowrap">Tags</TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("progress")}
                    className="px-0"
                  >
                    Progress <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("dueDate")}
                    className="px-0"
                  >
                    Due <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Details</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.length > 0 ? (
                paged.map((p) => {
                  const due = parseISO(p.dueDate);
                  const isOpen = expandedId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <TableRow
                        className="even:bg-slate-50/40 hover:bg-blue-50/60 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(p.id as string)}
                      >
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <User2 className="h-4 w-4 opacity-60" />
                            {p.owner}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {p.team ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <div className="flex flex-wrap items-center gap-1">
                            {p.tags?.length
                              ? p.tags.map((t: any) => (
                                  <Badge
                                    key={t}
                                    variant="outline"
                                    className="gap-1"
                                  >
                                    <TagIcon className="h-3 w-3" />
                                    {t}
                                  </Badge>
                                ))
                              : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <Progress value={p.progress} className="h-2 w-28" />
                            <span className="tabular-nums text-xs text-slate-600">
                              {p.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant(p.status)}
                            className="uppercase tracking-wide"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 opacity-60" />
                            {format(due, "PPP")}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(p.id as string);
                            }}
                          >
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {isOpen ? "Hide" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row: Tasks Panel */}
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-slate-50/60">
                            <div className="px-2 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-900 font-medium">
                                  <CheckSquare className="h-4 w-4" />
                                  Tasks for {p.name}
                                </div>
                                <Button
                                  size="sm"
                                  className="gap-2 !bg-yellow-500"
                                  onClick={() => openCreateTask(p.id as string)}
                                >
                                  <PlusCircle className="h-4 w-4" /> Add Task
                                </Button>
                              </div>

                              <Separator className="my-3" />

                              {p.tasks.length === 0 ? (
                                <div className="text-sm text-slate-600">
                                  No tasks yet. Lean in and create the first
                                  one.
                                </div>
                              ) : (
                                <div className="grid gap-3">
                                  {p.tasks.map((t) => {
                                    const total = t.checklist.length;
                                    const done = t.checklist.filter(
                                      (c) => c.done
                                    ).length;
                                    const pct = total
                                      ? Math.round((done / total) * 100)
                                      : 0;

                                    return (
                                      <div
                                        key={t.id}
                                        className="rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow"
                                      >
                                        {/* Header row */}
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-900">
                                              {t.title}
                                            </span>
                                            <Badge
                                              variant={
                                                t.priority === "Critical"
                                                  ? "destructive"
                                                  : t.priority === "High"
                                                  ? "default"
                                                  : "secondary"
                                              }
                                            >
                                              {t.priority}
                                            </Badge>
                                            {/* NEW: Status badge */}
                                            <Badge
                                              variant="outline"
                                              className={taskStatusClass(
                                                t.status
                                              )}
                                            >
                                              {t.status}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="gap-1"
                                              onClick={() =>
                                                openEditTask(p.id as string, t)
                                              }
                                            >
                                              <Edit3 className="h-4 w-4" /> Edit
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                removeTask(p.id as string, t.id)
                                              }
                                            >
                                              <Trash2 className="h-4 w-4 text-slate-500" />
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Meta grid */}
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                                          <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <div className="space-y-0.5">
                                              <div>
                                                <span className="text-slate-500">
                                                  Start:
                                                </span>{" "}
                                                {formatMaybe(t.startDate)}
                                              </div>
                                              <div>
                                                <span className="text-slate-500">
                                                  Due:
                                                </span>{" "}
                                                {formatMaybe(t.dueDate)}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <div>
                                              <span className="text-slate-500">
                                                Actual:
                                              </span>{" "}
                                              {formatMaybe(t.actualEndDate)}
                                            </div>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            <div className="flex flex-wrap gap-1">
                                              {t.assigneeEmployeeIds.length ===
                                              0 ? (
                                                <span className="text-slate-500">
                                                  Unassigned
                                                </span>
                                              ) : (
                                                t.assigneeEmployeeIds
                                                  .map((eid) =>
                                                    employeesByEmployeeId.get(
                                                      eid
                                                    )
                                                  )
                                                  .filter(Boolean)
                                                  .map((e) => (
                                                    <Badge
                                                      key={
                                                        (e as Employee)
                                                          .employee_id
                                                      }
                                                      variant="outline"
                                                    >
                                                      {employeeFullName(
                                                        e as Employee
                                                      )}
                                                    </Badge>
                                                  ))
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Description */}
                                        {t.description && (
                                          <div className="mt-3 text-sm text-slate-700">
                                            {t.description}
                                          </div>
                                        )}

                                        {/* Status row */}
                                        <div className="mt-3 flex flex-wrap items-center gap-4">
                                          <div className="flex items-center gap-2">
                                            <Progress
                                              value={pct}
                                              className="h-2 w-32"
                                            />
                                            <span className="text-xs text-slate-600 tabular-nums">
                                              {pct}%
                                            </span>
                                          </div>
                                          {typeof t.estimatedHours ===
                                            "number" && (
                                            <span className="text-xs text-slate-600">
                                              ⏱ {t.estimatedHours}h est.
                                            </span>
                                          )}
                                          <span>
                                            {isOverdue(
                                              t.dueDate,
                                              t.actualEndDate
                                            ) ? (
                                              <Badge variant="destructive">
                                                Overdue
                                              </Badge>
                                            ) : (
                                              <Badge variant="secondary">
                                                On time
                                              </Badge>
                                            )}
                                          </span>
                                        </div>

                                        {/* Checklist */}
                                        {t.checklist.length > 0 && (
                                          <div className="mt-3 grid gap-2">
                                            {t.checklist.map((c) => (
                                              <label
                                                key={c.id}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="checkbox"
                                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                  checked={c.done}
                                                  onChange={() =>
                                                    toggleChecklistItem(
                                                      p.id as string,
                                                      t.id,
                                                      c.id
                                                    )
                                                  }
                                                />
                                                <span
                                                  className={
                                                    c.done
                                                      ? "line-through text-slate-500"
                                                      : ""
                                                  }
                                                >
                                                  {c.text}
                                                </span>
                                              </label>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-56 text-center align-middle"
                  >
                    <div className="mx-auto max-w-sm">
                      <div className="mb-2 text-5xl">📋</div>
                      <div className="text-lg font-semibold text-slate-900">
                        No projects match this search
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Try a different keyword or clear your search.
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" onClick={() => setQuery("")}>
                          Reset search
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row">
          <div className="text-xs text-slate-600">
            Showing{" "}
            <span className="font-medium">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> projects
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-xs text-slate-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Task Dialog (Create/Edit) */}
      <TaskDialog
        mode={taskDialogMode}
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={saveTaskFromDialog}
        employees={employees}
        employeeOptions={employeeSelectOptions}
        initial={taskDialogInitial}
      />
    </div>
  );
};

export default Projects;
