import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategory } from "../../../Redux/Reducers/CategoryReducer";
import toast from "react-hot-toast";

function CategoryEditC() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const category = useSelector((state) => state.CategoryReducer.category);

  useEffect(() => {
    if (id) {
      dispatch(fetchCategory(id)).then((response) => {
        if (response?.payload?.data) {
          reset({
            categoryName: response.payload.data.categoryName,
          });
        }
      });
    }
  }, [id, dispatch, reset]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/category/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: data.categoryName }),
      });

      if (response.ok) {
        toast.success("Category updated successfully!");
        navigate("/category-management");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update category.");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("An error occurred while updating the category.");
    }
  };

  return (
    <>
      <div className="card-body">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="form-control"
                {...register("categoryName", {
                  required: "Category name is required",
                })}
              />
              {errors.categoryName && (
                <span className="text-danger">
                  {errors.categoryName.message}
                </span>
              )}
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary text-uppercase px-5">
              SAVE
            </button>
            <Link
              to="/category-management"
              className="btn btn-primary text-uppercase px-5 mx-2"
            >
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default CategoryEditC;