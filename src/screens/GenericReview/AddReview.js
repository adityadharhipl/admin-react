import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function GenericReviewAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      rating: "",
      message: "",
      status: "pending",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch and prefill data
  useEffect(() => {
    if (id) {
      const fetchReview = async () => {
        try {
          const token = localStorage.getItem("User-admin-token");
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}/admin/feedback/${id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          const reviewData = response?.data?.data;
          if (reviewData) {
            setValue("rating", reviewData.rating || "");
            setValue("message", reviewData.message || "");
            setValue("status", reviewData.status || "pending");
          }
        } catch (err) {
          console.error("Error fetching review:", err);
          toast.error("Failed to fetch review data");
        }
      };

      fetchReview();
    }
  }, [id, setValue]);

  // ✅ Submit handler
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("User-admin-token");

      const response = id
        ? await axios.patch(
          `${process.env.REACT_APP_BASEURL}/admin/feedbackUpdate/${id}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        )
        : await axios.post(
          `${process.env.REACT_APP_BASEURL}/admin/review`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Review saved successfully!");
        navigate("/astro-reviews");
      } else {
        toast.error("Review not saved");
      }
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={true} />
      <div className="card-body">
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: "10px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "18px",
            color: "#007bff",
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
          }}
        >
          <span style={{ marginRight: "8px" }}>&lt;</span>
          <span style={{ position: "relative", display: "inline-block" }}>
            Back
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -2,
                width: "100%",
                height: "1px",
                borderBottom: "2px solid #007bff",
              }}
            ></span>
          </span>
        </button>

        <h2>{id ? "Edit Generic Review" : "Add Generic Review"}</h2>

        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Message Field */}
          <div className="col-md-12">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Enter your message"
              {...register("message", { required: "Message is required" })}
            />
            {errors.message && (
              <span className="text-danger">{errors.message.message}</span>
            )}
          </div>

          {/* Rating Field */}
          <div className="col-md-6">
            <label className="form-label">Rating</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter rating (1–5)"
              {...register("rating", {
                required: "Rating is required",
                min: { value: 1, message: "Minimum rating is 1" },
                max: { value: 5, message: "Maximum rating is 5" },
              })}
            />
            {errors.rating && (
              <span className="text-danger">{errors.rating.message}</span>
            )}
          </div>

          {/* Status Field */}
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              {...register("status", { required: "Status is required" })}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {errors.status && (
              <span className="text-danger">{errors.status.message}</span>
            )}
          </div>

          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary text-uppercase px-3"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default GenericReviewAdd;
