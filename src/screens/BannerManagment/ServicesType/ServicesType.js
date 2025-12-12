import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchBanner } from '../../../Redux/Reducers/BannerReducer';
import toast from 'react-hot-toast';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';

const FIXED_TYPES = ["Vedic Insights", "Tarot Reading", "Numerology", "Vastu Harmony"];

function ServiceBanners() {
  const dispatch = useDispatch();
  const banners = useSelector(state => state?.BannerReducer?.banner);

  // Use serviceBanners (not heroBanners) for this page
  const webBanner = banners?.find(b => b.bannerType === "forWeb")?.serviceBanners || [];
  const mobileBanner = banners?.find(b => b.bannerType === "forMobile")?.serviceBanners || [];
  const toggleBanner = banners?.find(b => b.bannerType === "forMobileView")?.serviceBanners || [];

  const [webItems, setWebItems] = useState(FIXED_TYPES.map(type => ({ image: null, type, loading: false })));
  const [mobileItems, setMobileItems] = useState(FIXED_TYPES.map(type => ({ image: null, type, loading: false })));
  const [toggleItems, setToggleItems] = useState(FIXED_TYPES.map(type => ({ image: null, type, loading: false })));
  const [activeTab, setActiveTab] = useState("web");

  useEffect(() => {
    dispatch(fetchBanner());
  }, [dispatch]);

  useEffect(() => {
    const mapBannerItems = (bannerList) =>
      FIXED_TYPES.map(type => {
        const found = bannerList.find(item => item.imageFor === type);
        return { type, image: found?.imageUrl || null, loading: false };
      });

    if (webBanner.length) setWebItems(mapBannerItems(webBanner));
    if (mobileBanner.length) setMobileItems(mapBannerItems(mobileBanner));
    if (toggleBanner.length) setToggleItems(mapBannerItems(toggleBanner));
  }, [webBanner, mobileBanner, toggleBanner]);

  const handleImageChange = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const updateSetters = {
      web: [webItems, setWebItems],
      mobile: [mobileItems, setMobileItems],
      toggle: [toggleItems, setToggleItems]
    };

    const [items, setItems] = updateSetters[activeTab];
    const updatedItems = [...items];
    updatedItems[index].loading = true;
    setItems([...updatedItems]);

    try {
      const uploaded = await dispatch(uploadImagecertifates(file));

      // Normalize uploaded response to a single URL string
      let uploadedUrl = null;
      if (!uploaded) {
        uploadedUrl = null;
      } else if (typeof uploaded === 'string') {
        uploadedUrl = uploaded;
      } else if (Array.isArray(uploaded)) {
        uploadedUrl = uploaded[0] || null;
      } else if (uploaded.url) {
        uploadedUrl = uploaded.url;
      } else if (uploaded[0] && typeof uploaded[0] === 'string') {
        uploadedUrl = uploaded[0];
      } else {
        // fallback to string conversion
        uploadedUrl = uploaded?.toString?.() || null;
      }

      if (!uploadedUrl) {
        throw new Error('Image upload returned invalid response');
      }

      updatedItems[index].image = uploadedUrl;
      updatedItems[index].loading = false;
      setItems([...updatedItems]);
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
      updatedItems[index].loading = false;
      setItems([...updatedItems]);
    }
  };

  const handleRemove = (index) => {
    const updateSetters = {
      web: [webItems, setWebItems],
      mobile: [mobileItems, setMobileItems],
      toggle: [toggleItems, setToggleItems]
    };

    const [items, setItems] = updateSetters[activeTab];
    const updatedItems = [...items];
    updatedItems[index].image = null;
    setItems([...updatedItems]);
  };

  const handleSave = async () => {
    const tabConfig = {
      web: { items: webItems, bannerType: "forWeb" },
      mobile: { items: mobileItems, bannerType: "forMobile" },
      toggle: { items: toggleItems, bannerType: "forMobileView" }
    };

    const { items, bannerType } = tabConfig[activeTab];

    if (items.some(item => !item.image)) {
      toast.error("Please upload all 4 service banner images.");
      return;
    }

    const payload = {
      serviceBanners: items.map(item => ({
        imageFor: item.type,
        imageUrl: item.image
      })),
      bannerType
    };

    try {
      const token = localStorage.getItem("User-admin-token");
      const res = await axios.post(`${process.env.REACT_APP_BASEURL}/admin/banner`, payload, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.data.success) {
        toast.success(`Banners saved for ${bannerType}`);
        // Fetch latest data after save
        dispatch(fetchBanner());
      } else {
        toast.error("Failed to save banners.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const renderBannerForm = (items) =>
    items.map((item, index) => (
      <div className='col-lg-3 col-md-6 mb-3' key={index}>
        <div className='position-relative border p-3 rounded'>
          <label className='form-label fw-bold d-block text-capitalize'>Banner For: {item.type}</label>

          <div className='mb-2 text-center'>
            {item.loading ? (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : item.image ? (
              <img src={item.image} className='img-fluid' alt={`banner-${index}`} />
            ) : (
              <img src={defaultImg} className='img-fluid' alt="default" />
            )}
          </div>

          <label className="btn btn-outline-primary w-100 mb-2 text-center">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, index)}
              style={{ display: "none" }}
            />
          </label>

          {item.image && !item.loading && (
            <button
              className='btn btn-sm btn-danger position-absolute end-0 top-0'
              onClick={() => handleRemove(index)}
              type="button"
            >
              <IoIosCloseCircle size={20} />
            </button>
          )}
        </div>
      </div>
    ));

  const items =
    activeTab === "web"
      ? webItems
      : activeTab === "mobile"
      ? mobileItems
      : toggleItems;

  // change tab handler to fetch data on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(fetchBanner());
  };

  return (
    <>
      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
        <h6 className="mb-0 fw-bold">Service Banners <span style={{ color: "red" }}>*</span></h6>
      </div>

      <div className="d-flex mb-3">
        <button
          className={`btn ${activeTab === "web" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => handleTabChange("web")}
        >
          Web View
        </button>
        <button
          className={`btn ms-2 ${activeTab === "mobile" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => handleTabChange("mobile")}
        >
          App View
        </button>
        {/* toggle tab kept if needed */}
      </div>

      <div className="card-body">
        <form>
          <div className="row">
            {renderBannerForm(items)}
          </div>
          <div className="mt-4">
            <button type="button" className="btn btn-primary px-5" onClick={handleSave}>
              SAVE
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ServiceBanners;
