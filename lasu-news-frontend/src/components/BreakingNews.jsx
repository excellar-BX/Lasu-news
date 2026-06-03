import { useState, useEffect } from "react";
import { getBreakingNews } from "../api/breakingNews";

const BreakingNews = () => {
  const [breakingNews, setBreakingNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const data = await getBreakingNews();
        setBreakingNews(data);
      } catch (error) {
        console.error("Failed to fetch breaking news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  if (loading || breakingNews.length === 0) {
    return null;
  }

  const tickerContent = breakingNews
    .map((item) => item.content)
    .join(" \u00A0\u00A0\u25CF\u00A0\u00A0 ");

  return (
    <div className="bg-[#e63946] text-white text-xs py-1.5 overflow-hidden">
      <div className="flex items-center">
        <span className="shrink-0 bg-white text-[#e63946] font-black
                         text-[10px] px-3 py-0.5 mr-4 uppercase
                         tracking-wider">
          Breaking
        </span>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap">
            {tickerContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
