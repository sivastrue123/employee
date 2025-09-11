// src/widgets/QuickActionsCard.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Action = {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  to?: string; // if you prefer linking
};

export function QuickActionsCard({
  title = "Quick Actions",
  actions,
  dark = true,
}: {
  title?: any;
  actions: Action[];
  dark?: boolean;
}) {
  return (
    <Card
      className={
        dark
          ? "border-0 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white"
          : ""
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((a, idx) => {
          const Icon = a.icon;
          return (
            <Button
              key={idx}
              variant={dark ? "secondary" : "default"}
              className={dark ? "w-full justify-start !bg-white/10 hover:!bg-white/20 !text-white border-0" : "w-full justify-start"}
              onClick={a.onClick}
              asChild={!!a.to}
            >
              {a.to ? (
                <a href={a.to}>
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {a.label}
                </a>
              ) : (
                <>
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {a.label}
                </>
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
