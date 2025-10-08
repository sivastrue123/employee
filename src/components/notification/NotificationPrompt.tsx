// src/components/notifications/NotificationPrompt.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function NotificationPrompt({
  open,
  onEnable,
  onDismiss,
}: {
  open: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => (!v ? onDismiss() : null)}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <AlertDialogTitle>Browser notifications</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm mt-2">
            Get notified in your browser when something important happens — like
            Clock in, tasks, updates.
          </AlertDialogDescription>
          <p className="text-xs mt-2">
            Watch{" "}
            <a className="underline" href="#" target="_blank" rel="noreferrer">
              this video tutorial
            </a>{" "}
            if the “Enable” button doesn’t work.
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onDismiss}>Not now</AlertDialogCancel>
          <AlertDialogAction
            onClick={onEnable}
            className="!bg-sky-600 !text-white hover:!bg-sky-700"
          >
            Enable notifications
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
