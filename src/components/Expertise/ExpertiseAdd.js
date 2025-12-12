import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { postExpertise, updateExpertise } from "../../Redux/Reducers/ExpertisePro";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function BasicInformation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const token = localStorage.getItem("User-admin-token");

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetch(`${process.env.REACT_APP_BASEURL}/admin/expertise/${id}`, {
        method: "GET",

        headers: { Authorization: token },

      })
        .then((res) => res.json())
        .then((data) => {
          setValue("expertise", data?.data?.expertiseName || "");
          setImage(data?.data?.expertiseIcon || "");
        })
        .catch((err) => console.error("Error fetching expertise:", err));
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      if (!image) {
        toast.error("Please upload an icon");
        return;
      }

      const expertiseData = {
        expertiseName: data.expertise,
        expertiseIcon: image[0],
      };

      if (isEditMode) {
        await fetch(`${process.env.REACT_APP_BASEURL}/admin/expertise/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expertiseData),
        });
        toast.success("Expertise updated successfully.");
      } else {
        await dispatch(postExpertise(expertiseData)).unwrap();
        toast.success("Expertise added successfully.");
      }
      navigate("/expertise-list");
    } catch (error) {
      console.error("Error submitting expertise:", error);
      toast.error(error.message || "Failed to process expertise.");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const imageUrl = await uploadImagecertifates(file);
      setImage(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadImagecertifates = async (file) => {
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/imageUpload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const result = await response.json();
      return result?.data?.img;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  return (
    <>
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

      <div className="card-body">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-sm-12">
            <div className="form-group">
              <label className="form-label">Expertise</label>
              <span style={{ color: "red" }}>*</span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter expertise"
                {...register("expertise", {
                  required: "This field is required",
                  validate: {
                    noLeadingTrailingSpaces: (value) =>
                      value.trim() === value || "No leading or trailing spaces allowed",
                    noEmptySpaces: (value) =>
                      value.trim() !== "" || "Input cannot be just spaces",
                    validCharacters: (value) =>
                      /^[A-Za-z\s]+$/.test(value) || "Only alphabets and spaces are allowed",
                  },
                })}
              />
              {errors.expertise && (
                <span className="text-danger">
                  {errors.expertise.message}
                </span>
              )}
            </div>
          </div>

          <div className="col-sm-12">
            <div className="form-group">
              <label className="form-label">Upload Icon</label>
              <span style={{ color: "red" }}>*</span>
              <input
                type="file"
                className="form-control"
                onChange={handleImageChange}
              />
              {loading && <span className="text-secondary">Uploading...</span>}
              {image && (
                <div>
                  <img src={image} alt="Icon Preview" width={100} />
                </div>
              )}
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary text-uppercase px-5">
              {isEditMode ? "UPDATE" : "SAVE"}
            </button>
            <Link to="/expertise-list" className="btn btn-primary text-uppercase px-5 mx-2">
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default BasicInformation;
