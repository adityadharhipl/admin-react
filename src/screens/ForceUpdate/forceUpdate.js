import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ✅ Reusable image upload function (S3)
const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `${process.env.REACT_APP_ADMIN_TOKEN}`,
            },
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const responseData = await response.json();
        const imageUrl = responseData?.data?.img[0];

        if (imageUrl) {
            toast.success("Image uploaded successfully!");
            return imageUrl;
        } else {
            throw new Error("No image URL in response");
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
        return null;
    }
};

export const ForceUpdate = () => {
    const [form, setForm] = useState({
        appType: "astro",
        platform: "android", // 👈 new field for tab switching
        minimumVersionAndroid: "",
        minimumVersionIos: "",
        latestVersionAndroid: "",
        latestVersionIos: "",
        forceUpdate: false,
        updateTitle: "",
        updateMessage: "",
        updateUrlAndroid: "",
        updateUrlIos: "",
        logoUrl: "",
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(form.appType || "astro");

    // ✅ Fetch existing config
    const fetchForceUpdate = async (type = activeTab) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/astro/appbuild/${type}`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();

            const { _id, __v, createdAt, updatedAt, features, ...rest } = data?.data || {};
            setForm((prev) => ({ ...prev, ...(rest || {}), appType: type }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch Force Update settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForceUpdate(activeTab);
    }, [activeTab]);

    // ✅ Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ✅ Upload logo
    const handleFileChange = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = await handleImageUpload(file);
        if (imageUrl && fieldName === "logoUrl") {
            setForm((prev) => ({ ...prev, logoUrl: imageUrl }));
        }
    };

    // ✅ Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { ...form, appType: activeTab };

            const res = await fetch(`${process.env.REACT_APP_BASEURL}/astro/appbuild/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update");
            toast.success("Force Update settings saved successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Error saving Force Update data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-body modern-card p-3">
            {/* 🔹 Header Buttons */}
            <div className="d-flex justify-content-between align-items-center gap-2 modern-header mb-3">
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'astro' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('astro')}
                    >
                        ASTROLOGER
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'user' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('user')}
                    >
                        USER
                    </button>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ height: "30px" }}
                    onClick={() => fetchForceUpdate(activeTab)}
                >
                    Refresh
                </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
                <h5 className="fw-bold mb-3">Force Update Configuration</h5>
                <div className="form-check form-switch m-0">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="forceUpdate"
                        name="forceUpdate"
                        checked={form.forceUpdate}
                        onChange={handleChange}
                        role="switch"
                    />
                    <label className="form-check-label" htmlFor="forceUpdate">
                        Force Update Required
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
                <div className="row g-2 small">
                    {/* 🔹 Common Fields */}
                    <div className="col-md-12">
                        <label>Update Title</label>
                        <input
                            className="form-control form-control-sm"
                            name="updateTitle"
                            value={form.updateTitle || ""}
                            onChange={handleChange}
                            placeholder="What's new in this version?"
                        />
                    </div>

                    <div className="col-md-12 mt-2">
                        <label>Update Message</label>
                        <textarea
                            className="form-control form-control-sm"
                            name="updateMessage"
                            rows="2"
                            value={form.updateMessage || ""}
                            onChange={handleChange}
                            placeholder="https://play.google.com/..."
                        ></textarea>
                    </div>

                    {/* 🔹 Android / iOS Tabs */}
                    <div className="d-flex gap-2 mt-3">
                        <button
                            type="button"
                            className={`btn btn-sm ${form.platform === "android" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setForm((prev) => ({ ...prev, platform: "android" }))}
                        >
                            Android
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${form.platform === "ios" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setForm((prev) => ({ ...prev, platform: "ios" }))}
                        >
                            iOS
                        </button>
                    </div>

                    {/* 🔸 Android Fields */}
                    {(form.platform === "android" || !form.platform) && (
                        <div className="row g-3 small mt-2 border rounded p-3 bg-light">
                            <h6 className="fw-bold mb-2">Android Configuration</h6>

                            <div className="col-md-12">
                                <label>Update URL (Android)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="updateUrlAndroid"
                                    value={form.updateUrlAndroid || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mt-2">
                                <label>Minimum Version (Android)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="minimumVersionAndroid"
                                    value={form.minimumVersionAndroid || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                />
                            </div>

                            <div className="col-md-6 mt-2">
                                <label>Latest Version (Android)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="latestVersionAndroid"
                                    value={form.latestVersionAndroid || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                />
                            </div>
                        </div>
                    )}

                    {/* 🔸 iOS Fields */}
                    {form.platform === "ios" && (
                        <div className="row g-3 small mt-2 border rounded p-3 bg-light">
                            <h6 className="fw-bold mb-2">iOS Configuration</h6>

                            <div className="col-md-12">
                                <label>Update URL (iOS)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="updateUrlIos"
                                    value={form.updateUrlIos || ""}
                                    onChange={handleChange}
                                    placeholder="https://apps.apple.com/..."
                                />
                            </div>

                            <div className="col-md-6 mt-2">
                                <label>Minimum Version (iOS)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="minimumVersionIos"
                                    value={form.minimumVersionIos || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                />
                            </div>

                            <div className="col-md-6 mt-2">
                                <label>Latest Version (iOS)</label>
                                <input
                                    className="form-control form-control-sm"
                                    name="latestVersionIos"
                                    value={form.latestVersionIos || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                />
                            </div>
                        </div>
                    )}

                    {/* 🔹 Logo Upload + Save */}
                    <div className="col-12 d-md-flex align-items-center justify-content-between mt-1">
                        <div className="col-md-6 d-md-flex align-items-center gap-3">
                            <div>
                                <label>Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control form-control-sm"
                                    onChange={(e) => handleFileChange(e, "logoUrl")}
                                />
                                <small className="text-muted">Recommended size: 80px x 80px (2 MB)</small>
                            </div>
                            {form.logoUrl && (
                                <img
                                    src={form.logoUrl}
                                    alt="Logo"
                                    className="mt-2 rounded"
                                    style={{ width: "80px", height: "80px", objectFit: "contain" }}
                                />
                            )}
                        </div>

                        <div className="col-md-6 d-flex align-items-center justify-content-end mt-3 mt-md-0">
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm px-4 modern-save"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ForceUpdate;
