// components/clients/Projects.tsx
import React, { useState } from "react";
import { Search } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

import { useEmployees } from "@/hooks/useEmployee";
import { useClients } from "@/hooks/useClient";
import { AddClient } from "./components/AddClient";
import { pageSize, statusVariant } from "../../../utils/projectUtils.js";
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  TagIcon,
  User2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { TaskPanel } from "./components/TaskPanel";
import { useSidebar } from "@/components/ui/sidebar";

const kpiCard = {
  base: "rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4",
  title: "text-sm font-medium text-slate-500",
  value: "text-2xl font-semibold text-slate-900",
  sub: "text-xs text-slate-500",
} as const;

const Projects: React.FC = () => {
  const { employees, employeesById, employeeSelectOptions } = useEmployees();
  const {
    projects,
    setProjects,
    query,
    setQuery,
    sorting,
    page,
    setPage,
    expandedId,
    toggleExpand,
    dueSoon,
    riskCount,
    paged,
    total,
    totalPages,
    toggleSort,
    handleProjects,
    activeProjects,
    addTask,
    removeTask,
    updateTask,
    toggleChecklistItem,
    tasks,
    isTaskLoading,
    handleGetAllTasks
  } = useClients();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { state } = useSidebar();
  return (
    <div
      className={`${
        state == "expanded" ? "lg:w-[90%]" : "lg:w-full"
      } w-full max-w-6xl px-6 pb-16`}
    >
      <div className="mb-6 flex items-center justify-between  gap-4">
        <div>
          <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Clients
          </p>
          <p className="mt-1 text-slate-600">
            Orchestrate client portfolios and deadlines—at a glance.
          </p>
        </div>
        <AddClient
          employeeOptions={employeeSelectOptions}
          onCreated={handleProjects}
        />
      </div>

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Total Clients</div>
          <div className={kpiCard.value}>{activeProjects}</div>
          <div className={kpiCard.sub}>Currently active</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Due in 14 Days</div>
          <div className={kpiCard.value}>{dueSoon}</div>
          <div className={kpiCard.sub}>Watch the runway</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>At Risk / Blocked</div>
          <div className={kpiCard.value}>{riskCount}</div>
          <div className={kpiCard.sub}>Escalate proactively</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Searchable Fields</div>
          <div className={kpiCard.value}>Name, Owner, Tags</div>
          <div className={kpiCard.sub}>Try “api”, “design”, “blocked”…</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                aria-label="Search clients"
                placeholder="Search clients, owners, team, tags…"
                className="w-[300px] pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {total} result{total === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Data card (kept inline for now; you can split into ClientTable/ClientRow next) */}
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
                {/* <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("progress")}
                    className="px-0"
                  >
                    Progress <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead> */}
                <TableHead className="whitespace-nowrap">Status</TableHead>
                {/* <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("dueDate")}
                    className="px-0"
                  >
                    Due <ArrowUpDown className="ml-1 h-4 w-4 opacity-60" />
                  </Button>
                </TableHead> */}

                <TableHead>Actions</TableHead>
                <TableHead className="whitespace-nowrap">Tasks</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.length > 0 ? (
                paged.map((p) => {
                  const due = parseISO(p.dueDate);
                  const isOpen = expandedId === p._id;
                  return (
                    <React.Fragment key={p.id}>
                      <TableRow className="even:bg-slate-50/40 hover:bg-blue-50/60 transition-colors cursor-pointer">
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="whitespace-nowrap ">
                          <span className="inline-flex items-center gap-1">
                            <User2 className="h-4 w-4 opacity-60" />
                            {p.ownerDetails?.first_name}{" "}
                            {p.ownerDetails?.last_name}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {p.team ? p.team : "—"}
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
                        {/* <TableCell className="min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <Progress value={p.progress} className="h-2 w-28" />
                            <span className="tabular-nums text-xs text-slate-600">
                              {p.progress}%
                            </span>
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <Badge
                            variant={statusVariant(p.status)}
                            className="uppercase tracking-wide"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        {/* <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 opacity-60" />
                            {format(due, "PPP")}
                          </span>
                        </TableCell> */}
                        <TableCell
                          onClick={() => {
                            setIsEdit(!isEdit);
                          }}
                        >
                          <AddClient
                            client={p}
                            employeeOptions={employeeSelectOptions}
                            trigger={<Button variant="outline">Edit</Button>}
                            onSaved={handleProjects}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(p._id as string);
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

                      {/* Inline: you can extract this into <TaskPanel /> one-for-one with your current logic */}
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-slate-50/60">
                            <TaskPanel
                              tasks={tasks}
                              employeesById={employeesById}
                              employees={employees}
                              employeeOptions={employeeSelectOptions}
                              onCreateTask={addTask}
                              onUpdateTask={updateTask}
                              onRemoveTask={removeTask}
                              onToggleChecklistItem={toggleChecklistItem}
                              clientId={p?._id}
                              clientName={p?.name}
                              isLoading={isTaskLoading}
                              handleGetAllTasks={handleGetAllTasks}
                            />
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
                        No clients match this search
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
            of <span className="font-medium">{total}</span> clients
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
    </div>
  );
};

export default Projects;
