// hooks/useGroupState.ts
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

export function useGroupState(groups: Map<string, unknown[]>) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // seed new groups minimized; today's group open by default
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      const todayKey = format(new Date(), "yyyy-MM-dd");
      for (const key of Array.from(groups.keys())) {
        if (!(key in next)) next[key] = key === todayKey;
      }
      return next;
    });
  }, [groups]);

  const toggleGroup = (key: string) =>
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));

  const allOpen = useMemo(() => {
    let any = false;
    let all = true;
    for (const key of Array.from(groups.keys())) {
      any = true;
      all = all && !!openGroups[key];
    }
    return any && all;
  }, [groups, openGroups]);

  const toggleAllGroups = () => {
    const nextOpen = !allOpen;
    setOpenGroups(() => {
      const next: Record<string, boolean> = {};
      for (const key of Array.from(groups.keys())) next[key] = nextOpen;
      return next;
    });
  };

  return { openGroups, toggleGroup, allOpen, toggleAllGroups };
}
