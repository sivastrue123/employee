"use client";

import React, { useMemo, useState, useEffect } from "react";
import { format, isAfter, parseISO } from "date-fns";
import { ArrowUpDown, CalendarIcon, TagIcon, User2 } from "lucide-react";

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
  projectData,
  type Project,
  type ProjectStatus,
} from "../../../utils/projectData";

// --- small helper for KPI cards to match your Attendance page vibe ---
const kpiCard = {
  base: "rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4",
  title: "text-sm font-medium text-slate-500",
  value: "text-2xl font-semibold text-slate-900",
  sub: "text-xs text-slate-500",
} as const;

type SortId = "name" | "owner" | "dueDate" | "progress";
type SortState = { id: SortId; desc: boolean } | null;

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

const Projects: React.FC = () => {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortState>({
    id: "dueDate",
    desc: false,
  });
  const [page, setPage] = useState(1);

  // derived KPI: due soon (next 14 days), at risk/blocked, total
  const [dueSoon, setDueSoon] = useState(0);
  const [riskCount, setRiskCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const in14 = new Date(now);
    in14.setDate(now.getDate() + 14);

    let dueSoonC = 0;
    let riskC = 0;
    for (const p of projectData) {
      const d = parseISO(p.dueDate);
      if (!isAfter(d, in14)) dueSoonC += 1;
      if (p.status === "At Risk" || p.status === "Blocked") riskC += 1;
    }
    setDueSoon(dueSoonC);
    setRiskCount(riskC);
  }, []);

  const filteredAndSorted: Project[] = useMemo(() => {
    let current = [...projectData];

    // search across name, owner, team, tags, status
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
        if (sorting.id === "name") {
          return sorting.desc
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        if (sorting.id === "owner") {
          return sorting.desc
            ? b.owner.localeCompare(a.owner)
            : a.owner.localeCompare(b.owner);
        }
        if (sorting.id === "progress") {
          return sorting.desc
            ? b.progress - a.progress
            : a.progress - b.progress;
        }
        // dueDate default
        const A = parseISO(a.dueDate).getTime();
        const B = parseISO(b.dueDate).getTime();
        return sorting.desc ? B - A : A - B;
      });
    }

    return current;
  }, [query, sorting]);

  // pagination
  useEffect(() => setPage(1), [query, sorting]);
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (id: SortId) =>
    setSorting((prev) =>
      prev && prev.id === id ? { id, desc: !prev.desc } : { id, desc: false }
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          Projects
        </p>
        <p className="mt-1 text-slate-600">
          Track current clients, managers, status, and deadlines — at a
          glance.
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Total Clients</div>
          <div className={kpiCard.value}>{projectData.length}</div>
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
                placeholder="Search projects, owners, team, tags…"
                className="w-[300px] pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                ⌘K
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.length > 0 ? (
                paged.map((p) => {
                  const due = parseISO(p.dueDate);
                  return (
                    <TableRow
                      key={p.id}
                      className="even:bg-slate-50/40 hover:bg-blue-50/60 transition-colors"
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
                            ? p.tags.map((t:any) => (
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
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
    </div>
  );
};

export default Projects;
