import React, { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { useBreakpoint, Breakpoint } from "@/hooks/use-breakpoint";
import { Button } from "@/components/ui/button";

const breakpoints: Breakpoint[] = ["mobile", "tablet", "desktop"];

export const DevToolToggle: React.FC = () => {
  // Só renderizar em localhost ou development
  const isDevHost = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(window.location.hostname);
  const isDev = import.meta.env.DEV || isDevHost;
  const [open, setOpen] = useState(false);
  const [viewportOverride, setViewportOverride] = useState<Breakpoint | "">(() => {
    return (localStorage.getItem("devViewportOverride") as Breakpoint) || "";
  });
  const [roleOverride, setRoleOverride] = useState<"" | "owner" | "admin" | "doctor" | "staff" | "receptionist">(() => {
    return (localStorage.getItem("devRoleOverride") as any) || "";
  });

  const breakpoint = useBreakpoint();

  useEffect(() => {
    if (viewportOverride) {
      localStorage.setItem("devViewportOverride", viewportOverride);
      window.dispatchEvent(new Event("resize")); // força recalculo
    } else {
      localStorage.removeItem("devViewportOverride");
    }
  }, [viewportOverride]);

  useEffect(() => {
    if (roleOverride) {
      localStorage.setItem("devRoleOverride", roleOverride);
    } else {
      localStorage.removeItem("devRoleOverride");
    }
  }, [roleOverride]);

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 text-xs">
      {open ? (
        <div className="bg-card border shadow-lg rounded-md p-4 space-y-2 w-56">
          <div>
            <p className="mb-1 font-medium">Viewport</p>
            <div className="flex gap-1 flex-wrap">
              {breakpoints.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={viewportOverride === r || (!viewportOverride && breakpoint === r) ? "default" : "outline"}
                  onClick={() =>
                    setViewportOverride(viewportOverride === r ? "" : r)
                  }
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 font-medium">Role override</p>
            <div className="flex gap-1 flex-wrap">
              {["owner", "admin", "doctor", "staff", "receptionist"].map((role) => (
                <Button
                  key={role}
                  size="sm"
                  variant={roleOverride === role ? "default" : "outline"}
                  onClick={() =>
                    setRoleOverride(roleOverride === role ? "" : (role as any))
                  }
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>

          <Button size="sm" className="w-full" variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </div>
      ) : (
        <Button size="icon" variant="outline" onClick={() => setOpen(true)}>
          <UserCog className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}; 