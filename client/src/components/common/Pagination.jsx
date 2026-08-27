const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
