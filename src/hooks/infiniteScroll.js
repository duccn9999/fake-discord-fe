import { useEffect, useState, useRef } from "react";
const useInfiniteScroll = (fetchData) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetchData(page);
      if (response.data.length > 0) {
        setItems((prevItems) => {
          return [...new Set([...prevItems, ...response.data])];
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Failed to fetch items: ", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
    return () => {
      console.log("fetching success!");
    };
  }, [page]);
  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 1.0,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return { items, loading, loaderRef };
};

export default useInfiniteScroll;
