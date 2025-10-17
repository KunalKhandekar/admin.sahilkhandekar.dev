"use client";

import { Card } from "@/components/ui/card";
import { useExperiences } from "@/hooks/useExperience";
import { useS3Upload } from "@/hooks/useS3Upload";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateExperienceDialog } from "./CreateExperienceDialog";
import { ExperienceCard } from "./ExperienceCard";

export default function ExperiencePage() {
  const {
    experiences,
    setExperiences,
    originalData,
    setOriginalData,
    loading,
  } = useExperiences();
  const [saving, setSaving] = useState(false);
  const { upload } = useS3Upload();

  const updateExperience = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp._id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const getChangedFields = (id) => {
    const current = experiences.find((exp) => exp._id === id);
    const original = originalData.find((exp) => exp._id === id);
    if (!current || !original) return null;

    const changedFields = {};
    const keys = [
      "companyLogo",
      "title",
      "location",
      "timeLine",
      "isCurrent",
      "keyAchievements",
      "technologiesUsed",
    ];

    keys.forEach((key) => {
      if (Array.isArray(current[key])) {
        if (current[key].join(",") !== original[key].join(",")) {
          changedFields[key] = current[key];
        }
      } else if (current[key] !== original[key]) {
        changedFields[key] = current[key];
      }
    });

    return Object.keys(changedFields).length > 0 ? changedFields : null;
  };

  const hasChanges = (id) => {
    return getChangedFields(id) !== null;
  };

  const handleSave = async (id) => {
    const changedFields = getChangedFields(id);
    if (!changedFields) return;

    setSaving(true);

    try {
      const expData = experiences.find((exp) => exp._id === id);

      // Upload new logo if it's a blob and logo field has changed
      if (
        changedFields.companyLogo?.startsWith("blob:") &&
        expData.selectedFile
      ) {
        try {
          changedFields.companyLogo = await upload(expData.selectedFile);
        } catch (err) {
          toast.error("Failed to upload image");
          return;
        }
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changedFields), // Only send changed fields
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Experience updated successfully!");
        // Update original data with current state
        setOriginalData((prev) =>
          prev.map((exp) =>
            exp._id === id ? { ...experiences.find((e) => e._id === id) } : exp
          )
        );
      } else {
        toast.error(data.message || "Failed to update experience");
      }
    } catch (error) {
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
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-semibold mb-2">No Experience yet</h3>
                <p className="mb-4">
                  Get started by creating your first experience
                </p>
                <CreateExperienceDialog
                  setMainFormData={setExperiences}
                  setOriginalData={setOriginalData}
                />
              </div>
            </div>
          ) : (
            experiences.map((exp, idx) => (
              <ExperienceCard
                key={exp._id}
                exp={exp}
                index={idx}
                onUpdate={updateExperience}
                onSave={handleSave}
                hasChanges={hasChanges(exp._id)}
                saving={saving}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
