import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const nextPage = () => {
    if (hasNext) setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (hasPrev) setPage((prev) => prev - 1);
  };

  return { page, limit, total, totalPages, setPage, setLimit, setTotal, setTotalPages, hasNext, hasPrev, nextPage, prevPage };
};
