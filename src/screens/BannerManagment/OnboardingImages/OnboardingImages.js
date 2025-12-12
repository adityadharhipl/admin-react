// File: IconManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Grid, Typography, Card, CardContent, CardActions } from "@mui/material";
import toast from "react-hot-toast";
import defaultImg from "../../../assets/images/product/defaultImg.svg";

const BASE_URL = process.env.REACT_APP_BASEURL;

const IMAGE_TYPES = [
    { key: "sign_in_images", label: "Sign In Image" },
    { key: "otp_images", label: "OTP Verification Image" },
    // { key: "splash_screen", label: "Splash Screen" },
    // { key: "top_header_logo", label: "Top Header Logo" },
    // { key: "horoscope_sign_images", label: "Horoscope Sign Image" },
    // { key: "tarot_card_images", label: "Tarot Card Image" },
    // { key: "tarot_universe_images", label: "Tarot Universe Image" },
    // { key: "baby_name_details_icon", label: "Baby Name Details Icon" },
    // { key: "baby_name_kundi_summary", label: "Baby Name Kundi Summary" },
    // { key: "native_banner_image", label: "Native Banner Image" },
    // { key: "numerology_discover_numbers", label: "Numerology Discover Numbers" },
    // { key: "astrology_service_icon", label: "Astrology Service Icon" },
    // { key: "trending_consultation", label: "Trending Consultation" },
    // { key: "tile_settings", label: "Tile Settings" },
];

