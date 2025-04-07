import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const useInfiniteScroll = (URL, custom, size) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const token = useSelector((state) => state.token.value);

  // Reset items and page when `custom` changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [custom]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(URL, {
          params: { custom, page, items: size },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.length > 0) {
          setItems((prevItems) => {
            const newItems = response.data.filter(
              (newItem) =>
                !prevItems.some(
                  (prevItem) => prevItem.messageId === newItem.messageId
                )
            );
            return [...prevItems, ...newItems];
          });
        } else {
          setHasMore(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          console.error("Error when fetching:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, custom, URL, token]); // Ensure dependencies are necessary

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[entries.length - 1];
        if (target.isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        root: null, // Set the scrollable container as the root
        rootMargin: "0px 0px 20px 0px", // Adjust margin to detect the top
        threshold: 0.1, // Trigger when 10% of the loader is visible
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return { items, loading, hasMore, loaderRef };
};

export default useInfiniteScroll;
