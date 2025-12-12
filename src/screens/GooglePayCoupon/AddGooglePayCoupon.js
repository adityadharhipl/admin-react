import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { postCoupon } from "../../Redux/Reducers/CoupansReducer";
import { useNavigate } from "react-router-dom";

const categoryOptions = [
  { value: "education", label: "Education" },
  { value: "consultation", label: "Consultation" },
];

const discountOptions = {
  education: [
    { value: "flat_off_percentage", label: "Flat % Off" },
    { value: "flat_off_rupees", label: "Flat Rs. Off" },
  ],
  consultation: [
    { value: "flat_extra_percentage", label: "Flat % Extra" },
    { value: "flat_extra_rupees", label: "Flat Rs. Extra" },
  ],
};

function GooglePayCouponAdd() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    resetField,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedCategory = watch("category");
  const selectedDiscountType = watch("discountType");

  useEffect(() => {
    resetField("discountType");
  }, [selectedCategory, resetField]);

  const getDiscountLabel = () => {
    if (!selectedDiscountType) return "Define Discount";
    if (selectedDiscountType.value.includes("percentage")) {
      return selectedCategory?.value === "education" ? "Define % Off" : "Define % Extra";
    } else {
      return selectedCategory?.value === "education" ? "Define Rs. Off" : "Define Rs. Extra";
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const category = data.discountType?.value || "";
      const couponData = {
        type: "google_pay",
        category,
        validFrom: data.validFrom,
        validTo: data.validTo,
        minCartValue: data.minCartValue,
        numCoupons: data.couponCount,
        discountValue: data.discountValue,
      };

      const res = await dispatch(postCoupon(couponData));
      if (res?.payload?.success) {
        toast.success(res?.payload?.message );
        navigate("/googlepay-coupon");
      } else {
        toast.error(res?.payload?.message);
      }
      
     
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Something went wrong!");
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

        <h2>Create Google Pay Coupon</h2>
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-6">
            <label className="form-label">Coupon Type</label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select {...field} options={categoryOptions} placeholder="Select Category" />
              )}
            />
            {errors.category && <span className="text-danger">{errors.category.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Discount Type</label>
            <Controller
              name="discountType"
              control={control}
              rules={{ required: "Discount type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={selectedCategory?.value ? discountOptions[selectedCategory.value] : []}
                  placeholder="Select Discount Type"
                />
              )}
            />
            {errors.discountType && <span className="text-danger">{errors.discountType.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">No. of Coupons</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter number of coupons"
              {...register("couponCount", { required: "Number of coupons is required", min: 1 })}
            />
            {errors.couponCount && <span className="text-danger">{errors.couponCount.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Validity (From)</label>
            <input
              type="date"
              className="form-control"
              // min="2025-02-01"
              min={new Date().toISOString().split("T")[0]}
              {...register("validFrom", { required: "Start date is required" })}
            />
            {errors.validFrom && <span className="text-danger">{errors.validFrom.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Validity (To)</label>
            <input
              type="date"
              className="form-control"
              // min="2025-02-01"
              min={new Date().toISOString().split("T")[0]}
              {...register("validTo", { required: "End date is required" })}
            />
            {errors.validTo && <span className="text-danger">{errors.validTo.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{getDiscountLabel()}</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter discount value"
              {...register("discountValue", { required: "Discount value is required", min: 1 })}
            />
            {errors.discountValue && <span className="text-danger">{errors.discountValue.message}</span>}
          </div>

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

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default GooglePayCouponAdd;
