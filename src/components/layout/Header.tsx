import { Hammer } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <Hammer className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TeamForge</h1>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">v0.1.0</span>
        </div>
      </div>
    </header>
  );
}
