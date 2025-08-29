// hooks/useClients.ts
import { useEffect, useMemo, useState } from "react";
import { format, isAfter, parseISO } from "date-fns";
// import {  type ProjectStatus } from "../../utils/projectData.js";
import { pageSize, genId } from "../../utils/projectUtils.js";
import {
  ProjectWithTasks,
  SortId,
  SortState,
  Task,
} from "@/types/projectTypes";
import axios from "axios";
import { useAuth } from "@/context/AuthContext.js";

export function useClients() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState([]);
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
      if (p.status === "At Risk" || p.status === "BLOCKED") riskC += 1;
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
  const handleGetAllTasks = async (clientId: string) => {
    const response = await axios.get(`/api/client/${clientId}/getAllTasks`);
    console.log(response?.data);
    setTasks(response?.data?.items);
  };
  const toggleExpand = (id: string) => {
    handleGetAllTasks(id);
    setExpandedId((cur) => (cur === id ? null : id));
  };

  // task CRUD
  const handleCreateTask = async (clientId: string, data: any) => {
    try {
      const response = await axios.post(
        `/api/client/${clientId}/createTask?userId=${user?.employee_id}`,
        data
      );

      if (response.status == 201) {
        alert("Task created Successfully");
        await handleGetAllTasks(clientId);
      }
    } catch (error) {}
  };
  const addTask = (projectId: string, payload: Omit<Task, "id">) => {
    handleCreateTask(projectId, payload);
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
    tasks &&
      setTasks((cur: any) =>
        cur.map((p: any) => {
          if (p._id !== taskId) return p;
          return {
            ...p,

            checklist: p.checklist.map((c: any) =>
              c._id === itemId ? { ...c, done: !c.done } : c
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
    tasks,
    toggleSort,
    addTask,
    updateTask,
    removeTask,
    toggleChecklistItem,
  };
}
