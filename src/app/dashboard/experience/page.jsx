"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { CreateExperienceDialog } from "./CreateExperienceDialog";
import { Badge } from "@/components/ui/badge";

export default function ExperiencePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newTechnology, setNewTechnology] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          const formattedData = data.data?.map((exp) => ({
            _id: exp._id,
            companyLogo: exp.companyLogo || "/placeholder.png",
            title: exp.title || "",
            location: exp.location || "",
            timeLine: exp.timeLine || "",
            isCurrent: exp.isCurrent || false,
            keyAchievements: exp.keyAchievements || [],
            technologiesUsed: exp.technologiesUsed || [],
          }));
          setExperiences(formattedData);
          setOriginalData(formattedData);
        } else {
          toast.error(data.message || "Failed to fetch experiences");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching experiences");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value, id) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp._id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleAddTag = (field, value, id, setValue) => {
    if (!value.trim()) return;
    setExperiences((prev) =>
      prev.map((exp) =>
        exp._id === id
          ? { ...exp, [field]: [...exp[field], value.trim()] }
          : exp
      )
    );
    setValue("");
  };

  const handleRemoveTag = (field, id, index) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp._id === id
          ? { ...exp, [field]: exp[field].filter((_, i) => i !== index) }
          : exp
      )
    );
  };

  const handleFileChange = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewURL = URL.createObjectURL(file);
      setExperiences((prev) =>
        prev.map((exp) =>
          exp._id === id ? { ...exp, companyLogo: previewURL } : exp
        )
      );
    }
  };

  const hasChanges = (id) => {
    const current = experiences.find((exp) => exp._id === id);
    const original = originalData.find((exp) => exp._id === id);

    if (!current || !original) return false;

    const keys = [
      "companyLogo",
      "title",
      "location",
      "timeLine",
      "isCurrent",
      "keyAchievements",
      "technologiesUsed",
    ];

    return keys.some((key) => {
      if (Array.isArray(current[key])) {
        return current[key].join(",") !== original[key].join(",");
      }
      return current[key] !== original[key];
    });
  };

  const handleSave = async (id) => {
    if (!hasChanges(id)) return;
    setSaving(true);

    try {
      const expData = experiences.find((exp) => exp._id === id);
      const payload = { ...expData };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Experience updated successfully!");
        setOriginalData(experiences);
      } else {
        toast.error(data.message || "Failed to update experience");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving experience");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-[800px]:p-2">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground max-[800px]:text-xl">
            Experience Page
          </h1>
          <CreateExperienceDialog
            setMainFormData={setExperiences}
            setOriginalData={setOriginalData}
          />
        </div>

        <div className="space-y-3">
          {experiences.length === 0 ? (
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">No experiences found.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button above to add your first experience.
              </p>
              <CreateExperienceDialog
                setMainFormData={setExperiences}
                setOriginalData={setOriginalData}
              />
            </Card>
          ) : (
            experiences.map((exp, idx) => {
              return (
                <Card key={exp._id}>
                  <CardHeader>
                    <CardTitle>Experience {idx + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {/* Company Logo */}
                      <div className="grid gap-2">
                        <Label>Company Logo</Label>
                        <img
                          src={exp.companyLogo}
                          alt="Company Logo"
                          className="w-24 h-24 object-contain border"
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(exp._id, e)}
                        />
                      </div>
                      {/* Title */}
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) =>
                            handleChange("title", e.target.value, exp._id)
                          }
                        />
                      </div>
                      {/* Location */}
                      <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) =>
                            handleChange("location", e.target.value, exp._id)
                          }
                        />
                      </div>
                      {/* Timeline */}
                      <div className="grid gap-2">
                        <Label>Timeline</Label>
                        <Input
                          value={exp.timeLine}
                          onChange={(e) =>
                            handleChange("timeLine", e.target.value, exp._id)
                          }
                        />
                      </div>
                      {/* Current Role */}
                      <div className="flex items-center space-x-4 mt-2">
                        <Switch
                          checked={exp.isCurrent}
                          onCheckedChange={(checked) =>
                            handleChange("isCurrent", checked, exp._id)
                          }
                        />
                        <span>Current Role</span>
                      </div>

                      {/* Key Achievements */}
                      <div className="grid gap-2">
                        <Label>Key Achievements</Label>
                        <div className="flex flex-wrap gap-2">
                          {exp.keyAchievements.map((tag, i) => (
                            <Badge
                              key={i}
                              variant={"outline"}
                              className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg max-w-full break-words"
                            >
                              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                {tag}
                              </span>
                              <button
                                type="button"
                                className="text-sm"
                                onClick={() =>
                                  handleRemoveTag("keyAchievements", exp._id, i)
                                }
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={newAchievement}
                            onChange={(e) => setNewAchievement(e.target.value)}
                            placeholder="Add achievement"
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              handleAddTag(
                                "keyAchievements",
                                newAchievement,
                                exp._id,
                                setNewAchievement
                              )
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      {/* Technologies Used */}
                      <div className="grid gap-2">
                        <Label>Technologies Used</Label>
                        <div className="flex gap-2 flex-wrap">
                          {exp.technologiesUsed.map((tag, i) => (
                            <Badge
                              key={i}
                              variant={"outline"}
                              className="flex items-center gap-2 px-3 py-1 rounded-lg"
                            >
                              {tag}
                              <button
                                type="button"
                                className="text-sm"
                                onClick={() =>
                                  handleRemoveTag(
                                    "technologiesUsed",
                                    exp._id,
                                    i
                                  )
                                }
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={newTechnology}
                            onChange={(e) => setNewTechnology(e.target.value)}
                            placeholder="Add technology"
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              handleAddTag(
                                "technologiesUsed",
                                newTechnology,
                                exp._id,
                                setNewTechnology
                              )
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      {/* Save Button */}
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          {hasChanges(exp._id) ? (
                            <span className="text-amber-500 font-medium">
                              Unsaved changes
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">
                              All changes saved
                            </span>
                          )}
                        </p>
                        <Button
                          onClick={() => handleSave(exp._id)}
                          disabled={!hasChanges(exp._id) || saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
