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
import { toast } from "sonner";

export function CreateBlogDialog({ setMainFormData, setOriginalData }) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    date: "",
    readTime: "",
    category: "",
    mediumLink: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Blog Created Successfully");
        const formatedData = {
          _id: data.data._id,
          title: data.data.title || "",
          excerpt: data.data.excerpt || "",
          date: data.data.date || "",
          readTime: data.data.readTime || "",
          category: data.data.category || "",
          mediumLink: data.data.mediumLink || "",
        };
        setMainFormData((prev) => [...prev, formatedData]);
        setOriginalData((prev) => [...prev, formatedData]);
        setFormData({
          title: "",
          excerpt: "",
          date: "",
          readTime: "",
          category: "",
          mediumLink: "",
        });
        document.getElementById("close-blog-dialog")?.click();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Blog</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new Blog</DialogTitle>
            <DialogDescription>
              Fill the details and click Save to add a new blog.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {Object.entries({
              title: "Title",
              excerpt: "Excerpt",
              date: "Date",
              readTime: "Read Time",
              category: "Category",
              mediumLink: "Medium Link",
            }).map(([key, label]) => (
              <div className="grid gap-2" key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={`Enter ${label}`}
                  required
                />
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" id="close-blog-dialog">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Blog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
