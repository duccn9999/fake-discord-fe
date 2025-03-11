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
    const controller = new AbortController(); // Create a new controller
    const signal = controller.signal; // Extract the signal

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(URL, {
          params: { custom: custom, page: page, items: size },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal, // Pass the signal to axios
        });

        if (response.data.length > 0) {
          setItems((prevItems) => [...new Set([...prevItems, ...response.data])]);
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

    return () => {
      controller.abort(); // Cancel the request if the effect is cleaned up
    };
  }, [page, custom, URL, token]);

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
        root: null,
        rootMargin: "20px",
        threshold: 1,
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
