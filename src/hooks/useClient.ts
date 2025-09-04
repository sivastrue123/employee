// hooks/useClients.ts
import { useEffect, useMemo, useState } from "react";
import { format, isAfter, parseISO } from "date-fns";
import axios from "axios";

import { pageSize } from "../../utils/projectUtils.js";
import {
  ProjectWithTasks,
  SortId,
  SortState,
  Task,
} from "@/types/projectTypes";
import { useAuth } from "@/context/AuthContext.js";

// ✅ In-house toast system (same pattern as App.tsx)
import { useToast } from "@/toast/ToastProvider"; // <-- adjust path if needed
import { api } from "@/lib/axios.js";

// Small helper to classify errors and humanize messages
const parseHttpError = (error: any) => {
  const status = error?.response?.status;
  const isNetwork =
    error?.code === "ERR_NETWORK" ||
    error?.message?.toLowerCase?.()?.includes("network");

  if (isNetwork) {
    return {
      title: "Network issue",
      message:
        "We hit a network hiccup. Verify your connection and try again.",
    };
  }

  if (status === 400) {
    return {
      title: "Validation failed",
      message:
        error?.response?.data?.error ||
        error?.response?.data?.errors?.join?.(", ") ||
        "Your request didn’t pass validation.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      title: "Not authorized",
      message: "Your session doesn’t have access to perform this operation.",
    };
  }

  if (status === 404) {
    return {
      title: "Not found",
      message: "The requested item could not be located.",
    };
  }

  if (status === 409) {
    return {
      title: "Conflict",
      message: "The resource changed elsewhere. Refresh and retry.",
    };
  }

  if (status === 304) {
    return {
      title: "No change",
      message: "The data is up to date—no changes detected.",
    };
  }

  return {
    title: "Something went wrong",
    message:
      error?.response?.data?.error ||
      error?.message ||
      "Unexpected error. Please try again.",
  };
};

// Standard Axios opts to de-emphasize browser cache noise
const axiosOpts = {
  headers: { "Cache-Control": "no-cache" },
  // Accept 304 as a handled pathway (not “throw”)
  validateStatus: (s: number) => s >= 200 && s < 400,
};

