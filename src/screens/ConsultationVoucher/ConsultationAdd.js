import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import {
  postGiftAmount,
  updateGiftAmount,
  fetchGiftAmounts
} from '../../Redux/Reducers/ConsultationReducer';

function ConsultationAdd() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const getAuthToken = () => localStorage.getItem("User-admin-token");

  // ✅ KEEP EXACTLY SAME
  const displayTypeOptions = [
    { value: "", label: "Select Display Type" },
    { value: "Most Popular", label: "Most Popular" },
    { value: "Recommended", label: "Recommended" },
  ];

  const categories = [
    { value: "First Recharge", label: "First Recharge" },
    { value: "Second Recharge", label: "Second Recharge" },
    { value: "Third Recharge", label: "Third Recharge" },
    { value: "Fourth Recharge", label: "Fourth Recharge" },
    { value: "Fifth Recharge", label: "Fifth recharge and onwards" }
  ];

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      category: '',
      fields: [{ title: '', actualAmount: '', giftAmount: '', position: '', label: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const { status = 'idle' } = useSelector((state) => state.giftAmount || {});

  // ✅ Fetch existing data if editing
  useEffect(() => {
    const fetchData = async () => {
      if (id && id !== 'undefined' && id !== 'null') {
        try {
          const response = await fetch(`${BASE_URL}/admin/giftAmount/${id}`, {
            headers: {
              'Authorization': getAuthToken(),
            },
          });

          if (!response.ok) throw new Error("Failed to fetch gift amount details");
          const data = await response.json();

          if (data?.data) {
            const item = data.data;
            reset({
              category: item.category || '',
              fields: [{
                title: item.title || '',
                actualAmount: item.actualAmount || '',
                giftAmount: item.giftAmount || '',
                position: item.position || '',
                label: item.label || '', // ✅ preserves correct case
              }]
            });
          }
        } catch (error) {
          console.error("Fetch error:", error);
          toast.error(error.message || "Failed to fetch details");
        }
      }
    };

    fetchData();
  }, [id, reset, BASE_URL]);

  // ✅ Fix allowed labels (case-sensitive)
  const allowedDisplayTypes = ["", "Most Popular", "Recommended"];

  const onSubmit = async (data) => {
    const { category, fields } = data;

    try {
      const sanitizedFields = fields.map(item => ({
        ...item,
        category,
        position: Number(item.position),
        actualAmount: Number(item.actualAmount),
        giftAmount: Number(item.giftAmount),
        label: allowedDisplayTypes.includes(item.label) ? item.label : "", // ✅ now matches correctly
      }));

      if (id) {
        await dispatch(updateGiftAmount({ id, giftAmountsArray: sanitizedFields })).unwrap();
        toast.success("Consultation voucher updated successfully!");
      } else {
        await dispatch(postGiftAmount(sanitizedFields)).unwrap();
        toast.success("Consultation vouchers added successfully!");
      }
      navigate('/consultation-voucher');
    } catch (err) {
      toast.error(err?.message || "Something went wrong!");
    }
  };

  return (
    <>


      <div style={{ marginBottom: "20px", marginTop: "10px", display: "flex", alignItems: "center" }}>
        <button
          onClick={() => window.history.back()}
          style={{
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
        <h5 style={{ margin: 0, fontWeight: 600, color: "#333" }}>
          {id ? "Edit Consultation Voucher" : "Add Consultation Voucher"}
        </h5>
      </div>

      <Toaster position="top-right" reverseOrder={true} />
      <div className="card-body">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Category Dropdown */}
          <div className="col-md-6">
            <label className="form-label">Category</label> <span style={{ color: "red" }}>*</span>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categories}
                  placeholder="Select Category"
                  value={categories.find(option => option.value === field.value)}
                  onChange={(selectedOption) => field.onChange(selectedOption.value)}
                />
              )}
            />
          </div>

          {/* Dynamic Fields */}
          {fields.map((item, index) => (
            <div key={item.id} className="col-12 border p-3 rounded position-relative">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" type="text"
                    {...register(`fields.${index}.title`, { required: true })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Actual Amount</label>
                  <input className="form-control" type="number" min="0"
                    {...register(`fields.${index}.actualAmount`, { required: true })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Gift Amount</label>
                  <input className="form-control" type="number" min="0"
                    {...register(`fields.${index}.giftAmount`, { required: true })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Position</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    {...register(`fields.${index}.position`, { required: true })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Display Type</label>
                  <Controller
                    name={`fields.${index}.label`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={displayTypeOptions}
                        placeholder="Select Display Type"
                        value={displayTypeOptions.find(option => option.value === field.value)}
                        onChange={(selected) => field.onChange(selected?.value || "")}
                      />
                    )}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  {index > 0 && (
                    <button type="button" className="btn btn-danger mx-2" onClick={() => remove(index)}> - </button>
                  )}
                  {index === fields.length - 1 && (
                    <button type="button" className="btn btn-success" onClick={() => append({ title: '', actualAmount: '', giftAmount: '', position: '', label: '' })}> + </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Form Actions */}
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary px-3" disabled={status === 'loading'}>
              {status === 'loading' ? 'Saving...' : id ? 'Update' : 'Save'}
            </button>
            <Link to="/consultation-voucher" className="btn btn-secondary px-3 mx-2">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default ConsultationAdd;
