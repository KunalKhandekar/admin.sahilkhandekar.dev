"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    miniDescription: "",
    description: "",
    currentFocus: "",
    skills: "",
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/about`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          const formatted = {
            name: data.data.name || "",
            role: data.data.role || "",
            miniDescription: data.data.miniDescription || "",
            description: data.data.description || "",
            currentFocus: data.data.currentFocus || "",
            skills: (data.data.skills || []).join(", "),
          };
          setFormData(formatted);
          setOriginalData(formatted);
        } else {
          toast.error("Failed to load data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      if (key === "skills") {
        const current = formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean) // Removes "" empty string
          .sort();
        const original = originalData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .sort();
        return JSON.stringify(current) !== JSON.stringify(original);
      }
      return formData[key]?.trim() !== originalData[key]?.trim();
    });
  };

  const handleSubmit = async () => {
    if (!hasChanges()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/about`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Changes saved successfully!");
        setOriginalData(formData);
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update");
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
        <div>
          <h1 className="text-3xl font-bold text-foreground max-[800px]:text-xl">About Page</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                />
              </div>

              <div className="space-y-2">
                <Label>Mini Description</Label>
                <Input
                  value={formData.miniDescription}
                  onChange={(e) =>
                    handleChange("miniDescription", e.target.value)
                  }
                  placeholder="Brief tagline or headline"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tell your story..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Current Focus</Label>
                <Input
                  value={formData.currentFocus}
                  onChange={(e) => handleChange("currentFocus", e.target.value)}
                  placeholder="What are you working on?"
                />
              </div>

              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  placeholder="React, Node.js, TypeScript, Python..."
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  {hasChanges() ? (
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
                  onClick={handleSubmit}
                  disabled={!hasChanges() || saving}
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
      </div>
    </div>
  );
}
