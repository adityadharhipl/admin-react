import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaLongArrowAltLeft, FaPen } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../../Redux/Reducers/UserManagementReducer";
import { Country, State, City } from "country-state-city";
import { Box, CircularProgress } from "@mui/material";

function BasicInformation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
  } = useForm();

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchUsers());
    setLoading(false);
  }, [dispatch]);

  // Load countries on mount
  useEffect(() => {
    setLoading(true);
    const countries = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.name,
      countryCode: country.isoCode,
      phonecode: country.phonecode,
    }));
    setCountryOptions(countries);

    // Default select India
    const india = countries.find((c) => c.countryCode === "IN" || c.label === "India");
    if (india) {
      setSelectedCountry(india);
      // Load states for India
      const states = State.getStatesOfCountry(india.countryCode).map((state) => ({
        label: state.name,
        value: state.name,
        stateCode: state.isoCode,
        countryCode: india.countryCode,
      }));
      setStateOptions(states);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/user/${id}`);
          const userData = response?.data?.data;

          if (userData) {
            setValue("full_name", userData.fullName);
            setValue("email", userData.email);
            setValue("mobile_number", userData.mobileNumber);
            setValue("address", userData.address);
            setValue("dob", userData.dob);
            setValue("timeOfBirth", userData.timeOfBirth);
            setProfilePicture(userData.profileImg || null);

            // Pre-select country, state, and city (if available)
            const countries = Country.getAllCountries().map((country) => ({
              label: country.name,
              value: country.name,
              countryCode: country.isoCode,
              phonecode: country.phonecode,
            }));

            // Default to India
            const india = countries.find((c) => c.countryCode === "IN");
            if (india) {
              setSelectedCountry(india);

              // Load states for India
              const states = State.getStatesOfCountry(india.countryCode).map((state) => ({
                label: state.name,
                value: state.name,
                stateCode: state.isoCode,
                countryCode: india.countryCode,
              }));
              setStateOptions(states);

              // Match and set state
              // Note: API might have "Belagavi" as state, but it's actually a city in Karnataka
              if (userData.state) {
                let matchedState = states.find(
                  (s) => s.value.toLowerCase() === userData.state?.toLowerCase()
                );

                // If "Belagavi" is stored as state, it's actually Karnataka state
                if (!matchedState && userData.state.toLowerCase() === 'belagavi') {
                  matchedState = states.find(
                    (s) => s.value.toLowerCase() === 'karnataka'
                  );
                }

                // Try partial match as fallback
                if (!matchedState) {
                  matchedState = states.find(
                    (s) => s.value.toLowerCase().includes(userData.state?.toLowerCase()) ||
                      userData.state?.toLowerCase().includes(s.value.toLowerCase())
                  );
                }

                if (matchedState) {
                  setSelectedState(matchedState);
                  setValue("state", matchedState.value);

                  // Load cities for matched state
                  const cities = City.getCitiesOfState(india.countryCode, matchedState.stateCode).map((city) => ({
                    label: city.name,
                    value: city.name,
                  }));
                  setCityOptions(cities);

                  // Match and set city
                  if (userData.city) {
                    let matchedCity = cities.find(
                      (c) => c.label.toLowerCase() === userData.city?.toLowerCase()
                    );

                    // Try partial match
                    if (!matchedCity) {
                      matchedCity = cities.find(
                        (c) => c.label.toLowerCase().includes(userData.city?.toLowerCase()) ||
                          userData.city?.toLowerCase().includes(c.label.toLowerCase())
                      );
                    }

                    if (matchedCity) {
                      setSelectedCity(matchedCity);
                      setValue("city", matchedCity.value);
                    } else {
                      setValue("city", userData.city);
                    }
                  }
                } else {
                  setValue("state", userData.state);
                  if (userData.city) {
                    setValue("city", userData.city);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data!");
        }
      }
    };

    fetchUserData();
  }, [id, setValue]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_ADMIN_TOKEN}`,
          },
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const responseData = await response.json();
        const imageUrl = responseData?.data?.img[0];
        if (imageUrl) setProfilePicture(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
      }
    }
  };

  const onSubmit = async (data) => {
    // Validate state and city selection
    if (!selectedState || !selectedState.value) {
      toast.error("Please select a state");
      setError("state", {
        type: "manual",
        message: "Please select a state",
      });
      return;
    }
    if (!selectedCity || !selectedCity.value) {
      toast.error("Please select a city");
      setError("city", {
        type: "manual",
        message: "Please select a city",
      });
      return;
    }

    // Validate timeOfBirth before submitting
    if (!data.timeOfBirth || data.timeOfBirth.trim() === '') {
      toast.error("Time of Birth is required");
      setError("timeOfBirth", {
        type: "manual",
        message: "Time of Birth is not allowed to be empty",
      });
      return;
    }

    const payload = {
      fullName: data.full_name,
      email: data.email.toLowerCase(),
      profileImg: profilePicture || "",
      mobileNumber: data.mobile_number,
      state: selectedState.value,
      city: selectedCity.value,
      address: data.address || "",
      dob: data.dob,
      timeOfBirth: data.timeOfBirth || "",
    };

    try {
      setLoading(true);

      if (id) {
        await axios.patch(`${process.env.REACT_APP_BASEURL}/admin/user/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("User updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_BASEURL}/admin/user`, payload, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("User added successfully!");
      }

      navigate("/users-list");
    } catch (error) {
      setLoading(false);

      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show toast with general message
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        }

        // Set field-specific errors
        error.response.data.errors.forEach((err) => {
          // Map API field names to form field names if needed
          let fieldName = err.field;

          // Handle camelCase to snake_case mapping if needed
          if (fieldName === 'timeOfBirth') {
            fieldName = 'timeOfBirth';
          } else if (fieldName === 'fullName') {
            fieldName = 'full_name';
          } else if (fieldName === 'mobileNumber') {
            fieldName = 'mobile_number';
          }

          setError(fieldName, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        const errorMessage = error?.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage);
      }
    }
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countryOptions.find((c) => c.countryCode === countryCode);
    if (country) {
      setSelectedCountry(country);
      const states = State.getStatesOfCountry(countryCode).map((state) => ({
        label: state.name,
        value: state.name,
        stateCode: state.isoCode,
        countryCode: countryCode,
      }));
      setStateOptions(states);
      setSelectedState(null);
      setSelectedCity(null);
      setCityOptions([]);
      setValue("state", "");
      setValue("city", "");
    }
  };

  // Handle state change
  const handleStateChange = (e) => {
    const stateValue = e.target.value;

    if (!stateValue) {
      setSelectedState(null);
      setCityOptions([]);
      setSelectedCity(null);
      setValue("state", "");
      setValue("city", "");
      return;
    }

    const state = stateOptions.find((s) => s.value === stateValue);
    if (state && selectedCountry) {
      setSelectedState(state);
      setValue("state", stateValue, { shouldValidate: true });
      const cities = City.getCitiesOfState(selectedCountry.countryCode, state.stateCode).map((city) => ({
        label: city.name,
        value: city.name,
      }));
      setCityOptions(cities);
      setSelectedCity(null);
      setValue("city", "", { shouldValidate: true });
    }
  };

  // Handle city change
  const handleCityChange = (e) => {
    const cityValue = e.target.value;

    if (!cityValue) {
      setSelectedCity(null);
      setValue("city", "");
      return;
    }

    const city = cityOptions.find((c) => c.value === cityValue);
    if (city) {
      setSelectedCity(city);
      setValue("city", cityValue, { shouldValidate: true });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <div className="row align-items-center">
        <div
          className="card-header d-flex align-items-center justify-content-between border-bottom flex-wrap"
          style={{
            backgroundColor: "#fff",
            padding: "10px 16px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          {/* Left Section: Back + Title */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => window.history.back()}
              style={{
                background: "transparent",
                border: "none",
                color: "#0d6efd",
                fontSize: "14 px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0a58ca")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0d6efd")}
            >
              <span style={{ marginRight: "8px" }}>&lt;</span>
              <span style={{ position: "relative", display: "inline-block", textDecoration: 'underline' }}>
                Back
              </span>
            </button>

            <h5
              className="fw-semibold mb-0"
              style={{ fontSize: "17px", color: "#333", letterSpacing: "0.3px" }}
            >
              {id ? "Edit User" : "Add User"}
            </h5>
          </div>

          {/* Right Section: Save */}
          <button
            type="submit"
            className="btn btn-primary btn-sm px-3"
            onClick={handleSubmit(onSubmit)}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "6px",
              textTransform: "uppercase",
              boxShadow: "0 2px 6px rgba(13,110,253,0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 10px rgba(13,110,253,0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 6px rgba(13,110,253,0.2)")}
          >
            Save
          </button>
        </div>

      </div>

      <div className="card-body mt-2">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Profile Picture */}
          <div className="col-sm-12">
            <div className="file-upload">
              <label htmlFor="file-input">
                <img
                  src={
                    profilePicture ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile Icon"
                  className="icon"
                  style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                />
                <div className="edit-icon">
                  <FaPen />
                </div>
              </label>
              <input type="file" id="file-input" onChange={handleFileChange} />
            </div>
          </div>

          {/* Full Name */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="Full name"
                {...register("full_name", { required: "This field is required" })}
              />
              {errors.full_name && (
                <span className="text-danger">{errors.full_name.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                    message: "Invalid Email Address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-danger">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* Mobile Number */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                type="text"
                maxLength={10}
                placeholder="Mobile Number"
                {...register("mobile_number", {
                  required: "This field is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Mobile number must be 10 digits",
                  },
                })}
              />
              {errors.mobile_number && (
                <span className="text-danger">
                  {errors.mobile_number.message}
                </span>
              )}
            </div>
          </div>

          {/* DOB */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Date of Birth <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                type="date"
                {...register("dob", { required: "This field is required" })}
              />
              {errors.dob && (
                <span className="text-danger">{errors.dob.message}</span>
              )}
            </div>
          </div>

          {/* Time of Birth */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Time of Birth <span className="text-danger">*</span>
              </label>
              <input
                className={`form-control ${errors.timeOfBirth ? 'is-invalid' : ''}`}
                type="time"
                {...register("timeOfBirth", {
                  required: "Time of Birth is required",
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return "Time of Birth is not allowed to be empty";
                    }
                    return true;
                  }
                })}
              />
              {errors.timeOfBirth && (
                <span className="text-danger d-block mt-1">{errors.timeOfBirth.message}</span>
              )}
            </div>
          </div>

          {/* Country (Hidden) */}
          <div className="col-sm-6" style={{ display: "none" }}>
            <div className="form-group">
              <label className="form-label">
                Country <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                value={selectedCountry?.countryCode || ""}
                onChange={handleCountryChange}
              >
                <option value="">Select Country</option>
                {countryOptions.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                value={selectedState?.value || ""}
                onChange={handleStateChange}
                name="state"
                required
              >
                <option value="">Select State</option>
                {stateOptions.map((state) => (
                  <option key={state.stateCode} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.state && (
                <span className="text-danger">{errors.state.message}</span>
              )}
              {!selectedState && (
                <small className="text-danger d-block mt-1">Please select a state</small>
              )}
            </div>
          </div>

          {/* City */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                City <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                value={selectedCity?.value || ""}
                onChange={handleCityChange}
                disabled={!selectedState}
                name="city"
                required
              >
                <option value="">Select City</option>
                {cityOptions.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              {errors.city && (
                <span className="text-danger">{errors.city.message}</span>
              )}
              {!selectedState && (
                <small className="text-muted d-block mt-1">Please select a state first</small>
              )}
              {selectedState && !selectedCity && (
                <small className="text-danger d-block mt-1">Please select a city</small>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="col-sm-6">
            <div className="form-group">
              <label className="form-label">
                Address
                {/* <span className="text-danger">*</span> */}
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="Address"
                {...register("address")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="col-12 mt-4">
            {loading ? (
              <button type="submit" disabled className="btn btn-primary text-uppercase px-5">
                Loading...
              </button>
            ) : (
              <button type="submit" className="btn btn-primary text-uppercase px-5">
                Save
              </button>
            )}
            <Link to="/users-list" className="btn btn-primary text-uppercase px-5 mx-2">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default BasicInformation;

