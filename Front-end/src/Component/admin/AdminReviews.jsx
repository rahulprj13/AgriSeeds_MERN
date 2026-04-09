import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Trash2, Star, Loader, Eye } from "lucide-react";

const AdminReviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/reviews");
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteReview = async (reviewId) => {
    try {
      setDeleting(reviewId);
      await axios.delete(`/api/admin/reviews/${reviewId}`);

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted successfully!");

      if (selectedReview?._id === reviewId) {
        closeReviewModal();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteReview = (reviewId, reviewTitle = "this review") => {
    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 text-sm font-bold text-gray-800">
            Delete <span className="text-red-500">{reviewTitle}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeToast}
              className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                executeDeleteReview(reviewId);
                closeToast();
              }}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-[10px] font-black uppercase text-white shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
    setShowModal(false);
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      !searchTerm ||
      review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPaginationPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const paginationPages = getPaginationPages();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reviews Management</h1>
        <p className="text-slate-600 mt-2">Manage product reviews from customers</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/50 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by user, product, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Filter by Rating</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
          <p className="text-slate-600 text-sm font-bold mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-slate-900">{reviews.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
          <p className="text-slate-600 text-sm font-bold mb-1">Filtered Reviews</p>
          <p className="text-3xl font-bold text-green-600">{filteredReviews.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
          <p className="text-slate-600 text-sm font-bold mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-500">
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No reviews found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Sr. No.</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {currentReviews.map((review, index) => (
                  <tr key={review._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{review.userName}</p>
                        <p className="text-xs text-slate-500">{review.userId?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {review.productId?.image && (
                          <img
                            src={review.productId.image}
                            alt="Product"
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{review.productId?.name}</p>
                          {review.productId?.price && (
                            <p className="text-xs text-slate-500">₹{review.productId.price}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 line-clamp-2">{review.title}</p>
                    </td>

                    <td className="px-6 py-4 text-center">{renderStars(review.rating)}</td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openReviewModal(review)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteReview(review._id, review.title || "this review")}
                          disabled={deleting === review._id}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                          title="Delete review"
                        >
                          {deleting === review._id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredReviews.length > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">
              {Math.min(endIndex, filteredReviews.length)}
            </span>{" "}
            of <span className="font-bold text-gray-700">{filteredReviews.length}</span> reviews
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            {paginationPages.map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="px-2 text-sm font-bold text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                    currentPage === page
                      ? "bg-green-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-96 w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review Details</h2>
              </div>
              <button
                onClick={closeReviewModal}
                className="text-2xl text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">User</p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{selectedReview.userName}</p>
                  <p className="text-sm text-slate-600">{selectedReview.userId?.email}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">Product</p>
                <div className="flex gap-3 rounded-lg bg-slate-50 p-3">
                  {selectedReview.productId?.image && (
                    <img
                      src={selectedReview.productId.image}
                      alt="Product"
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{selectedReview.productId?.name}</p>
                    {selectedReview.productId?.price && (
                      <p className="text-sm text-slate-600">₹{selectedReview.productId.price}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">Rating</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">Title</p>
                <p className="text-slate-900">{selectedReview.title}</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">Comment</p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-slate-900">{selectedReview.comment}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600">Posted On</p>
                <p className="text-slate-900">
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <button
                  onClick={() =>
                    handleDeleteReview(
                      selectedReview._id,
                      selectedReview.title || "this review"
                    )
                  }
                  disabled={deleting === selectedReview._id}
                  className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:bg-gray-400"
                >
                  {deleting === selectedReview._id ? (
                    <>
                      <Loader className="mr-2 inline animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 inline" size={18} />
                      Delete Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;