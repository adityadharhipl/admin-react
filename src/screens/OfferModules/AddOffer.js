import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Select from 'react-select';
import { fetchAstro } from '../../Redux/Reducers/AstroReducer';
import { uploadImagecertifates } from "../../Redux/Actions/Action";

function AddOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [astrologerOptions, setAstrologerOptions] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);

  const token = localStorage.getItem('User-admin-token');
  // const Dataastrologers = useSelector((state) => state?.AstroReducer?.astroData) || [];


  // useEffect(() => {
  //   dispatch(fetchAstro());
  // }, [dispatch]);


  // useEffect(() => {
  //   if (Dataastrologers.length > 0) {
  //     setAstrologerOptions(
  //       Dataastrologers.map(astro => ({
  //         value: astro._id,
  //         label: astro.fullName,
  //       }))
  //     );
  //   }
  // }, [Dataastrologers]);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/getAstro`, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });

        const astroList = response?.data?.data || [];
        setAstrologerOptions(
          astroList.map(astro => ({
            value: astro._id,
            label: astro.fullName,
          }))
        );
      } catch (error) {
        toast.error("Failed to fetch astrologers");
      }
    };

    fetchAstrologers();
  }, [token]);

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/expertise`, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });
        setExpertiseOptions(
          response?.data?.data?.map(exp => ({
            value: exp._id,
            label: exp.expertiseName
          }))
        );
      } catch (error) {
        toast.error('Failed to fetch expertise list');
      }
    };
    fetchExpertise();
  }, [token]);


  useEffect(() => {
    if (!id) return;

    const fetchOfferDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/offer/${id}`, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });

        const offerData = response.data.data;
        setValue('offerTitle', offerData.offerTitle);
        setValue('applicableValue', offerData.applicableValue);
        setValue('applicableType', offerData.discountType);
        setUploadedImageUrl(offerData.offerImage);


        const type = offerData.offerType === 'Astrologer' ? 'astrologers' : 'expertise';
        setSelectedType(type);

        if (type === 'astrologers' && offerData.astrologers.length > 0) {
          const selectedAstrologer = astrologerOptions.find(opt => opt.value === offerData.astrologers[0]._id);
          setValue('astrologerId', selectedAstrologer || null);
        }

        if (type === 'expertise' && offerData.expertise.length > 0) {
          const selectedExpertise = expertiseOptions.find(opt => opt.value === offerData.expertise[0]._id);
          setValue('expertiseId', selectedExpertise || null);
        }
      } catch (error) {
        toast.error('Failed to fetch offer details');
      }
    };

    fetchOfferDetails();
  }, [id, token, setValue, astrologerOptions, expertiseOptions]);



  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imgUrl = await dispatch(uploadImagecertifates(file));
        setUploadedImageUrl(imgUrl);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        toast.error('Image upload failed');
      }
    }
  };


  const onSubmit = async (data) => {
    setIsLoading(true);

    const astrologerId = data.astrologerId?.value || null;
    const expertiseId = data.expertiseId?.value || null;

    const payload = {
      offerTitle: data.offerTitle,
      applicableValue: data.applicableValue,
      discountType: data.applicableType,
      offerType: selectedType === 'astrologers' ? 'Astrologer' : 'Expertise',
      offerImage: uploadedImageUrl,
      ...(selectedType === 'astrologers' && { astrologers: [astrologerId] }),
      ...(selectedType === 'expertise' && { expertise: [expertiseId] })
    };

    try {
      if (id) {
        await axios.patch(`${process.env.REACT_APP_BASEURL}/admin/offer/${id}`, payload, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });
        toast.success('Offer updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_BASEURL}/admin/offer`, payload, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });
        toast.success('Offer added successfully!');
      }

      navigate('/offer-list');
    } catch (error) {
      toast.error(id ? 'Failed to update offer' : 'Failed to add offer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
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
        <span style={{ marginLeft: "10px", fontSize: "18px", fontWeight: 500 }}>
          {id ? "Edit Offer" : "Add Offer"}
        </span>
      </div>
      <Toaster />
      <div className="card-body">
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-sm-6">
            <label className="form-label">Offer Title</label>
            <input className="form-control" type="text" placeholder="Enter Offer Title" {...register('offerTitle', { required: 'Offer Title is required' })} />
            {errors.offerTitle && <span className="text-danger">{errors.offerTitle.message}</span>}
          </div>

          <div className="col-sm-6">
            <label className="form-label">Applicable</label>
            <div className="input-group">
              <input
                className="form-control"
                type="number"
                placeholder="Enter Value"
                {...register('applicableValue', {
                  required: 'Applicable value is required',
                  min: {
                    value: 0,
                    message: 'Value cannot be negative',
                  }
                })}
              />
              <select
                className="form-control w-auto"
                {...register('applicableType', {
                  required: 'Discount type is required'
                })}
              >
                <option value="">Select Type</option>
                <option value="Rs">Rs</option>
                <option value="%">%</option>
              </select>
            </div>
            {errors.applicableValue && <span className="text-danger">{errors.applicableValue.message}</span>}
            {errors.applicableType && <span className="text-danger">{errors.applicableType.message}</span>}
          </div>


          <div className="col-sm-6">
            <label className="form-label">Select Type</label>
            <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="expertise">Expertise</option>
              <option value="astrologers">Astrologers</option>
            </select>
          </div>

          {selectedType === 'astrologers' && (
            <div className="col-sm-6">
              <label className="form-label">Applicable Astrologer</label>
              <Controller
                control={control}
                name="astrologerId"
                render={({ field }) => (
                  <Select {...field} options={astrologerOptions} placeholder="Select Astrologer" />
                )}
              />
            </div>
          )}

          {selectedType === 'expertise' && (
            <div className="col-sm-6">
              <label className="form-label">Applicable Expertise</label>
              <Controller
                control={control}
                name="expertiseId"
                render={({ field }) => (
                  <Select {...field} options={expertiseOptions} placeholder="Select Expertise" />
                )}
              />
            </div>
          )}

          <div className="col-sm-6">
            <label className="form-label">Upload Image</label>
            <input
              className="form-control"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageUpload}
            />

            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Offer"
                className="mt-2"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            )}

            <small className="text-muted">
              Please upload an image in <b>JPG, JPEG, or PNG</b> format with a minimum resolution of <b>500×500 pixels</b> and a maximum file size of <b>5 MB</b>.
            </small>
          </div>


          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update Offer' : 'Add Offer')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AddOffer;

