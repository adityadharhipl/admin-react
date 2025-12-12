import React, { useEffect, useState } from "react";
import axios from "axios";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";

function FAQAdd() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm({
    defaultValues: {
      faqs: [{ question: "", answer: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("User-admin-token");
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/course`, {
          headers: { Authorization: token },
        });
       
        setCourses(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []); 

  
  useEffect(() => {
    const fetchFAQsData = async () => {
      if (id) {
        try {
          const token = localStorage.getItem("User-admin-token");
          const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/faq/${id}`, {
            headers: { Authorization: token },
          });

          const faqData = response?.data?.data;
          if (faqData) {
            setValue("courseId", faqData?.courseId?._id);
            setValue("faqs", faqData?.faqEntries);
            setSelectedCourse(courses.find((course) => course._id === faqData?.courseId?._id));
          }
        } catch (error) {
          console.error("Error fetching FAQ data:", error);
        }
      }
    };

    fetchFAQsData();
  }, [id, setValue, courses]); 

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("User-admin-token"); 
      const sanitizedFAQs = data.faqs.map(({ _id, ...rest }) => rest);

    const formattedData = {
      courseId: data.courseId,
      faqEntries: sanitizedFAQs,
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
        navigate("/course-specificfaq");
      } else {
        toast.error("FAQ not created:");
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
        <h2>{id ? "Edit FAQ" : "Add FAQ"}</h2>
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-6">
            <label className="form-label">Select Course</label>
            <span style={{ color: "red" }}>*</span>
            <Controller
              name="courseId"
              control={control}
              rules={{ required: "Course is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={courses?.map((course) => ({
                    value: course._id,
                    label: course.title,
                  }))}
                  placeholder="Select Course"
                  value={
                    selectedCourse
                      ? { value: selectedCourse._id, label: selectedCourse.title }
                      : null
                  }
                  onChange={(selectedOption) => {
                    const selected = courses.find(
                      (course) => course._id === selectedOption.value
                    );
                    setSelectedCourse(selected);
                    field.onChange(selectedOption.value);
                  }}
                />
              )}
            />
            {errors.courseId && <span className="text-danger">{errors.courseId.message}</span>}
          </div>

          {selectedCourse && (
            <div className="col-md-12">
              <h5>Review Course Details</h5>
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={selectedCourse?.courseImg || "https://via.placeholder.com/100"}
                    alt={selectedCourse?.title || "Placeholder"}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Category</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCourse?.categoryId?.categoryName || ""}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Type</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCourse?.courseType || ""}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Tutor</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCourse?.tutorsName || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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

export default FAQAdd;
