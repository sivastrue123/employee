// hooks/useClients.ts
import { useEffect, useMemo, useState } from "react";
import { format, isAfter, parseISO } from "date-fns";
import { projectData, type ProjectStatus } from "../../utils/projectData.js";
import { pageSize, genId } from "../../utils/projectUtils.js";
import {
  ProjectWithTasks,
  SortId,
  SortState,
  Task,
} from "@/types/projectTypes";
import axios from "axios";

export function useClients() {
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);

  // KPIs
  const [dueSoon, setDueSoon] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [activeProjects, setActiveProject] = useState(0);
  const handleProjects = async () => {
    const response = await axios.get("api/client/getAllClient");

    console.log(response?.data?.metrics);
    setProjects(response?.data?.items);
    setRiskCount(response?.data?.metrics?.atRiskClients);
    setDueSoon(response?.data?.metrics?.dueIn14Days);
    setActiveProject(response?.data?.metrics?.totalClients);
  };
  useEffect(() => {
    handleProjects();
  }, []);
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
  }, [projects]);

  // search + sort + pagination
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortState>({
    id: "dueDate",
    desc: false,
  });
  const [page, setPage] = useState(1);

  const filteredAndSorted: any[] = useMemo(() => {
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

  // task CRUD
  const addTask = (projectId: string, payload: Omit<Task, "id">) => {
    const newTask: Task = { id: genId("task"), ...payload };
    setProjects((cur) =>
      cur.map((p) =>
        p.id === projectId ? { ...p, tasks: [newTask, ...p.tasks] } : p
      )
    );
  };

  const updateTask = (projectId: string, payload: Task) => {
    setProjects((cur) =>
      cur.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              tasks: p.tasks.map((t) => (t.id === payload.id ? payload : t)),
            }
      )
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
          tasks: p.tasks.map((t) =>
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

  return {
    // state
    projects,
    setProjects,
    query,
    setQuery,
    sorting,
    setSorting,
    page,
    setPage,
    expandedId,
    toggleExpand,
    handleProjects,
    // computed
    activeProjects,
    dueSoon,
    riskCount,
    paged,
    total,
    totalPages,
    // ops
    toggleSort,
    addTask,
    updateTask,
    removeTask,
    toggleChecklistItem,
  };
}
