import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import { Switch, FormControlLabel, Box, Button, CircularProgress } from '@mui/material';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';
import { handleUnauthorized } from '../../../TokenAuth/auth';

const ZODIAC_SIGNS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
];

function Horoscope() {
    const dispatch = useDispatch();
    const [icons, setIcons] = useState(
        ZODIAC_SIGNS.map((label, index) => ({
            id: index + 1,
            label,
            image: null,
            isVisible: true,
            loading: false
        }))
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchHoroscope();
    }, []);

    const fetchHoroscope = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("User-admin-token");
            const response = await axios.get(
                `${process.env.REACT_APP_BASEURL}/admin/horoscope`,
                {
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success && response.data.data) {
                const fetchedIcons = response.data.data;
                setIcons(
                    ZODIAC_SIGNS.map((label, index) => {
                        const fetched = fetchedIcons.find(f => f.position === index + 1);
                        return {
                            id: index + 1,
                            label: label, // Always use label from ZODIAC_SIGNS
                            image: fetched?.imageUrl || null,
                            isVisible: fetched?.isVisible !== undefined ? fetched.isVisible : true,
                            loading: false
                        };
                    })
                );
            }
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error fetching horoscope:', error);
                // Don't show error toast on initial load if no data exists
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        const updatedIcons = [...icons];
        updatedIcons[index].loading = true;
        setIcons(updatedIcons);

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

            updatedIcons[index].image = imageUrl;
            updatedIcons[index].loading = false;
            setIcons(updatedIcons);
            toast.success('Image uploaded successfully');
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
            updatedIcons[index].loading = false;
            setIcons(updatedIcons);
        }
    };

    const handleRemoveImage = (index) => {
        const updatedIcons = [...icons];
        updatedIcons[index].image = null;
        setIcons(updatedIcons);
    };

    const handleToggleVisibility = (index) => {
        const updatedIcons = [...icons];
        updatedIcons[index].isVisible = !updatedIcons[index].isVisible;
        setIcons(updatedIcons);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem("User-admin-token");

            const payload = {
                horoscopes: icons.map((icon, index) => ({
                    position: index + 1,
                    imageUrl: icon.image || null,
                    isVisible: icon.isVisible,
                    label: icon.label
                }))
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASEURL}/admin/horoscope`,
                payload,
                {
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success('Horoscope saved successfully!');
                fetchHoroscope();
            } else {
                toast.error(response.data.message || 'Failed to save horoscope');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error saving horoscope:', error);
                toast.error(error.response?.data?.message || 'Error saving horoscope');
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
                    Horoscope
                </h4>
            </div>

            <div className="card-body">
                <form>
                    <div className="row g-3">
                        {icons.map((icon, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6" key={icon.id}>
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
                                        <label className="form-label fw-bold d-block text-capitalize">
                                            {icon.label}
                                        </label>
                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                            Size: 200x200px
                                        </small>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="mb-3 text-center" style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {icon.loading ? (
                                            <CircularProgress size={40} />
                                        ) : icon.image ? (
                                            <img
                                                className="img-fluid"
                                                src={icon.image}
                                                alt={icon.label}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    maxHeight: '150px',
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
                                                    maxHeight: '150px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    {icon.image && !icon.loading && (
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
                                                style={{ fontSize: "24px", color: "#d32f2f" }}
                                            />
                                        </button>
                                    )}

                                    {/* Upload Button */}
                                    <label className="btn btn-outline-primary w-100 mb-2 text-center" style={{ cursor: 'pointer' }}>
                                        {icon.image ? 'Change Image' : 'Upload Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, index)}
                                            style={{ display: "none" }}
                                        />
                                    </label>

                                    {/* Show/Hide Toggle */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={icon.isVisible}
                                                onChange={() => handleToggleVisibility(index)}
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
                                        label={icon.isVisible ? "Visible" : "Hidden"}
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
                        ))}
                    </div>

                    <div className="col-12 mt-4">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
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

export default Horoscope;

