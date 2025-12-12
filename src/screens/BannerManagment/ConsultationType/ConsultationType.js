import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchBanner } from '../../../Redux/Reducers/BannerReducer';
import toast from 'react-hot-toast';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';

const FIXED_TYPES = ["call", "chat", "appointment"];

function ConsultationBanners() {
    const dispatch = useDispatch();
    const banners = useSelector(state => state?.BannerReducer?.banner);

    // use bannerType lookup instead of array indices
    const webBanner = banners?.find(b => b.bannerType === "forWeb")?.consultationBanners || [];
    const mobileBanner = banners?.find(b => b.bannerType === "forMobile")?.consultationBanners || [];
    // optional: forMobileView if needed later
    // const toggleBanner = banners?.find(b => b.bannerType === "forMobileView")?.consultationBanners || [];

    const [webItems, setWebItems] = useState(FIXED_TYPES.map(type => ({ image: null, type })));
    const [mobileItems, setMobileItems] = useState(FIXED_TYPES.map(type => ({ image: null, type })));
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("web");

    useEffect(() => {
        dispatch(fetchBanner());
    }, [dispatch]);

    useEffect(() => {
        if (webBanner.length) {
            const updated = FIXED_TYPES.map(type => {
                const found = webBanner.find(item => item.imageFor === type);
                return { type, image: found?.imageUrl || null };
            });
            setWebItems(updated);
        }
        if (mobileBanner.length) {
            const updated = FIXED_TYPES.map(type => {
                const found = mobileBanner.find(item => item.imageFor === type);
                return { type, image: found?.imageUrl || null };
            });
            setMobileItems(updated);
        }
    }, [webBanner, mobileBanner]);

    const normalizeUpload = (uploaded) => {
        if (!uploaded) return null;
        if (typeof uploaded === 'string') return uploaded;
        if (Array.isArray(uploaded)) return uploaded[0] || null;
        if (uploaded.url) return uploaded.url;
        if (uploaded[0] && typeof uploaded[0] === 'string') return uploaded[0];
        return uploaded?.toString?.() || null;
    };

    const handleImageChange = async (event, index) => {
        setLoading(true);
        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }

        try {
            const uploaded = await dispatch(uploadImagecertifates(file));
            const uploadedUrl = normalizeUpload(uploaded);
            if (!uploadedUrl) throw new Error('Upload returned invalid response');

            const updated = [...(activeTab === "web" ? webItems : mobileItems)];
            updated[index].image = uploadedUrl;
            activeTab === "web" ? setWebItems(updated) : setMobileItems(updated);
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (index) => {
        const updated = [...(activeTab === "web" ? webItems : mobileItems)];
        updated[index].image = null;
        activeTab === "web" ? setWebItems(updated) : setMobileItems(updated);
    };

    const handleSave = async () => {
        const currentItems = activeTab === "web" ? webItems : mobileItems;

        if (currentItems.some(item => !item.image)) {
            toast.error(`Please upload all ${FIXED_TYPES.length} consultation banner images.`);
            return;
        }

        const payload = {
            consultationBanners: currentItems.map(item => ({
                imageFor: item.type,
                imageUrl: item.image
            })),
            bannerType: activeTab === "web" ? "forWeb" : "forMobile"
        };

        try {
            const token = localStorage.getItem("User-admin-token");
            const res = await axios.post(`${process.env.REACT_APP_BASEURL}/admin/banner`, payload, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.data?.success) {
                toast.success(`Banners saved for ${payload.bannerType}`);
                // refresh data after save
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
            <div className='col-lg-4 col-md-6 mb-3' key={index}>
                <div className='position-relative border p-3 rounded'>
                    <label className='form-label fw-bold d-block text-capitalize'>Banner For: {item.type}</label>

                    <div className='mb-2'>
                        {item.image ? (
                            <img src={item.image} className='img-fluid' alt={`banner-${index}`} />
                        ) : (
                            <img src={defaultImg} className='img-fluid' alt="default" />
                        )}
                    </div>

                    <input
                        type='file'
                        accept="image/*"
                        className='form-control mb-2'
                        onChange={(e) => handleImageChange(e, index)}
                    />

                    {item.image && (
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

    const items = activeTab === "web" ? webItems : mobileItems;

    // fetch on tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        dispatch(fetchBanner());
    };

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Consultation Banners <span style={{ color: "red" }}>*</span></h6>
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
            </div>

            <div className="card-body">
                <form>
                    <div className="row">
                        {renderBannerForm(items)}
                    </div>
                    <div className="mt-4">
                        <button type="button" className="btn btn-primary px-5" onClick={handleSave}>
                            {loading ? "Uploading..." : "SAVE"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default ConsultationBanners;

