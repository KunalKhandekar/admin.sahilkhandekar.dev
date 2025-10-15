import { useState } from "react";

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/getS3UploadURL`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        }
      );

      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to get upload URL");

      await fetch(data.data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}${data.data.s3ObjectKey}`;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
};
