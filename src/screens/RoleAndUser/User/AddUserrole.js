import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
  Button,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import { fetchRoles } from "../../../Redux/Reducers/RoleReducer";

const UserRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(!isEdit); // 👈 key logic

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: null,
    },
  });

  const { roles, loading: fetchingRoles } = useSelector(
    (state) => state.RoleReducer
  );

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("User-admin-token");
      fetch(`${process.env.REACT_APP_BASEURL}/admin/adminUser/${id}`, {
        headers: { Authorization: token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            const user = data.data;
            setValue("name", user.fullName);
            setValue("email", user.email);
            setValue("phone", user.mobileNumber);
            setValue("password", "");
            setValue("confirmPassword", "");
            setValue(
              "role",
              roles.find((r) => r._id === user.role?._id)
            );
          } else {
            toast.error(data?.message || "Failed to fetch user");
          }
        })
        .catch(() => toast.error("Error fetching user data"))
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [id, isEdit, roles, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem("User-admin-token");

    const payload = {
      fullName: formData.name,
      email: formData.email,
      mobileNumber: formData.phone,
      role: formData.role?._id,
    };

    // include password only if add or if user chose to change
    if (!isEdit || showPasswordFields) {
      payload.password = formData.password;
      payload.confirmPassword = formData.confirmPassword;
    }

    const endpoint = isEdit
      ? `${process.env.REACT_APP_BASEURL}/admin/adminUser/${id}`
      : `${process.env.REACT_APP_BASEURL}/admin/adminUser`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");

      toast.success(
        isEdit ? "User updated successfully" : "User created successfully"
      );
      navigate("/user-management");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container py-4">
      <Toaster />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>{isEdit ? "Edit User" : "Add User"}</h5>

          {/* 👇 Show "Change Password" button only in Edit mode */}
          {isEdit && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
            >
              {showPasswordFields ? "Cancel Password Change" : "Change Password"}
            </Button>
          )}
        </div>

        <div className="card-body">
          <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="col-sm-6">
              <TextField
                label="Name"
                fullWidth
                {...register("name", { required: "Name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </div>

            {/* Phone */}
            <div className="col-sm-6">
              <TextField
                label="Phone"
                fullWidth
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter valid 10-digit phone",
                  },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </div>

            {/* Email */}
            <div className="col-sm-6">
              <TextField
                label="Email"
                fullWidth
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter valid email",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </div>

            {/* Role */}
            <div
              className="col-sm-6"
              style={{ position: "relative", zIndex: 10 }}
            >
              <label className="form-label">Select Role</label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={roles}
                    getOptionLabel={(option) => option?.roleName || ""}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    loading={fetchingRoles}
                    disableClearable
                    openOnFocus
                    disablePortal
                    isOptionEqualToValue={(option, value) =>
                      option._id === value?._id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select user role"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </div>

            {/* 👇 Password fields only if add OR user clicked "Change Password" */}
            {showPasswordFields && (
              <>
                <div className="col-sm-6">
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    autoComplete="new-password"
                    {...register("password", {
                      required: !isEdit && "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Password must not exceed 50 characters",
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <i
                            className={`icofont-${showPassword ? "eye" : "eye-blocked"
                              } cursor-pointer`}
                            onClick={() =>
                              setShowPassword(!showPassword)
                            }
                            style={{ fontSize: "1.25rem" }}
                          ></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="col-sm-6">
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: !isEdit && "Confirm password is required",
                      validate: (value) => {
                        if (watch("password")) {
                          return (
                            value === watch("password") ||
                            "Passwords do not match"
                          );
                        }
                        return true;
                      },
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <i
                            className={`icofont-${showConfirmPassword ? "eye" : "eye-blocked"
                              } cursor-pointer`}
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{ fontSize: "1.25rem" }}
                          ></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="col-12 mt-4">
              <button
                className="btn btn-primary px-4"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2 px-4"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRole;
