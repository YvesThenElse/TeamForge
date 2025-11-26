import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Skill } from "@/types/skill";

interface SkillSelectorPopupProps {
  skills: Skill[];
  selectedSkillIds: string[];
  onSelect: (skillId: string) => void;
  onClose: () => void;
}

export function SkillSelectorPopup({
  skills,
  selectedSkillIds,
  onSelect,
  onClose,
}: SkillSelectorPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category).filter((c): c is string => Boolean(c)));
    return ["All", ...Array.from(cats).sort()];
  }, [skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [skills, selectedCategory, searchQuery]);

  const handleSelect = (skillId: string) => {
    onSelect(skillId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Select Skill</h2>
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
              placeholder="Search skills (min 3 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === "All"
                ? skills.length
                : skills.filter((s) => s.category === category).length;

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

        {/* Skill list */}
        <div className="flex-1 overflow-auto p-4">
          {filteredSkills.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No skills found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);

                return (
                  <Card
                    key={skill.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelect(skill.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {skill.name}
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CardTitle>
                          {skill.description && (
                            <CardDescription className="text-sm mt-1">
                              {skill.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Category: {skill.category || "Uncategorized"}
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
