"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateBlogDialog } from "./CreateBlogDialog";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState([]);
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          const formattedData = data.data?.map((blog) => {
            return {
              _id: blog._id,
              title: blog.title || "",
              excerpt: blog.excerpt || "",
              date: blog.date || "",
              readTime: blog.readTime || "",
              category: blog.category || "",
              mediumLink: blog.mediumLink || "",
            };
          });
          setFormData(formattedData);
          setOriginalData(formattedData);
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

  const handleChange = (field, value, blogId) => {
    setFormData((prev) =>
      prev.map((blog) =>
        blog._id === blogId ? { ...blog, [field]: value } : blog
      )
    );
  };

  const hasChanges = (blogId) => {
    const current = formData.find((blog) => blog._id === blogId);
    const original = originalData.find((blog) => blog._id === blogId);

    if (!current || !original) return false;

    return [
      "title",
      "excerpt",
      "date",
      "readTime",
      "category",
      "mediumLink",
    ].some((key) => current[key].trim() !== original[key].trim());
  };

  const handleSubmit = async (blogId) => {
    if (!hasChanges(blogId)) return;

    setSaving(true);
    try {
      const payload = formData.find((blog) => blog._id === blogId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog/${blogId}`,
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground max-[800px]:text-xl">
            Blog Page
          </h1>
          <CreateBlogDialog
            setMainFormData={setFormData}
            setOriginalData={setOriginalData}
          />
        </div>

        <div className="space-y-3">
          {formData.length === 0 ? (
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">No blogs found.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button above to add your first blog.
              </p>
              <CreateBlogDialog
                setMainFormData={setFormData}
                setOriginalData={setOriginalData}
              />
            </Card>
          ) : (
            formData.map((blog, idx) => {
              return (
                <Card key={blog._id}>
                  <CardHeader>
                    <CardTitle>Blogs {idx + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={blog.title}
                          onChange={(e) =>
                            handleChange("title", e.target.value, blog._id)
                          }
                          placeholder="Enter the blog title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Excerpt</Label>
                        <Textarea
                          value={blog.excerpt}
                          onChange={(e) =>
                            handleChange("excerpt", e.target.value, blog._id)
                          }
                          className="resize-none"
                          placeholder="Enter the blog description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          value={blog.date}
                          onChange={(e) =>
                            handleChange("date", e.target.value, blog._id)
                          }
                          placeholder="Eg. Sep 14, 2025"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Read time</Label>
                        <Input
                          value={blog.readTime}
                          onChange={(e) =>
                            handleChange("readTime", e.target.value, blog._id)
                          }
                          placeholder="Eg. 6 min read"
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={blog.category}
                          onChange={(e) =>
                            handleChange("category", e.target.value, blog._id)
                          }
                          placeholder="Eg. Project Management"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                          value={blog.mediumLink}
                          onChange={(e) =>
                            handleChange("mediumLink", e.target.value, blog._id)
                          }
                          placeholder="Link of the blog"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          {hasChanges(blog._id) ? (
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
                          onClick={() => handleSubmit(blog._id)}
                          disabled={!hasChanges(blog._id) || saving}
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
