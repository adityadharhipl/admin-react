import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { FaPen } from 'react-icons/fa';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpertise } from '../../Redux/Reducers/ExpertisePro';
function AIAstrologerAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const [profileImg, setProfileImg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [languageData, setLanguagesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Model options
  const aiModelOptions = [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude 3' },
  ];

  // Specialization options
  const specializationOptions = [
    { value: 'Love', label: 'Love' },
    { value: 'Career', label: 'Career' },
    { value: 'Health', label: 'Health' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marriage', label: 'Marriage' },
    { value: 'Education', label: 'Education' },
  ];

  // Currency options
  const currencyOptions = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  // Static Expertise options
  // const expertiseOptions = [
  //   { value: 'BabynameGenerator', label: 'Baby Name Generator' },
  //   { value: 'Career', label: 'Career' },
  //   { value: 'FaceReading', label: 'Face Reading' },
  //   { value: 'Finance', label: 'Finance' },
  //   { value: 'Health', label: 'Health' },
  //   { value: 'Love', label: 'Love' },
  //   { value: 'Marriage', label: 'Marriage' },
  //   { value: 'PalmReading', label: 'Palm Reading' },
  //   { value: 'Remedies', label: 'Remedies' },
  // ];


  const dispatch = useDispatch();
  const ExpertiseData = useSelector((state) => state?.ExpertisePro?.expertiseData);

  const expertiseOptions = ExpertiseData?.data?.map((exp) => ({
    value: exp._id,
    label: exp.expertiseName,
  }));
  useEffect(() => {
    dispatch(fetchExpertise());
  }, []);
  // Fetch languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const token = localStorage.getItem('User-admin-token');
        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/language`, {
          method: 'GET',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }

        const data = await response.json();
        setLanguagesData(data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Note: Expertise is now static, no need to fetch from API
  // useEffect(() => {
  //   dispatch(fetchExpertise());
  // }, [dispatch]);

  // Fetch AI Astrologer data if editing
  useEffect(() => {
    if (id) {
      const fetchAIAstrologer = async () => {
        try {
          const token = localStorage.getItem('User-admin-token');
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
            {
              headers: { Authorization: token },
            }
          );

          // Handle response - nested data structure
          // API returns: { success: true, data: { docs: [...] } } OR { success: true, data: {...} }
          let aiAstroData = response.data.data;

          // If data is pagination object with docs array, get first item
          if (aiAstroData?.docs && Array.isArray(aiAstroData.docs)) {
            aiAstroData = aiAstroData.docs[0];
          }

          if (aiAstroData) {

            // Set form values
            setValue('name', aiAstroData.name);
            setValue('title', aiAstroData.title);
            setValue('specialization', aiAstroData.specialization);
            setValue('description', aiAstroData.description);
            setValue('systemPrompt', aiAstroData.systemPrompt);
            setValue('experience', aiAstroData.experience);
            setValue('rating', aiAstroData.rating);
            setValue('personality', aiAstroData.personality);
            setValue('consultationStyle', aiAstroData.consultationStyle);
            setValue('aiModel', aiAstroData.aiModel);
            setValue('responseTime', aiAstroData.responseTime);
            setValue('pricePerMinute', aiAstroData.pricePerMinute);
            setValue('currency', aiAstroData.currency);
            setValue('totalConsultations', aiAstroData.totalConsultations);
            setValue('totalReviews', aiAstroData.totalReviews);
            setValue('isActive', true);
            setValue('isOnline', true);
            setProfileImg(aiAstroData.profileImg);

            // Set languages (handle both ID arrays and object arrays)
            const languageIds = aiAstroData.languages?.map((l) =>
              typeof l === 'object' ? l._id : l
            ) || [];
            setValue('languages', languageIds);

            // Set expertise (static values)
            const expertiseValues = aiAstroData.expertise?.map((l) =>
              typeof l === 'object' ? l._id : l
            ) || [];
            setValue('expertise', expertiseValues);
          }
        } catch (error) {
          console.error('Error fetching AI Astrologer:', error);
          toast.error(error.response?.data?.message || 'Failed to fetch AI Astrologer details');
        }
      };

      fetchAIAstrologer();
    }
  }, [id, setValue]);

  // Handle profile image upload
  const handleProfileImgChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `${process.env.REACT_APP_ADMIN_TOKEN}`,
          },
        });

        if (!response.ok) throw new Error('Failed to upload image');

        const responseData = await response.json();
        const imageUrl = responseData?.data?.img;

        if (imageUrl) setProfileImg(imageUrl);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload profile image.');
      }
    }
  };

  // Prepare language options
  const languageOptions = languageData?.data?.map((lang) => ({
    value: lang._id,
    label: lang.languageName,
  })) || [];
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        type: 'ai',
        name: data.name,
        title: data.title,
        specialization: data.specialization,
        description: data.description,
        experience: data.experience,
        rating: parseFloat(data.rating),
        languages: data.languages,
        systemPrompt: data?.systemPrompt,
        expertise: data.expertise,
        aiModel: data.aiModel,
        personality: data.personality,
        consultationStyle: data.consultationStyle,
        isActive: true,
        totalConsultations: parseInt(data.totalConsultations) || 0,
        responseTime: data.responseTime,
        currency: data.currency,
        isOnline: true,
        pricePerMinute: parseFloat(data.pricePerMinute),
        totalReviews: parseInt(data.totalReviews) || 0,
        profileImg: typeof profileImg === "string"
          ? profileImg
          : profileImg?.[0] || null,
};

      const token = localStorage.getItem('User-admin-token');

      if (id) {
        // Update existing AI Astrologer
        await axios.patch(
          `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
          payload,
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        toast.success('AI Astrologer updated successfully!');
      } else {
        // Create new AI Astrologer
        await axios.post(
          `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer`,
          payload,
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        toast.success('AI Astrologer added successfully!');
      }

      setTimeout(() => {
        navigate('/ai-astrologer-list');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save AI Astrologer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />

      <div className="row align-items-center">
        <div className="border-0 mb-4">
          <div className="card-header no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
            <h3 className="fw-bold mb-0">
              {id ? 'Edit AI Astrologer' : 'Add AI Astrologer'}
            </h3>
            <button
              onClick={() => window.history.back()}
              style={{
                marginBottom: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "18px",
                color: "#007bff",
                display: "flex",
                alignItems: "center",
                position: "relative",
                borderRadius: "8px 8px 0 0",
                backgroundColor: "#fff",
              }}
            >
              <span style={{ marginRight: '8px' }}>&lt;</span>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Back
                <span
                  style={{
                    content: "''",
                    position: 'absolute',
                    left: 0,
                    bottom: -2,
                    width: '100%',
                    height: '1px',
                    borderBottom: '2px solid #007bff',
                  }}
                ></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Profile Image */}
          <div className="col-sm-12">
            <div className="file-upload">
              <label htmlFor="file-input">
                <img
                  src={profileImg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt="Profile Icon"
                  className="icon"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '3px solid #E7B242',
                  }}
                />
                <div className="edit-icon" style={{ position: 'absolute', bottom: 0, right: 0 }}>
                  <FaPen />
                </div>
              </label>
              <input
                type="file"
                id="file-input"
                onChange={handleProfileImgChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="col-12">
            <h5 className="fw-bold">Basic Information</h5>
            <hr />
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              type="text"
              placeholder="Enter AI Astrologer Name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className="text-danger">{errors.name.message}</span>}
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              type="text"
              placeholder="Enter Title (e.g., Love & Relationship Guru)"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <span className="text-danger">{errors.title.message}</span>}
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Specialization <span className="text-danger">*</span>
            </label>
            <Controller
              name="specialization"
              control={control}
              rules={{ required: 'Specialization is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`form-select ${errors.specialization ? 'is-invalid' : ''}`}
                >
                  <option value="">Select Specialization</option>
                  {specializationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.specialization && (
              <span className="text-danger">{errors.specialization.message}</span>
            )}
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Experience <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.experience ? 'is-invalid' : ''}`}
              type="text"
              placeholder="e.g., 14 years"
              {...register('experience', { required: 'Experience is required' })}
            />
            {errors.experience && <span className="text-danger">{errors.experience.message}</span>}
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Rating <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.rating ? 'is-invalid' : ''}`}
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="e.g., 4.9"
              {...register('rating', {
                required: 'Rating is required',
                min: { value: 0, message: 'Rating must be at least 0' },
                max: { value: 5, message: 'Rating cannot exceed 5' },
              })}
            />
            {errors.rating && <span className="text-danger">{errors.rating.message}</span>}
          </div>

          {/* <div className="col-sm-6">
            <label className="form-label">
              AI Model <span className="text-danger">*</span>
            </label>
            <Controller
              name="aiModel"
              control={control}
              rules={{ required: 'AI Model is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`form-select ${errors.aiModel ? 'is-invalid' : ''}`}
                >
                  <option value="">Select AI Model</option>
                  {aiModelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.aiModel && <span className="text-danger">{errors.aiModel.message}</span>}
          </div> */}

          <div className="col-sm-12">
            <label className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Enter description"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <span className="text-danger">{errors.description.message}</span>}
          </div>

          {/* Professional Information */}
          <div className="col-12 mt-4">
            <h5 className="fw-bold">Professional Information</h5>
            <hr />
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Languages <span className="text-danger">*</span>
            </label>
            <Controller
              name="languages"
              control={control}
              rules={{ required: 'Please select at least one language' }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={languageOptions}
                  value={languageOptions?.filter((option) =>
                    field.value?.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    const selectedLanguages = selectedOptions?.map((option) => option?.value);
                    field.onChange(selectedLanguages);
                  }}
                  placeholder="Select Languages"
                  className={errors.languages ? 'is-invalid' : ''}
                />
              )}
            />
            {errors.languages && <span className="text-danger">{errors.languages.message}</span>}
          </div>

          <div className="col-sm-6">
            <label className="form-label">
              Expertise <span className="text-danger">*</span>
            </label>
            <Controller
              name="expertise"
              control={control}
              rules={{ required: 'Please select at least one expertise' }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={expertiseOptions}
                  value={expertiseOptions?.filter((option) =>
                    field.value?.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    const selectedExpertise = selectedOptions?.map((option) => option?.value);
                    field.onChange(selectedExpertise);
                  }}
                  placeholder="Select Expertise"
                  className={errors.expertise ? 'is-invalid' : ''}
                />
              )}
            />
            {errors.expertise && <span className="text-danger">{errors.expertise.message}</span>}
          </div>

          <div className="col-sm-12">
            <label className="form-label">
              Personality <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.personality ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Describe the AI personality"
              {...register('personality', { required: 'Personality is required' })}
            />
            {errors.personality && <span className="text-danger">{errors.personality.message}</span>}
          </div>

          <div className="col-sm-12">
            <label className="form-label">
              Consultation Style <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.consultationStyle ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Describe the consultation style"
              {...register('consultationStyle', { required: 'Consultation style is required' })}
            />
            {errors.consultationStyle && (
              <span className="text-danger">{errors.consultationStyle.message}</span>
            )}
          </div>
          <div className="col-sm-12">
            <label className="form-label">
              System Prompt  <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.systemPrompt ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Describe the system promt"
              {...register('systemPrompt', { required: 'Consultation style is required' })}
            />
            {errors.systemPrompt && (
              <span className="text-danger">{errors.systemPrompt.message}</span>
            )}
          </div>

          {/* Pricing & Availability */}
          <div className="col-12 mt-4">
            <h5 className="fw-bold">Pricing & Availability</h5>
            <hr />
          </div>

          <div className="col-sm-4">
            <label className="form-label">
              Price Per Minute <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.pricePerMinute ? 'is-invalid' : ''}`}
              type="number"
              step="0.01"
              placeholder="Enter price"
              {...register('pricePerMinute', { required: 'Price is required' })}
            />
            {errors.pricePerMinute && (
              <span className="text-danger">{errors.pricePerMinute.message}</span>
            )}
          </div>

          <div className="col-sm-4">
            <label className="form-label">
              Currency <span className="text-danger">*</span>
            </label>
            <Controller
              name="currency"
              control={control}
              rules={{ required: 'Currency is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`form-select ${errors.currency ? 'is-invalid' : ''}`}
                >
                  <option value="">Select Currency</option>
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.currency && <span className="text-danger">{errors.currency.message}</span>}
          </div>

          <div className="col-sm-4">
            <label className="form-label">
              Response Time <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.responseTime ? 'is-invalid' : ''}`}
              type="text"
              placeholder="e.g., 2-4 min"
              {...register('responseTime', { required: 'Response time is required' })}
            />
            {errors.responseTime && (
              <span className="text-danger">{errors.responseTime.message}</span>
            )}
          </div>

          <div className="col-sm-4">
            <label className="form-label">Total Consultations</label>
            <input
              className="form-control"
              type="number"
              placeholder="Total consultations"
              {...register('totalConsultations')}
            />
          </div>

          <div className="col-sm-4">
            <label className="form-label">Total Reviews</label>
            <input
              className="form-control"
              type="number"
              placeholder="Total reviews"
              {...register('totalReviews')}
            />
          </div>

          <div className="col-sm-4">
            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                {...register('isActive')}
              />
              <label className="form-check-label" htmlFor="isActive">
                Is Active
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isOnline"
                {...register('isOnline')}
              />
              <label className="form-check-label" htmlFor="isOnline">
                Is Online
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary text-uppercase px-5"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-secondary text-uppercase px-5 mx-2"
              onClick={() => navigate('/ai-astrologer-list')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AIAstrologerAdd;