export function useClients() {
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // KPIs
  const [dueSoon, setDueSoon] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [activeProjects, setActiveProject] = useState(0);

  // Initial load: Projects
  const handleProjects = async () => {
    const loadingId = toast.info("Syncing clients…", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const response = await api.get("api/client/getAllClient", axiosOpts);

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("Clients are already up to date.", {
          title: "No change",
          durationMs: 2000,
          position: "bottom-center",
        });
        return;
      }

      setProjects(response?.data?.items ?? []);
      setDueSoon(response?.data?.metrics?.dueIn14Days ?? 0);
      setActiveProject(response?.data?.metrics?.totalClients ?? 0);
      setRiskCount(response?.data?.metrics?.atRiskClients ?? 0);

      toast.remove(loadingId);
      toast.success("Client data synced successfully.", {
        title: "Sync complete",
        durationMs: 1800,
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 4500,
        position: "bottom-center",
      });
    }
  };

  useEffect(() => {
    handleProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 

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

  // row expansion -> fetch tasks for a client
  const handleGetAllTasks = async (clientId: string) => {
    const loadingId = toast.info("Loading task inventory…", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const response = await api.get(
        `/api/client/${clientId}/getAllTasks`,
        axiosOpts
      );

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("Tasks are already current.", {
          title: "No change",
          durationMs: 1800,
          position: "bottom-center",
        });
        return;
      }

      setTasks(response?.data?.items ?? []);
      toast.remove(loadingId);
      toast.success("Tasks loaded.", {
        durationMs: 1400,
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 4500,
        position: "bottom-center",
      });
    }
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => {
    handleGetAllTasks(id);
    setExpandedId((cur) => (cur === id ? null : id));
  };

  // === Task CRUD with toasts ===

  const handleCreateTask = async (clientId: string, data: any) => {
    if (!user?.employee_id) {
      toast.error("Your employee identity is missing.", {
        title: "Cannot create task",
        durationMs: 4000,
        position: "bottom-center",
      });
      return false;
    }

    const loadingId = toast.info("Creating task…", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const response = await api.post(
        `/api/client/${clientId}/createTask?userId=${user.employee_id}`,
        data,
        axiosOpts
      );

      if (response.status === 201 || response.status === 200) {
        toast.remove(loadingId);
        toast.success("Task created successfully.", {
          title: "Done",
          durationMs: 2000,
          position: "bottom-center",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      // Unexpected non-error status
      toast.remove(loadingId);
      toast.warning?.("The server responded unexpectedly.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-center",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-center",
      });
      return false;
    }
  };
  const addTask = (projectId: string, payload: Omit<Task, "id">) => {
    void handleCreateTask(projectId, payload);
  };

  const handleEditTask = async (clientId: string, data: any, opts?: { label?: string }) => {
    if (!user?.employee_id) {
      toast.error("Your employee identity is missing.", {
        title: "Cannot update task",
        durationMs: 4000,
        position: "bottom-center",
      });
      return false;
    }

    const loadingId = toast.info(opts?.label ?? "Updating task…", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const response = await api.patch(
        `/api/client/${clientId}/task/${data?._id}/updateTask?userId=${user.employee_id}`,
        data,
        axiosOpts
      );

      if (response.status === 200) {
        toast.remove(loadingId);
        toast.success("Task updated.", {
          durationMs: 1600,
          position: "bottom-center",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("No changes detected.", {
          title: "Not modified",
          durationMs: 1600,
          position: "bottom-center",
        });
        return true; // noop but not an error
      }

      toast.remove(loadingId);
      toast.warning?.("Unexpected server response.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-center",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-center",
      });
      return false;
    }
  };
  const updateTask = (projectId: string, payload: Task) => {
    void handleEditTask(projectId, payload);
  };

  const handleDeleteTask = async (clientId: string, taskId: string) => {
    if (!user?.employee_id) {
      toast.error("Your employee identity is missing.", {
        title: "Cannot delete task",
        durationMs: 4000,
        position: "bottom-center",
      });
      return false;
    }

    const loadingId = toast.info("Deleting task…", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const response = await api.delete(
        `/api/client/${clientId}/task/${taskId}/deleteTask?userId=${user.employee_id}`,
        axiosOpts
      );

      if (response.status === 200) {
        toast.remove(loadingId);
        toast.success("Task deleted.", {
          durationMs: 1600,
          position: "bottom-center",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("Task state unchanged.", {
          title: "Not modified",
          durationMs: 1600,
          position: "bottom-center",
        });
        return true;
      }

      toast.remove(loadingId);
      toast.warning?.("Unexpected server response.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-center",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-center",
      });
      return false;
    }
  };
  const removeTask = (projectId: string, taskId: string) => {
    void handleDeleteTask(projectId, taskId);
  };

  // Optimistic checklist toggle with rollback + toasts
  const toggleChecklistItem = async (
    projectId: string,
    taskId: string,
    itemId: string
  ) => {
    const target = tasks.find((t: any) => t._id === taskId);
    if (!target) return;

    const prevSnapshot = JSON.parse(JSON.stringify(tasks));

    // Build the new checklist locally
    const newChecklist = target.checklist.map((c: any) =>
      c._id === itemId ? { ...c, done: !c.done } : c
    );

    // Optimistic UI
    setTasks((cur: any[]) =>
      cur.map((t) => (t._id === taskId ? { ...t, checklist: newChecklist } : t))
    );

    const payload = { ...target, checklist: newChecklist };

    const ok = await handleEditTask(projectId, payload, {
      label: "Updating checklist…",
    });

    if (ok) {
      toast.success("Checklist updated.", {
        durationMs: 1200,
        position: "bottom-center",
      });
    } else {
      // Roll back
      setTasks(prevSnapshot);
      toast.error("We couldn’t update that checklist item. Changes reverted.", {
        title: "Update failed",
        durationMs: 4000,
        position: "bottom-center",
      });
    }
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
