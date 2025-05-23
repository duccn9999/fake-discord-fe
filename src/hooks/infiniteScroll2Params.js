import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function useInfiniteScroll2Params(api, q) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const token = useSelector((state) => state.token.value);
  const itemsPerPage = 30;
  const pageRef = useRef(0);
  useEffect(() => {
    pageRef.current = page;
  },[page]);

  // Reset page and items when the API or query changes
  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [api, q.sender, q.receiver]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${api}/${q.sender}/${q.receiver}`, {
          params: { page: pageRef.current, itemsPerPage },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.length > 0) {
          setItems((prevItems) => {
            const existingIds = new Set(
              prevItems.map((item) => item.messageId)
            );
            const filteredNewItems = response.data.filter(
              (item) => !existingIds.has(item.messageId)
            );
            return [...filteredNewItems, ...prevItems]; // Prepend for upward scroll
          });
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, api, token, q.sender, q.receiver]);
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
}

export default useInfiniteScroll2Params;
