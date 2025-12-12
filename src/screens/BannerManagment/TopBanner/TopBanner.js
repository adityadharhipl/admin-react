import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchBanner } from '../../../Redux/Reducers/BannerReducer';
import toast from 'react-hot-toast';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';
import { Box, Tabs, Tab, Button } from '@mui/material';

function Topbanner() {
    const dispatch = useDispatch();
    const banners = useSelector(state => state?.BannerReducer?.banner);
    const webBanner = banners?.find(b => b.bannerType === "forWeb")?.heroBanners || null;
    const mobileBanner = banners?.find(b => b.bannerType === "forMobile")?.heroBanners || null;
    const toggleBanner = banners?.find(b => b.bannerType === "forMobileView")?.heroBanners || null;
    
    const [webImages, setWebImages] = useState(Array(6)?.fill(null));
    const [mobileImages, setMobileImages] = useState(Array(6)?.fill(null));
    const [toggleImages, setToggleImages] = useState(Array(6)?.fill(null));
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("web");

    useEffect(() => {
        dispatch(fetchBanner());
    }, [dispatch]);

    // Populate state when banner data is fetched
    useEffect(() => {
        if (webBanner)
            setWebImages([
                ...webBanner?.slice(0, 6),
                ...Array(Math.max(0, 6 - webBanner?.length))?.fill(null),
            ]);

        if (mobileBanner)
            setMobileImages([
                ...mobileBanner?.slice(0, 6),
                ...Array(Math.max(0, 6 - mobileBanner?.length))?.fill(null),
            ]);

        if (toggleBanner)
            setToggleImages([
                ...toggleBanner?.slice(0, 6),
                ...Array(Math.max(0, 6 - toggleBanner?.length))?.fill(null),
            ]);
    }, [webBanner, mobileBanner, toggleBanner]);

    // Handle file upload
    const handleInputChange = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return toast.error("Please select at least one image.");

        setLoading(true);

        const updateImages = async (images, setImages) => {
            const updated = [...images];
            for (const file of files) {
                try {
                    const uploadedImageUrl = await dispatch(uploadImagecertifates(file));
                    // Ensure we're storing the URL string directly, not an array
                    const emptyIndex = updated.indexOf(null);
                    if (emptyIndex !== -1) {
                        // Store the URL directly instead of as an array
                        updated[emptyIndex] = uploadedImageUrl?.toString();
                    }
                } catch (err) {
                    console.error("Upload failed:", err);
                    toast.error("Error uploading image.");
                }
            }
            setImages(updated);
        };

        if (activeTab === "web") await updateImages(webImages, setWebImages);
        else if (activeTab === "mobile") await updateImages(mobileImages, setMobileImages);
        else if (activeTab === "toggle") await updateImages(toggleImages, setToggleImages);
        setLoading(false);
    };

    // Remove selected image
    const handleRemoveImage = (index) => {
        const removeAtIndex = (images, setImages) =>
            setImages(images.map((img, imgIndex) => (imgIndex === index ? null : img)));

        if (activeTab === "web") removeAtIndex(webImages, setWebImages);
        else if (activeTab === "mobile") removeAtIndex(mobileImages, setMobileImages);
        else if (activeTab === "toggle") removeAtIndex(toggleImages, setToggleImages);
    };

    // Modify the tab change handler
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        dispatch(fetchBanner()); // Fetch banners when tab changes
    };

    // Update the handleSave function
    const handleSave = async () => {
        let bannerType = "forWeb";
        let selectedImages = webImages;

        if (activeTab === "mobile") {
            bannerType = "forMobile";
            selectedImages = mobileImages;
        } else if (activeTab === "toggle") {
            bannerType = "forMobileView";
            selectedImages = toggleImages;
        }

        const payload = {
            heroBanners: selectedImages.filter(img => img !== null),
            bannerType,
        };

        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await axios.post(
                `${process.env.REACT_APP_BASEURL}/admin/banner`,
                payload,
                {
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success(`Banner updated successfully for ${bannerType}!`);
                dispatch(fetchBanner()); // Fetch banners after successful save
            } else {
                toast.error('Failed to update banner');
            }
        } catch (error) {
            console.error('Error updating banner:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Error updating banner');
        }
    };

    const getActiveImages = () => {
        if (activeTab === "web") return webImages;
        if (activeTab === "mobile") return mobileImages;
        return toggleImages;
    };

    return (
        <>
            {/* Header */}
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h4 className="mb-0 fw-bold">
                    Top Banner <span style={{ color: "red" }}>*</span>
                </h4>
            </div>

            {/* Tab Navigation Card */}
            <div className="card mb-3" style={{ 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: 'none'
            }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => handleTabChange(newValue)}
                        sx={{
                            minHeight: 36,
                            '& .MuiTab-root': {
                                fontSize: '14px',
                                minHeight: 36,
                                padding: '8px 16px',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: '8px',
                                color: 'rgba(0, 0, 0, 0.6)',
                            },
                            '& .MuiTabs-flexContainer': {
                                alignItems: 'center',
                                gap: 0.5,
                            },
                            '& .MuiTabs-indicator': {
                                display: 'none',
                            },
                            '& .Mui-selected': {
                                color: '#ffffff !important',
                                backgroundColor: '#E7B437',
                                '&:hover': {
                                    backgroundColor: '#E7B437',
                                },
                            },
                        }}
                    >
                        <Tab 
                            label="Web View" 
                            value="web"
                            sx={{
                                '&:hover': {
                                    backgroundColor: activeTab === 'web' ? '#E7B437' : '#f2f2f2',
                                },
                            }}
                        />
                        <Tab 
                            label="App View" 
                            value="mobile"
                            sx={{
                                '&:hover': {
                                    backgroundColor: activeTab === 'mobile' ? '#E7B437' : '#f2f2f2',
                                },
                            }}
                        />
                        <Tab 
                            label="Mobile View" 
                            value="toggle"
                            sx={{
                                '&:hover': {
                                    backgroundColor: activeTab === 'toggle' ? '#E7B437' : '#f2f2f2',
                                },
                            }}
                        />
                    </Tabs>
                </div>
            </div>

            <div className="card-body">
                <form>
                    <div className="row g-3">
                        <div className="col-md-12">
                            <small className="d-block text-muted mb-3" style={{ fontSize: '14px' }}>
                                Select up to 6 images only.
                            </small>
                            <div 
                                id="create-token" 
                                className="dropzone"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px dashed #d0d0d0',
                                    backgroundColor: '#fafafa',
                                    padding: '40px 20px',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#E7B437';
                                    e.currentTarget.style.backgroundColor = '#fffef5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#d0d0d0';
                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                }}
                            >
                                <div className="dz-message d-flex align-items-center justify-content-center flex-column">
                                    <i 
                                        className="fa fa-picture-o m-0" 
                                        aria-hidden="true"
                                        style={{ fontSize: '48px', color: '#E7B437', marginBottom: '12px' }}
                                    ></i>
                                    <h5
                                        style={{
                                            fontSize: "16px",
                                            color: "#E7B437",
                                            fontWeight: "600",
                                            marginTop: "8px",
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {loading ? "Uploading..." : "Upload a file"}
                                    </h5>
                                    <h6 style={{ fontSize: "13px", color: '#666' }}>PNG, JPG, WEBP, SVG...</h6>
                                </div>
                                <input
                                    id="filesize"
                                    onChange={handleInputChange}
                                    name="file"
                                    type="file"
                                    accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff, .mp4, .webm, .mp3, .wav, .ogg, .glb"
                                    multiple
                                    style={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Render uploaded images */}
                        {getActiveImages().map((image, index) => (
                            <div className="col-lg-2 col-md-4 col-sm-6" key={index}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            borderColor: '#E7B437',
                                        }
                                    }}
                                >
                                    {image ? (
                                        <>
                                            <img
                                                className="img-fluid"
                                                src={image}
                                                alt={`uploaded-img-${index}`}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    minHeight: '150px',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fff';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <IoIosCloseCircle
                                                    style={{ fontSize: "24px", color: "#d32f2f" }}
                                                />
                                            </button>
                                        </>
                                    ) : (
                                        <img 
                                            className="img-fluid" 
                                            src={defaultImg} 
                                            alt="default"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px',
                                                opacity: 0.5,
                                                minHeight: '150px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    )}
                                </Box>
                            </div>
                        ))}
                    </div>

                    <div className="col-12 mt-4">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={loading}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                px: 4,
                                py: 1,
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: 'var(--primary-color, #1976d2)',
                                color: '#ffffff',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: 'var(--primary-color, #1976d2)',
                                    boxShadow: 'none',
                                },
                                '&:disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)',
                                }
                            }}
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Topbanner;
