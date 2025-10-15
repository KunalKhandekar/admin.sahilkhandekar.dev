"use client";

import { TagInput } from "@/components/TagInput";
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
import { useS3Upload } from "@/hooks/useS3Upload";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const INITIAL_FORM = {
  companyLogo: "/placeholder.png",
  title: "",
  location: "",
  timeLine: "",
  isCurrent: false,
  keyAchievements: [],
  technologiesUsed: [],
};

export function CreateExperienceDialog({ setMainFormData, setOriginalData }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("/placeholder.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const { upload, uploading } = useS3Upload();

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addTag = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], value] }));
  };

  const removeTag = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setLogoPreview("/placeholder.png");
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let companyLogoUrl = formData.companyLogo;

      if (selectedFile) {
        companyLogoUrl = await upload(selectedFile);
      } else {
        toast.error("Please select a company logo");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...formData, companyLogo: companyLogoUrl }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Experience added successfully!");
        const newEntry = { _id: data.data._id, ...data.data };
        setMainFormData((prev) => [...prev, newEntry]);
        setOriginalData((prev) => [...prev, newEntry]);
        resetForm();
        document.getElementById("close-experience-dialog")?.click();
      } else {
        toast.error(data.message || "Failed to add experience");
      }
    } catch (error) {
      toast.error(error.message || "Server error");
    } finally {
      setLoading(false);
    }
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
            <div className="grid gap-2">
              <Label>Company Logo</Label>
              <Image
                src={logoPreview}
                alt="Logo Preview"
                width={100}
                height={100}
                className="object-contain p-1"
                unoptimized={logoPreview.startsWith("blob:")}
              />
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {uploading && (
                <div className="text-sm mt-1">Uploading image...</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter role title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Eg. San Francisco, CA"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Timeline</Label>
              <Input
                value={formData.timeLine}
                onChange={(e) => updateField("timeLine", e.target.value)}
                placeholder="Eg. Jan 2023 - Present"
                disabled={formData.isCurrent}
                required={!formData.isCurrent}
              />
            </div>

            <div className="flex items-center space-x-4 mt-2">
              <Switch
                checked={formData.isCurrent}
                onCheckedChange={(checked) => updateField("isCurrent", checked)}
              />
              <span>Current Role</span>
            </div>

            <TagInput
              label="Key Achievements"
              tags={formData.keyAchievements}
              onAdd={(value) => addTag("keyAchievements", value)}
              onRemove={(i) => removeTag("keyAchievements", i)}
              placeholder="Add achievement"
            />

            <TagInput
              label="Technologies Used"
              tags={formData.technologiesUsed}
              onAdd={(value) => addTag("technologiesUsed", value)}
              onRemove={(i) => removeTag("technologiesUsed", i)}
              placeholder="Add technology"
            />
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" id="close-experience-dialog">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Saving..." : "Save Experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
