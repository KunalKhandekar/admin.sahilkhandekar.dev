"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CreateExperienceDialog({ setMainFormData, setOriginalData }) {
  const [formData, setFormData] = useState({
    companyLogo: "/placeholder.png",
    title: "",
    location: "",
    timeLine: "",
    isCurrent: false,
    keyAchievements: [],
    technologiesUsed: [],
  });

  const [loading, setLoading] = useState(false);
  const [newAchievement, setNewAchievement] = useState("");
  const [newTechnology, setNewTechnology] = useState("");
  const [logoPreview, setLogoPreview] = useState("/placeholder.png");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (field, value, setValue) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    setValue("");
  };

  const handleRemoveTag = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewURL = URL.createObjectURL(file);
      setLogoPreview(previewURL);
      setFormData((prev) => ({ ...prev, companyLogo: previewURL }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Experience added successfully!");
        const formattedData = {
          _id: data.data._id,
          ...data.data,
        };
        setMainFormData((prev) => [...prev, formattedData]);
        setOriginalData((prev) => [...prev, formattedData]);

        setFormData({
          companyLogo: "/placeholder.png",
          title: "",
          location: "",
          timeLine: "",
          isCurrent: false,
          keyAchievements: [],
          technologiesUsed: [],
        });
        setLogoPreview("/placeholder.png");
        document.getElementById("close-experience-dialog")?.click();
      } else {
        toast.error(data.message || "Failed to add experience");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Experience</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new Experience</DialogTitle>
            <DialogDescription>
              Fill the details and click Save to add a new experience.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {/* Company Logo */}
            <div className="grid gap-2">
              <Label>Company Logo</Label>
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-24 h-24 object-contain mb-2 border"
              />
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter role title"
                required
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Eg. San Francisco, CA"
                required
              />
            </div>

            {/* Timeline */}
            <div className="grid gap-2">
              <Label>Timeline</Label>
              <Input
                value={formData.timeLine}
                onChange={(e) => handleChange("timeLine", e.target.value)}
                placeholder="Eg. Jan 2023 - Present"
                disabled={formData.isCurrent}
                required={!formData.isCurrent}
              />
            </div>

            {/* Current Role Switch */}
            <div className="flex items-center space-x-4 mt-2">
              <Switch
                checked={formData.isCurrent}
                onCheckedChange={(checked) =>
                  handleChange("isCurrent", checked)
                }
              />
              <span>Current Role</span>
            </div>

            {/* Key Achievements */}
            <div className="grid gap-2">
              <Label>Key Achievements</Label>
              <div className="flex flex-wrap gap-2">
                {formData.keyAchievements.map((tag, i) => (
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
                        handleRemoveTag("keyAchievements", i)
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
                {formData.technologiesUsed.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="flex items-center gap-2 rounded-lg px-3 py-1"
                  >
                    {tag}
                    <button
                      type="button"
                      className="text-sm"
                      onClick={() => handleRemoveTag("technologiesUsed", idx)}
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
                      setNewTechnology
                    )
                  }
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" id="close-experience-dialog">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
