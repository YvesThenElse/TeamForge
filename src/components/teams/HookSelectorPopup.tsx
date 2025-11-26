import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Hook } from "@/types/hook";

interface HookSelectorPopupProps {
  hooks: Hook[];
  selectedHookIds: string[];
  onSelect: (hookId: string) => void;
  onClose: () => void;
}

export function HookSelectorPopup({
  hooks,
  selectedHookIds,
  onSelect,
  onClose,
}: HookSelectorPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(hooks.map((h) => h.category));
    return ["All", ...Array.from(cats).sort()];
  }, [hooks]);

  // Filter hooks
  const filteredHooks = useMemo(() => {
    let filtered = hooks;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((h) => h.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.description.toLowerCase().includes(query) ||
          h.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          h.event.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [hooks, selectedCategory, searchQuery]);

  const handleSelect = (hookId: string) => {
    onSelect(hookId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Select Hook</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and filters */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search hooks (min 3 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === "All"
                ? hooks.length
                : hooks.filter((h) => h.category === category).length;

              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Hook list */}
        <div className="flex-1 overflow-auto p-4">
          {filteredHooks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No hooks found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredHooks.map((hook) => {
                const isSelected = selectedHookIds.includes(hook.id);

                return (
                  <Card
                    key={hook.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelect(hook.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {hook.name}
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {hook.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {hook.event}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {hook.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hook.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-muted text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
