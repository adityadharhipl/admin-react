import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AddReferEarnFAQs() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("User-admin-token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      faqs: [{ question: "", answer: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReferEarnFAQ = async () => {
      if (!id) return;

      try {
        const response = await axios.get(
          `https://preprod.User-balaji.store/API/admin/faq?type=referEarn`,
          {
            headers: { Authorization: `${token}` },
          }
        );


        const allFaqData = response?.data?.data?.[0]?.faqEntries || [];
        if (allFaqData.length > 0) {
          reset({ faqs: allFaqData });
        } else {
          reset({ faqs: [{ question: "", answer: "" }] });
        }
      } catch (error) {
        console.error("Error fetching Refer & Earn FAQs:", error);
        toast.error("Failed to fetch FAQ details.");
      }
    };

    fetchReferEarnFAQ();
  }, [id, reset, token]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const sanitizedFAQs = data.faqs.map(({ _id, ...rest }) => rest);
      const formattedData = { faqEntries: sanitizedFAQs };

      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/admin/referEarnFaq`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "FAQ saved successfully!");
        navigate("/refer-faq");
      } else {
        toast.error("Failed to save FAQ.");
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

        <h2>{id ? "Edit Refer & Earn FAQ" : "Add Refer & Earn FAQ"}</h2>
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-12">
            {fields.map((item, index) => (
              <div key={item.id} className="mb-4">
                <label className="form-label">Question</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter your question"
                  {...register(`faqs[${index}].question`, { required: "Question is required" })}
                  defaultValue={item.question}
                />
                {errors.faqs?.[index]?.question && (
                  <span className="text-danger">{errors.faqs[index].question.message}</span>
                )}

                <label className="form-label mt-3">Answer</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter your answer"
                  {...register(`faqs[${index}].answer`, { required: "Answer is required" })}
                  defaultValue={item.answer}
                />
                {errors.faqs?.[index]?.answer && (
                  <span className="text-danger">{errors.faqs[index].answer.message}</span>
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

export default AddReferEarnFAQs;

