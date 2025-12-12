import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import { Switch, FormControlLabel, Box, Button, CircularProgress } from '@mui/material';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';
import { handleUnauthorized } from '../../../TokenAuth/auth';

function AdvertisementBanner() {
    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem("User-admin-token");

    useEffect(() => {
        fetchAdvertisementBanner();
    }, []);

    const fetchAdvertisementBanner = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_BASEURL}/admin/advertisement-banner`,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setImage(data.imageUrl || null);
                setIsVisible(data.isVisible !== undefined ? data.isVisible : true);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error fetching advertisement banner:', error);
                // Don't show error toast on initial load if no data exists
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const uploadedUrl = await dispatch(uploadImagecertifates(file));

            // Normalize uploaded response to a single URL string
            let imageUrl = null;
            if (typeof uploadedUrl === 'string') {
                imageUrl = uploadedUrl;
            } else if (Array.isArray(uploadedUrl)) {
                imageUrl = uploadedUrl[0] || null;
            } else if (uploadedUrl?.url) {
                imageUrl = uploadedUrl.url;
            } else if (uploadedUrl?.[0] && typeof uploadedUrl[0] === 'string') {
                imageUrl = uploadedUrl[0];
            } else {
                imageUrl = uploadedUrl?.toString?.() || null;
            }

            if (!imageUrl) {
                throw new Error('Image upload returned invalid response');
            }

            setImage(imageUrl);
            toast.success('Image uploaded successfully');
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
    };

    const handleToggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload = {
                imageUrl: image || null,
                isVisible: isVisible
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASEURL}/admin/advertisement-banner`,
                payload,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success('Advertisement Banner saved successfully!');
                fetchAdvertisementBanner();
            } else {
                toast.error(response.data.message || 'Failed to save advertisement banner');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error saving advertisement banner:', error);
                toast.error(error.response?.data?.message || 'Error saving advertisement banner');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h4 className="mb-0 fw-bold">
                    Advertisement Banner
                </h4>
            </div>

            <div className="card-body">
                <form>
                    <div className="row g-3">
                        <div className="col-lg-8 col-sm-12 mx-auto">
                            <Box
                                sx={{
                                    position: 'relative',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    backgroundColor: '#fff',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderColor: 'var(--primary-color, #E7B242)',
                                    }
                                }}
                            >
                                {/* Label */}
                                <div className="mb-2">
                                    <label className="form-label fw-bold d-block text-center">
                                        Advertisement Banner Image
                                    </label>
                                    <small className="text-muted d-block text-center" style={{ fontSize: '12px' }}>
                                        Recommended Size: 1200 x 300 pixels (4:1 ratio)
                                    </small>
                                </div>

                                {/* Image Preview */}
                                <div className="mb-2 text-center" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {uploading ? (
                                        <CircularProgress size={40} />
                                    ) : image ? (
                                        <img
                                            className="img-fluid"
                                            src={image}
                                            alt="Advertisement Banner"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                maxHeight: '250px',
                                            }}
                                        />
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
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Remove Button */}
                                {image && !uploading && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 10,
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
                                            style={{ fontSize: "28px", color: "#d32f2f" }}
                                        />
                                    </button>
                                )}

                                {/* Upload Button */}
                                <label className="btn btn-outline-primary w-100 mb-2 text-center" style={{ cursor: 'pointer' }}>
                                    {image ? 'Change Image' : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                    />
                                </label>

                                {/* Show/Hide Toggle */}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isVisible}
                                            onChange={handleToggleVisibility}
                                            color="primary"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: 'var(--primary-color, #E7B242)',
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: 'var(--primary-color, #E7B242)',
                                                },
                                            }}
                                        />
                                    }
                                    label={isVisible ? "Visible" : "Hidden"}
                                    sx={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        margin: 0,
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }
                                    }}
                                />
                            </Box>
                        </div>
                    </div>

                    <div className="col-12 mt-4 text-center">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving || uploading}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: 'var(--primary-color, #E7B242)',
                                color: '#ffffff',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: 'var(--primary-color, #E7B242)',
                                    boxShadow: 'none',
                                    opacity: 0.9,
                                },
                                '&:disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)',
                                }
                            }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AdvertisementBanner;

