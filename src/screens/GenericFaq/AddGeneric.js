import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function GenericFAQAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      faqs: [{ question: "", answer: "" }],
      for: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch FAQ data when editing
  useEffect(() => {
    const fetchFAQsData = async () => {
      if (id) {
        try {
          const token = localStorage.getItem("User-admin-token");
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}/admin/faq/${id}`,
            {
              headers: { Authorization: token },
            }
          );

          const faqData = response?.data?.data;
          if (faqData) {
            reset({
              faqs: faqData?.faqEntries?.length
                ? faqData.faqEntries
                : [{ question: "", answer: "" }],
              for: faqData?.for || "",
            });
          }
        } catch (error) {
          console.error("Error fetching FAQ data:", error);
        }
      }
    };

    fetchFAQsData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("User-admin-token");
      const sanitizedFAQs = data.faqs.map(({ _id, ...rest }) => rest);
      const formattedData = {
        faqEntries: sanitizedFAQs,
        for: data.for,
      };

      const response = id
        ? await axios.patch(
            `${process.env.REACT_APP_BASEURL}/admin/faq/${id}`,
            formattedData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
              },
            }
          )
        : await axios.post(
            `${process.env.REACT_APP_BASEURL}/admin/faq`,
            formattedData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
              },
            }
          );

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/generic-faq");
      } else {
        toast.error("FAQ not saved");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
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
            position: "relative",
            padding: "10px 20px",
          }}
        >
          <span style={{ marginRight: "8px" }}>&lt;</span>
          <span style={{ position: "relative", display: "inline-block" }}>
            Back
            <span
              style={{
                content: "''",
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

        <h2>{id ? "Edit Generic FAQ" : "Add Generic FAQ"}</h2>
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-6">
            <label className="form-label">FAQ For</label>
            <select
              className={`form-select ${errors.for ? "is-invalid" : ""}`}
              {...register("for", {
                required: "Please select who this FAQ is for.",
                validate: (value) =>
                  value === "user" || value === "astro" || "Invalid selection",
              })}
            >
              <option value="">Select</option>
              <option value="user">User</option>
              <option value="astro">Astro</option>
            </select>
            {errors.for && (
              <div className="invalid-feedback">{errors.for.message}</div>
            )}
          </div>

          <div className="col-md-12">
            {fields.map((item, index) => (
              <div key={item.id} className="mb-4 border rounded p-3">
                <label className="form-label">Question</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter your question"
                  {...register(`faqs[${index}].question`, {
                    required: "Question is required",
                  })}
                />
                {errors.faqs?.[index]?.question && (
                  <span className="text-danger">
                    {errors.faqs[index].question.message}
                  </span>
                )}

                <label className="form-label mt-3">Answer</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter your answer"
                  {...register(`faqs[${index}].answer`, {
                    required: "Answer is required",
                  })}
                />
                {errors.faqs?.[index]?.answer && (
                  <span className="text-danger">
                    {errors.faqs[index].answer.message}
                  </span>
                )}

                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger mt-2"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => append({ question: "", answer: "" })}
            >
              Add FAQ
            </button>
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

export default GenericFAQAdd;
