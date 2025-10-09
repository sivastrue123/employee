// hooks/useClients.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { format, isAfter, parseISO } from "date-fns";
import axios from "axios";

// ⚠️ Note: pageSize must be imported correctly
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

// ... (parseHttpError and axiosOpts remain the same)
const parseHttpError = (error: any) => {
  const status = error?.response?.status;
  const isNetwork =
    error?.code === "ERR_NETWORK" ||
    error?.message?.toLowerCase?.()?.includes("network");

  if (isNetwork) {
    return {
      title: "Network issue",
      message: "We hit a network hiccup. Verify your connection and try again.",
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
// END: parseHttpError and axiosOpts

interface ClientApiResponse {
    items: ProjectWithTasks[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    metrics: {
        totalClients: number;
        dueIn14Days: number;
        atRiskClients: number;
    };
}


export function useClients() {
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isTaskLoading, setIsTaskLoading] = useState<boolean>(false);
  
  // States that control the API fetch (query, sort, page)
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortState>({
    id: "dueDate",
    desc: false,
  });
  const [page, setPage] = useState(1);
    
  // States updated by the API response's pagination and metrics
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dueSoon, setDueSoon] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [activeProjects, setActiveProject] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  // Initial load/Re-fetch: Projects
  const handleProjects = useCallback(async () => {
    
    try {
        // --- 1. Build Query Parameters for the API ---
        setIsLoading(true);
        const sortOrder = sorting?.desc ? -1 : 1; // Convert boolean to server-side value
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            q: query,
            sortId: sorting?sorting.id:"",
            sortOrder: String(sortOrder),
        }).toString();
        
        const url = `api/client/getAllClient?${params}`;
        
        const response = await api.get<ClientApiResponse>(url, axiosOpts);

        if (response.status === 304) {

            toast.info("Clients are already up to date.", {
                title: "No change",
                durationMs: 2000,
                position: "bottom-left",
            });
            return;
        }

        // --- 2. Update State from Server Response ---
        const data = response.data;
        setProjects(data?.items ?? []);
        setTotal(data?.pagination?.total ?? 0);
        setTotalPages(data?.pagination?.totalPages ?? 1);
        setDueSoon(data?.metrics?.dueIn14Days ?? 0);
        setActiveProject(data?.metrics?.totalClients ?? 0);
        setRiskCount(data?.metrics?.atRiskClients ?? 0);

        
        toast.success(`Page ${page} of client data synced successfully.`, {
            title: "Sync complete",
            durationMs: 1800,
            position: "bottom-left",
        });
    } catch (error: any) {

      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 4500,
        position: "bottom-left",
      });
    }finally{

        setIsLoading(false); 
   
    }
  }, [page, query, sorting, toast]); // Dependency array: call API whenever these change

  // --- 3. useEffect hooks to trigger fetching ---
  
  // Fetch on initial load
  useEffect(() => {
    handleProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Reset page to 1 and fetch when query or sorting changes
  useEffect(() => {
    // Only reset page if it's not already 1, otherwise we'll fetch twice
    if (page !== 1) {
      setPage(1); 
    } else {
      handleProjects(); // Fetch if we're already on page 1
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sorting]); 
  
  // Fetch when page changes (triggered by pagination buttons)
  useEffect(() => {
      handleProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 


  // --- 4. Simplification ---
  // The sorting and pagination logic is now handled by the server. 
  // We don't need the complex useMemo logic anymore.
  // The 'projects' state already holds the correct, paged data.
  const paged = projects;

  const toggleSort = (id: SortId) =>
    setSorting((prev) =>
      prev && prev.id === id ? { id, desc: !prev.desc } : { id, desc: false }
    );

  // row expansion -> fetch tasks for a client
  const handleGetAllTasks = async (clientId: string, userId?: string) => {
    // ... (Your handleGetAllTasks implementation remains the same)
    const loadingId = toast.info("Loading task inventory…", {
        durationMs: 0,
        position: "bottom-left",
        dismissible: true,
      });
  
      try {
        const response = await api.get(
          `/api/client/${clientId}/getAllTasks${
            userId ? `?userId=${userId}` : ""
          }`,
          axiosOpts
        );
  
        if (response.status === 304) {
          toast.remove(loadingId);
          toast.info("Tasks are already current.", {
            title: "No change",
            durationMs: 1800,
            position: "bottom-left",
          });
          return;
        }
  
        setTasks(response?.data?.items ?? []);
        setIsTaskLoading(false);
        toast.remove(loadingId);
        toast.success("Tasks loaded.", {
          durationMs: 1400,
          position: "bottom-left",
        });
      } catch (error: any) {
        toast.remove(loadingId);
        const { title, message } = parseHttpError(error);
        toast.error(message, {
          title,
          durationMs: 4500,
          position: "bottom-left",
        });
        setIsTaskLoading(false);
        setTasks([]);
      }
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => {
    setIsTaskLoading(true);
    handleGetAllTasks(id);
    setExpandedId((cur) => (cur === id ? null : id));
  };

  // === Task CRUD with toasts ===

  const handleCreateTask = async (clientId: string, data: any) => {
    if (!user?.employee_id) {
      toast.error("Your employee identity is missing.", {
        title: "Cannot create task",
        durationMs: 4000,
        position: "bottom-left",
      });
      return false;
    }

    const loadingId = toast.info("Creating task…", {
      durationMs: 0,
      position: "bottom-left",
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
          position: "bottom-left",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      // Unexpected non-error status
      toast.remove(loadingId);
      toast.warning?.("The server responded unexpectedly.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-left",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-left",
      });
      return false;
    }
  };
  const addTask = (projectId: string, payload: Omit<Task, "id">) => {
    void handleCreateTask(projectId, payload);
  };

  const handleEditTask = async (
    clientId: string,
    data: any,
    opts?: { label?: string }
  ) => {
    if (!user?.employee_id) {
      toast.error("Your employee identity is missing.", {
        title: "Cannot update task",
        durationMs: 4000,
        position: "bottom-left",
      });
      return false;
    }

    const loadingId = toast.info(opts?.label ?? "Updating task…", {
      durationMs: 0,
      position: "bottom-left",
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
          position: "bottom-left",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("No changes detected.", {
          title: "Not modified",
          durationMs: 1600,
          position: "bottom-left",
        });
        return true; // noop but not an error
      }

      toast.remove(loadingId);
      toast.warning?.("Unexpected server response.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-left",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-left",
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
        position: "bottom-left",
      });
      return false;
    }

    const loadingId = toast.info("Deleting task…", {
      durationMs: 0,
      position: "bottom-left",
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
          position: "bottom-left",
        });
        await handleGetAllTasks(clientId);
        return true;
      }

      if (response.status === 304) {
        toast.remove(loadingId);
        toast.info("Task state unchanged.", {
          title: "Not modified",
          durationMs: 1600,
          position: "bottom-left",
        });
        return true;
      }

      toast.remove(loadingId);
      toast.warning?.("Unexpected server response.", {
        title: `Status ${response.status}`,
        durationMs: 3000,
        position: "bottom-left",
      });
      return false;
    } catch (error: any) {
      toast.remove(loadingId);
      const { title, message } = parseHttpError(error);
      toast.error(message, {
        title,
        durationMs: 5000,
        position: "bottom-left",
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
        position: "bottom-left",
      });
    } else {
      // Roll back
      setTasks(prevSnapshot);
      toast.error("We couldn’t update that checklist item. Changes reverted.", {
        title: "Update failed",
        durationMs: 4000,
        position: "bottom-left",
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
    isTaskLoading,
    setIsTaskLoading,
    handleGetAllTasks,
    isLoading,
  };
}