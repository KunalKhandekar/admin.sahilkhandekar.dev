import { useEffect, useState } from "react";

export const useExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/experience`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          const formatted = data.data?.map((exp) => ({
            _id: exp._id,
            companyLogo: exp.companyLogo || "/placeholder.png",
            title: exp.title || "",
            location: exp.location || "",
            timeLine: exp.timeLine || "",
            isCurrent: exp.isCurrent || false,
            keyAchievements: exp.keyAchievements || [],
            technologiesUsed: exp.technologiesUsed || [],
          }));
          setExperiences(formatted);
          setOriginalData(formatted);
        } else {
          toast.error(data.message || "Failed to fetch experiences");
        }
      } catch (error) {
        toast.error("Error fetching experiences");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    experiences,
    setExperiences,
    originalData,
    setOriginalData,
    loading,
  };
};
