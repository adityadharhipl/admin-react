import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { postCoupon, updateCoupon } from "../../Redux/Reducers/CoupansReducer"; 
import { useNavigate } from "react-router-dom";

// Coupon Type options
const couponTypeOptions = [
  { value: "percent", label: "Percent Discount" },
  { value: "flat", label: "Flat Rs. Discount" }
];

// Category options for flat-off
const categoryOptions = [
  { value: "flat_off_rupees", label: "Flat Rs. Discount" },
  { value: "flat_off_percentage", label: "Percent Discount" }
];

function EducationAdd({ couponId }) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();  
  const navigate = useNavigate(); 

  const selectedCategory = watch("category");

  useEffect(() => {
    if (couponId) {
      fetchCouponData(couponId);
    }
  }, [couponId]);

  // Fetch coupon data when editing
  const fetchCouponData = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("User-admin-token")}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch coupon data");
      }

      const data = await response.json();
      setValue("couponCode", data.couponCode);
      setValue("discountType", data.discountType);
      setValue("validFrom", data.validFrom);
      setValue("validTo", data.validTo);
      setValue("usageLimit", data.usageLimit);
      setValue("discountValue", data.discountValue);
      setValue("minCartValue", data.minCartValue);
      setValue("category", data.category);

      
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const couponData = {
        ...data,
        category: data.category?.value || "",
        type: "education",
      };
  
      // Dispatch POST method only
      const response = await dispatch(postCoupon(couponData));
  
      if (response?.payload?.success) {
        toast.success(response?.payload?.message);
        navigate("/eduction-modulecoupon");
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      // toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
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

        <h2>{couponId ? "Edit Coupon" : "Create Coupon"}</h2>
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
         
          <div className="col-md-6">
            <label className="form-label">Discount Category</label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select {...field} options={categoryOptions} placeholder="Select Discount Category" />
              )}
            />
            {errors.category && <span className="text-danger">{errors.category.message}</span>}
          </div>

          {/* Coupon Code Field */}
          <div className="col-md-6">
            <label className="form-label">Coupon Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter coupon code"
              {...register("couponCode", { required: "Coupon code is required" })}
            />
            {errors.couponCode && <span className="text-danger">{errors.couponCode.message}</span>}
          </div>

          {/* Valid From Date Field */}
          <div className="col-md-6">
            <label className="form-label">Validity (From)</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split("T")[0]}
              {...register("validFrom", { required: "Start date is required" })}
            />
            {errors.validFrom && <span className="text-danger">{errors.validFrom.message}</span>}
          </div>

          {/* Valid To Date Field */}
          <div className="col-md-6">
            <label className="form-label">Validity (To)</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split("T")[0]}
              {...register("validTo", { required: "End date is required" })}
            />
            {errors.validTo && <span className="text-danger">{errors.validTo.message}</span>}
          </div>

          {/* Usage Limit Field */}
          <div className="col-md-6">
            <label className="form-label">No. of Times Coupon Can Be Availed</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter limit"
              {...register("noOfUsersUse", { required: "Usage limit is required", min: 1 })}
            />
            {errors.noOfUsersUse && <span className="text-danger">{errors.noOfUsersUse.message}</span>}
          </div>

         
          <div className="col-md-6">
            <label className="form-label">{selectedCategory?.value === "flat_off_percentage" ? "Define % Off" : "Define Flat Rs. Off"}</label>
            <input
              type="number"
              className="form-control"
              placeholder={selectedCategory?.value === "flat_off_percentage" ? "Enter discount %" : "Enter discount amount"}
              {...register("discountValue", { required: "Discount value is required", min: 1 })}
            />
            {errors.discountValue && <span className="text-danger">{errors.discountValue.message}</span>}
          </div>

          {/* Minimum Cart Value Field */}
          <div className="col-md-6">
            <label className="form-label">Minimum Cart Value</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter minimum cart value"
              {...register("minCartValue", { required: "Minimum cart value is required", min: 1 })}
            />
            {errors.minCartValue && <span className="text-danger">{errors.minCartValue.message}</span>}
          </div>

          {/* Submit Button */}
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Submitting..." : couponId ? "Update Coupon" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EducationAdd;
