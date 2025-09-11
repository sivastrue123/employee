// src/pages/AddNotes.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import { useToast } from "@/toast/ToastProvider";

// shadcn/ui primitives (adjust paths to your setup)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

// Dialogs & Tooltips
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Pencil, Plus } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

// ---------- Types
type OwnerDetails = {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "inactive" | string;
  phone: string;
  profile_image: string;
};

export type Client = {
  _id: string;
  name: string;
  owner: string;
  team: string;
  tags: string[];
  progress: number;
  status: "COMPLETED" | "IN PROGRESS" | string;
  dueDate: string; // ISO
  createdAt: string;
  updatedAt: string;
  ownerDetails: OwnerDetails;
};

export type Note = {
  _id: string;
  clientId: string;
  noteId: string;
  title: string;
  notes?: string; // server's canonical field
  text?: string; // optional alias in some responses
  createdAt: string; // ISO
  createdByUser: {
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

// ---------- Utilities
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");

const statusTone = (status: string) =>
  status === "COMPLETED"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";

// ---------- Page
export default function AddNotes() {
  const { user } = useAuth();
  const toast = useToast();
  const { state } = useSidebar();
  // Clients
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Notes collection
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);

  // Search (notes)
  const [noteSearch, setNoteSearch] = useState("");
  const [noteSearchDebounced, setNoteSearchDebounced] = useState("");

  // Create Note Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit Note Dialog state
  const [editing, setEditing] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setNoteSearchDebounced(noteSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [noteSearch]);

  // ---- Fetch Clients
  const handleGetAllClients = async () => {
    const loadingId = toast.info("Retrieving client portfolio…");
    try {
      const response = await api.get("/api/client/getAllClient");
      if (response?.status === 200) {
        const items: Client[] = response?.data?.items ?? [];
        setClients(items);
        if (!selectedClientId && items.length > 0) {
          setSelectedClientId(items[0]._id);
        }
        toast.success("Clients synchronized successfully.");
      } else {
        toast.error("Failed to fetch clients. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network hiccup while fetching clients.");
    } finally {
      toast.remove(loadingId);
    }
  };

  // ---- Fetch Notes for a client (with query)
  const fetchNotes = async (clientId: string, q = "") => {
    setNotesLoading(true);
    try {
      const res = await api.get(`/api/client/note`, {
        params: { clientId, q },
      });
      if (res?.status === 200) {
        setNotes(res.data?.items ?? []);
      } else {
        setNotes([]);
        toast.error("Unable to load notes for this client.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Notes service is currently unavailable.");
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // ---- Create Note (Dialog)
  const createNote = async () => {
    const clientId = selectedClientId;
    if (!clientId) {
      toast.warning("Please select a client first.");
      return;
    }
    if (!newTitle.trim() || !newText.trim()) {
      toast.warning("Title and Notes are required.");
      return;
    }

    setCreating(true);
    const loadingId = toast.info("Publishing note…");
    try {
      const res = await api.post(
        `/api/client/note?userId=${user?.employee_id}`,
        {
          clientId,
          title: newTitle.trim(),
          text: newText.trim(),
        }
      );
      if (res?.status === 200 || res?.status === 201) {
        // Optimistic reconciliation (prepend newest to the list)
        const created: Note | undefined = res.data?.data;
        setNotes((prev) => {
          if (!prev) return created ? [created] : prev;
          return created ? [created, ...prev] : prev;
        });
        setNewTitle("");
        setNewText("");
        setAddOpen(false);
        toast.success("Note added to the client record.");
      } else {
        toast.error("Failed to add note.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not create note. Try again later.");
    } finally {
      setCreating(false);
      toast.remove(loadingId);
    }
  };

  // ---- Start Edit (Dialog)
  const startEdit = (note: Note) => {
    setEditing(note);
    setEditTitle(note.title ?? "");
    setEditText(note.notes ?? note.text ?? "");
  };

  // ---- Save Edit (Dialog)
  const saveEdit = async () => {
    if (!editing) return;
    if (!editTitle.trim() || !editText.trim()) {
      toast.warning("Title and Notes are required.");
      return;
    }

    setSavingEdit(true);
    const loadingId = toast.info("Updating note…");
    try {
      const res = await api.patch(
        `/api/client/note/${editing._id}?userId=${user?.employee_id}`,
        {
          title: editTitle.trim(),
          text: editText.trim(), // server maps -> notes
        }
      );

      if (res?.status === 200) {
        // optimistic local reconciliation
        setNotes((prev) =>
          prev
            ? prev.map((n) =>
                n._id === editing._id
                  ? {
                      ...n,
                      title: editTitle.trim(),
                      notes: editText.trim(),
                    }
                  : n
              )
            : prev
        );
        setEditing(null);
        toast.success("Note updated.");
      } else {
        toast.error("Failed to update note.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not update note.");
    } finally {
      setSavingEdit(false);
      toast.remove(loadingId);
    }
  };

  // ---- Effects
  useEffect(() => {
    handleGetAllClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClientId) fetchNotes(selectedClientId, noteSearchDebounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, noteSearchDebounced]);

  // ---- Derived
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const hay = [
        c.name,
        c.owner,
        c.team,
        c.status,
        ...c.tags,
        c.ownerDetails?.first_name,
        c.ownerDetails?.last_name,
        c.ownerDetails?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [clients, clientSearch]);

  const selectedClient = useMemo(
    () => clients?.find((c) => c._id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  // ---------- Render
  return (
    <div className={`h-full  ${state=="expanded"?"lg:w-[90%]":"lg:w-full"} w-full grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 p-4`}>
      {/* Left Rail - Clients */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle>Clients</CardTitle>
          <Input
            placeholder="Search by name, owner, tag…"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-13rem)]">
            {!clients ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No clients matched your query.
              </div>
            ) : (
              <ul className="divide-y">
                {filteredClients.map((c) => (
                  <li
                    key={c._id}
                    className={`p-3 cursor-pointer hover:bg-muted/60 transition ${
                      selectedClientId === c._id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedClientId(c._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Owner: {c.ownerDetails?.first_name}{" "}
                          {c.ownerDetails?.last_name} • Team: {c.team}
                        </div>
                      </div>
                      <Badge className={statusTone(c.status)} variant="outline">
                        {c.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.tags?.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Pane - Notes */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedClient ? selectedClient.name : "Select a client"}
            </CardTitle>
            {selectedClient && (
              <div className="text-xs text-muted-foreground">
                Due: {fmtDate(selectedClient.dueDate)}
              </div>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4 flex-1">
          {/* Notes Toolbar: Add + Search */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-full">
              <Label htmlFor="note-search">Search notes (title or body)</Label>
              <Input
                id="note-search"
                placeholder="Filter by title/notes…"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                disabled={!selectedClient}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    className="shrink-0 !text-white !bg-sky-500"
                    onClick={() => setAddOpen(true)}
                    disabled={!selectedClient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedClient
                    ? "Create a new note"
                    : "Select a client first"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator className="my-2" />

          {/* Notes List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {notesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : !selectedClient ? (
                <div className="text-sm text-muted-foreground">
                  Select a client to view contextual notes.
                </div>
              ) : notes && notes.length > 0 ? (
                <ul className="space-y-4">
                  {notes.map((n) => (
                    <li key={n._id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">
                          {n.createdByUser?.first_name &&
                          n.createdByUser?.last_name
                            ? `${n.createdByUser.first_name} ${n.createdByUser.last_name}`
                            : "User"}{" "}
                          • {fmtDate(n.createdAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEdit(n)}
                                  aria-label={`Edit ${n.noteId}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Badge variant="outline">{n.noteId}</Badge>
                        </div>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        <span className="font-medium">Title:</span> {n.title}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        <span className="font-medium">Notes:</span>{" "}
                        {n.notes ?? n.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No notes yet. Be the first mover and document the intel.
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>

        {/* Create Note Dialog */}
        <Dialog open={addOpen} onOpenChange={(o) => setAddOpen(o)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
              <DialogDescription>
                Capture the signal, minimize the noise.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="new-title">Title*</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={creating || !selectedClient}
                placeholder={
                  selectedClient
                    ? `Add a title for ${selectedClient.name}…`
                    : "Select a client first"
                }
              />

              <Label htmlFor="new-notes" className="mt-2">
                Notes*
              </Label>
              <Textarea
                id="new-notes"
                className="min-h-[120px]"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                disabled={creating || !selectedClient}
                placeholder={
                  selectedClient
                    ? `Add a note for ${selectedClient.name}…`
                    : "Select a client first"
                }
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              * required fields
            </p>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  setNewTitle("");
                  setNewText("");
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                className="!text-white !bg-sky-500"
                onClick={createNote}
                disabled={creating || !selectedClient}
              >
                {creating ? "Saving…" : "Create Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog
          open={!!editing}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Note {editing?.noteId}</DialogTitle>
              <DialogDescription>
                Refine the content and ship the update.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title*</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={savingEdit}
              />

              <Label htmlFor="edit-notes" className="mt-2">
                Notes*
              </Label>
              <Textarea
                id="edit-notes"
                className="min-h-[120px]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                disabled={savingEdit}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              * required fields
            </p>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                className="!text-white !bg-sky-500"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
