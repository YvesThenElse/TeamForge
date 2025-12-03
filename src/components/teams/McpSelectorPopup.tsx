import { useState, useMemo } from "react";
import { X, Search, Check, Server, Terminal, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { McpServer } from "@/types/mcp";

interface McpSelectorPopupProps {
  mcps: McpServer[];
  selectedMcpIds: string[];
  onSelect: (mcpId: string) => void;
  onClose: () => void;
}

export function McpSelectorPopup({
  mcps,
  selectedMcpIds,
  onSelect,
  onClose,
}: McpSelectorPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(mcps.map((m) => m.category).filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [mcps]);

  // Filter MCPs
  const filteredMcps = useMemo(() => {
    let filtered = mcps;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [mcps, selectedCategory, searchQuery]);

  const handleSelect = (mcpId: string) => {
    onSelect(mcpId);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stdio":
        return <Terminal className="h-3 w-3" />;
      case "http":
      case "sse":
        return <Globe className="h-3 w-3" />;
      default:
        return <Server className="h-3 w-3" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col border border-purple-200 dark:border-purple-800/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-purple-50/50 dark:bg-purple-950/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-500" />
            Select MCP Server
          </h2>
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
              placeholder="Search MCP servers (min 3 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === "All"
                ? mcps.length
                : mcps.filter((m) => m.category === category).length;

              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* MCP list */}
        <div className="flex-1 overflow-auto p-4">
          {filteredMcps.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No MCP servers found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMcps.map((mcp) => {
                const isSelected = selectedMcpIds.includes(mcp.id);

                return (
                  <Card
                    key={mcp.id}
                    className={`cursor-pointer transition-all border-purple-200 dark:border-purple-800/30 ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                        : "hover:border-purple-400 dark:hover:border-purple-600"
                    }`}
                    onClick={() => handleSelect(mcp.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Server className="h-4 w-4 text-purple-500" />
                            {mcp.name}
                            {isSelected && (
                              <Check className="h-4 w-4 text-purple-500" />
                            )}
                          </CardTitle>
                          {mcp.description && (
                            <CardDescription className="text-sm mt-1">
                              {mcp.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
                          {mcp.category}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(mcp.type)}
                          {mcp.type}
                        </Badge>
                      </div>
                      {mcp.tags && mcp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mcp.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {mcp.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{mcp.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
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
