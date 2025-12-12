import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import IconButton from '@mui/material/IconButton';

function CouponView() {
    const { id } = useParams();
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("User-admin-token");

    const [currentPage, setCurrentPage] = useState(1);
    const codesPerPage = 10;

    useEffect(() => {
        if (!id) return;

        fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `${token}` },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setCoupon(data.data);
                } else {
                    setError("Coupon not found");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id, token]);

    const exportToCSV = () => {
        if (!coupon) return;

        const couponData = [
            {
                ID: coupon._id || "N/A",
                Type: coupon.type || "N/A",
                Category: coupon.category || "N/A",
                "Discount Value": coupon.discountValue || "N/A",
                "Minimum Cart Value": coupon.minCartValue || "N/A",
                "Valid From": new Date(coupon.validFrom).toLocaleDateString("en-GB") || "N/A",
                "Valid To": new Date(coupon.validTo).toLocaleDateString("en-GB") || "N/A",
                "Unique Codes": coupon.uniqueCodes?.map(code => code.code).join(", ") || "N/A",
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(couponData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "coupon_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ textAlign: "center", color: "red" }}>{error}</div>;
    }

    const totalPages = Math.ceil((coupon?.uniqueCodes?.length || 0) / codesPerPage);

    const currentCodes = coupon?.uniqueCodes?.slice(
        (currentPage - 1) * codesPerPage,
        currentPage * codesPerPage
    );

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className="container">
            <button
                onClick={() => window.history.back()}
                style={{
                    marginBottom: "10px",
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

            <button
                style={{
                    marginBottom: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "10px",
                }}
                onClick={exportToCSV}
            >
                Export to CSV
            </button>

            <div
                style={{
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    marginBottom: "20px",
                }}
            >
                <h3>Coupon Details</h3>
                <p><strong>ID:</strong> {coupon?._id || "N/A"}</p>
                <p><strong>Type:</strong> {coupon?.type || "N/A"}</p>
                <p><strong>Category:</strong> {coupon?.category || "N/A"}</p>
                <p><strong>Discount Value Off:</strong> {coupon?.discountValue || "N/A"}</p>
                <p><strong>Minimum Cart Value:</strong> {coupon?.minCartValue || "N/A"}</p>
                <p><strong>Valid From:</strong> {new Date(coupon?.validFrom).toLocaleDateString("en-GB") || "N/A"}</p>
                <p><strong>Valid To:</strong> {new Date(coupon?.validTo).toLocaleDateString("en-GB") || "N/A"}</p>
            </div>

            <div style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}>
                <h3>Unique Codes</h3>
                {currentCodes?.length > 0 ? (
                    <>
                        <ul>
                            {currentCodes.map((codeObj) => (
                                <li key={codeObj._id}>{codeObj.code}</li>
                            ))}
                        </ul>
                        <div style={{ marginTop: "10px", display: "flex", gap: "15px", alignItems: "center" }}>
                            <IconButton
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    color: "#007bff",
                                }}
                            >
                                {/* <ChevronLeftIcon /> */}
                                  ←
                            </IconButton>
                            <span style={{ fontSize: "14px" }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <IconButton
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                    color: "#007bff",
                                }}
                            >
                                {/* <ChevronRightIcon /> */}
                                 →
                            </IconButton>
                        </div>
                    </>
                ) : (
                    <p>No unique codes available.</p>
                )}
            </div>
        </div>
    );
}

export default CouponView;
