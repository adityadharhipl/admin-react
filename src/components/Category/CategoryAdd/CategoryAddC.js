import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

function CategoryAddC() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await axios.post(`${process.env.REACT_APP_BASEURL}/admin/category/`,
        { categoryName: data.categoryName, },
        { headers: { Authorization: token, }, }
      );
      if (response.status === 200 || response.status === 201) {
        navigate("/category-management");
        toast.success("Category added successfully!");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <>
      <div className="card-body">
        <form className="row" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-sm-6">
            <div className="form-group text-start">
              <label className="form-label">Category Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter category name"
                {...register("categoryName", {
                  required: "Category name is required.",
                })}
              />
              {errors.categoryName && (
                <p className="text-danger">{errors.categoryName.message}</p>
              )}
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary text-uppercase px-5">SAVE</button>
            <Link to="/category-management" type="button" className="btn btn-primary text-uppercase px-5 mx-2">CANCEL</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default CategoryAddC;