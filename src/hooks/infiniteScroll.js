import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
function useInfiniteScroll(api, q) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const itemsPerPage = 15;
  const token = useSelector((state) => state.token.value);
  useEffect(() => {
    axios
      .get(`${api}/${q}`, {
        params: { page, itemsPerPage },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setItems((prevItems) => [...prevItems, ...response.data]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.messageId);
      if (element) {
        observer.observe(element);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, [page, token, api, itemsPerPage, q]);
  return { items };
}

export default useInfiniteScroll;
