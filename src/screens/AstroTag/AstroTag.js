import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

function AstroTag() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch tag details for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTag = async () => {
        try {
          const token = localStorage.getItem("User-admin-token");
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}/admin/tag/${id}`,
            { headers: { Authorization: token } }
          );
          const data = response.data?.data;
          if (data?.tagName) {
            setValue("tagName", data.tagName);
          }
        } catch (error) {
          toast.error("Failed to load tag data");
        }
      };
      fetchTag();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    const token = localStorage.getItem("User-admin-token");

    try {
      setLoading(true);
      let response;
      if (isEditMode) {
        // PATCH request
        response = await axios.patch(
          `${process.env.REACT_APP_BASEURL}/admin/tag/${id}`,
          { tagName: data.tagName },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Tag updated successfully!");
      } else {
        
        response = await axios.post(
          `${process.env.REACT_APP_BASEURL}/admin/tag`,
          { tagName: data.tagName },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Tag created successfully!");
      }

      navigate("/astro-tag-management");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <form className="row" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-sm-6">
          <div className="form-group text-start">
            <label className="form-label">Astro Tag Name</label>
            <input
              className={`form-control ${errors.tagName ? "is-invalid" : ""}`}
              type="text"
              placeholder="Enter Astro Tag name"
              {...register("tagName", {
                required: "Astro Tag name is required.",
              })}
            />
            {errors.tagName && (
              <p className="text-danger">{errors.tagName.message}</p>
            )}
          </div>
        </div>

        <div className="col-12 mt-4">
          <button
            type="submit"
            className="btn btn-primary text-uppercase px-5"
            disabled={loading}
          >
            {isEditMode ? "UPDATE" : "SAVE"}
          </button>
          <Link
            to="/astro-tag-management"
            className="btn btn-secondary text-uppercase px-5 mx-2"
          >
            CANCEL
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AstroTag;