export default function IconManager() {
    const [icons, setIcons] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [globalLoading, setGlobalLoading] = useState(false);

    const token = localStorage.getItem("User-admin-token");

    useEffect(() => {
        fetchAllIcons();
    }, []);

    const headers = {
        Authorization: token ? `${token}` : "",
    };

    // Fetch existing icons from backend
    const fetchAllIcons = async () => {
        setGlobalLoading(true);
        try {
            const resp = await axios.get(`${BASE_URL}/admin/getAllIcons`, {
                headers,
            });
            // Expect an array of icon objects. Normalize by type.
            // Example item shape assumed: { title, icon, for, type, platform, ... }
            const data = resp?.data?.data || resp?.data || [];
            // If response is object with success/data shape, adjust above accordingly.
            const map = {};
            if (Array.isArray(data)) {
                data.forEach((item) => {
                    if (item?.type) {
                        map[item.type] = {
                            icon: item.icon || null,
                            title: item.title || "",
                            for: item.for || "user",
                            platform: item.platform || "mobile",
                            _raw: item, // keep raw item if needed (id etc.)
                        };
                    }
                });
            }
            setIcons((prev) => ({ ...prev, ...map }));
        } catch (err) {
            console.error("Error fetching icons:", err);
            toast.error("Failed to fetch icons.");
        } finally {
            setGlobalLoading(false);
        }
    };

    // Helper: upload file to server to get an accessible URL
    // NOTE: Update endpoint and response handling to match your backend upload API.
    const uploadFile = async (file, typeKey) => {
        // set per-type loading
        setLoadingMap((s) => ({ ...s, [typeKey]: true }));
        try {
            // Example: POST /admin/imageUpload returns { success: true, url: "https://..." }
            // If your upload API differs, modify this function.
            const form = new FormData();
            form.append("file", file);

            const resp = await axios.post(`${BASE_URL}/admin/imageUpload`, form, {
                headers: {
                    ...headers,
                    "Content-Type": "multipart/form-data",
                },
            });

            // Try a few common response shapes:
            const url = resp?.data?.data?.img[0] || null;

            if (!url) {
                console.warn("Unexpected upload response:", resp?.data);
                throw new Error("Upload returned no URL. Adjust uploadFile() to match your API.");
            }
            return url;
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Image upload failed. Check console for details.");
            throw err;
        } finally {
            setLoadingMap((s) => ({ ...s, [typeKey]: false }));
        }
    };

    // Save metadata for a single icon type to /admin/icon
    const saveIcon = async (typeKey) => {
        const entry = icons[typeKey];
        if (!entry || !entry.icon) {
            toast.error("Please upload/select an image before saving.");
            return;
        }

        setLoadingMap((s) => ({ ...s, [typeKey]: true }));
        try {
            const payload = {
                title: entry.title || `${typeKey} icon`,
                icon: entry.icon,
                for: entry.for || "user",
                type: typeKey,
                platform: entry.platform || "mobile",
            };

            const resp = await axios.post(`${BASE_URL}/admin/icon`, payload, {
                headers: {
                    ...headers,
                    "Content-Type": "application/json",
                },
            });

            if (resp?.data?.success || resp?.status === 200 || resp?.data?.message) {
                toast.success(`Saved ${typeKey} successfully.`);
                // Optionally refresh all icons
                await fetchAllIcons();
            } else {
                console.warn("Unexpected save response:", resp?.data);
                toast.success(`Saved ${typeKey}`); // sometimes backend returns not-success but still saved
            }
        } catch (err) {
            console.error("Save icon failed:", err?.response?.data || err);
            toast.error(err?.response?.data?.message || "Failed to save icon.");
        } finally {
            setLoadingMap((s) => ({ ...s, [typeKey]: false }));
        }
    };

    // Remove/reset local image for a given type
    const removeImageLocal = (typeKey) => {
        setIcons((prev) => ({ ...prev, [typeKey]: { ...(prev[typeKey] || {}), icon: null } }));
    };

    // Handle file chosen for a specific type: upload then store URL locally (not auto-save)
    const handleFileChange = async (e, typeKey) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // (1) Upload file to storage endpoint (adjust uploadFile implementation if needed)
            const uploadedUrl = await uploadFile(file, typeKey);
            // (2) Set locally so admin can review, then call saveIcon to persist metadata
            setIcons((prev) => ({
                ...prev,
                [typeKey]: {
                    ...(prev[typeKey] || {}),
                    icon: uploadedUrl,
                },
            }));
            toast.success("File uploaded. Click Save to persist.");
        } catch (err) {
            // uploadFile already shows toast
        } finally {
            // clear file input value to allow re-selecting same file if needed
            e.target.value = "";
        }
    };

    // Allow manual URL paste (if admin wants to paste image URL)
    const handlePasteUrl = (typeKey) => {
        const url = window.prompt("Paste image URL:");
        if (!url) return;
        setIcons((prev) => ({ ...prev, [typeKey]: { ...(prev[typeKey] || {}), icon: url } }));
        toast.success("URL set. Click Save to persist.");
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                    Icon / Image Manager
                </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage single images for each type. Upload an image, then click <strong>Save</strong> to
                    persist it to the server.
                </Typography>

                <Grid container spacing={2}>
                    {IMAGE_TYPES.map((t) => {
                        const entry = icons[t.key] || {};
                        const imgUrl = entry.icon || null;
                        const loading = !!loadingMap[t.key];
                        return (
                            <Grid item xs={12} sm={6} md={6} lg={4} key={t.key}>
                                <Card sx={{ borderRadius: 2, boxShadow: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flex: "1 1 auto" }}>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                            {t.label}
                                        </Typography>

                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 160,
                                                borderRadius: 1,
                                                overflow: "hidden",
                                                border: "1px solid #e0e0e0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mb: 1,
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            <img
                                                src={imgUrl || defaultImg}
                                                alt={t.key}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: imgUrl ? "cover" : "contain",
                                                    opacity: imgUrl ? 1 : 0.6,
                                                }}
                                            />
                                        </Box>
                                        <small>Recommended size: 100px x 100px (2 MB)</small>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                            {imgUrl ? "Image selected" : "No image selected"}
                                        </Typography>

                                        <input
                                            id={`file-input-${t.key}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileChange(e, t.key)}
                                        />
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            <label htmlFor={`file-input-${t.key}`}>
                                                <Button size="small" variant="outlined" component="span" disabled={loading}>
                                                    {loading ? "Uploading..." : "Upload"}
                                                </Button>
                                            </label>

                                            {/* <Button size="small" variant="outlined" onClick={() => handlePasteUrl(t.key)} disabled={loading}>
                                                Paste URL
                                            </Button> */}

                                            {/* <Button size="small" variant="text" color="error" onClick={() => removeImageLocal(t.key)} disabled={loading || !imgUrl}>
                                                Remove
                                            </Button> */}
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {entry.platform ? `Platform: ${entry.platform}` : "Platform: mobile"}
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => saveIcon(t.key)}
                                                disabled={loading || !entry.icon}
                                            >
                                                {loading ? "Saving..." : "Save"}
                                            </Button>
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
