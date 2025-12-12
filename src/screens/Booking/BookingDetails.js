import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingDetails = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    console.log(booking, "booking")
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("User-admin-token");

    const userId = booking?.userId
    // || booking?.userId;
    const astroId = booking?.astroId;

    // navigate(`/admin/chat/${userId}/${astroId}`);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/booking/${id}`, {
                    headers: { Authorization: token },
                });

                const data = response.data.data;

                // Format bookingTime
                const bookingTimeObj = new Date(data.bookingTime);
                const day = bookingTimeObj.getDate();
                const month = bookingTimeObj.getMonth() + 1;
                const year = bookingTimeObj.getFullYear();
                const hours = bookingTimeObj.getHours();
                const minutes = String(bookingTimeObj.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedHour = hours % 12 || 12;
                const formattedTime = `${day}-${month}-${year}, ${formattedHour}:${minutes} ${ampm}`;

                setBooking({
                    ...data,
                    bookingTimeFormatted: formattedTime
                });
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center mt-4">
                <h5>No booking details found.</h5>
            </div>
        );
    }


    const formatCamelCase = (str) => {
        if (!str) return '';
        return str
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (char) => char.toUpperCase());
    };
    const convertSecondsToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours} hr ${minutes} min ${seconds} sec`;
    };




    return (
        <>
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

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="fw-bold m-0">Booking Details</h4>
                    {/* {booking.bookingType === "chat" && ( */}
                    <button
                        className={`btn btn-sm ${booking?.bookingStatus !== "completed" ? "btn-outline-primary" : "btn-primary"}`}
                        onClick={() => booking?.bookingStatus === "completed" && navigate(`/chat-history/${userId}/${astroId}`)}
                        disabled={booking?.bookingStatus !== "completed"}
                        title={booking?.bookingStatus !== "completed" ? "Chat history available after completion" : ""}
                    >
                        View Chat History
                    </button>

                    {/* )} */}
                </div>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6"><strong>Booking ID:</strong> {booking?.orderId}</div>
                            <div className="col-md-6"><strong>User Name:</strong> {booking?.userName}</div>
                            <div className="col-md-6"><strong>Astrologer Name:</strong> {booking?.astroName}</div>
                            <div className="col-md-6"><strong>Booking Type:</strong> {formatCamelCase(booking?.bookingType)}</div>
                            <div className="col-md-6"><strong>Created At:</strong> {booking?.bookingTimeFormatted}</div>
                            <div className="col-md-6"><strong>Booking Price:</strong> {booking?.bookingPrice}</div>
                            {/* <div className="col-md-6">
                            <strong>Booking Start Time:</strong>{" "}
                            {booking?.startTime ? new Date(booking.startTime).toLocaleDateString("en-GB").replace(/\//g, "-") : "N/A"}
                        </div> */}
                            <div className="col-md-6">
                                <strong>Booking Start Time:</strong>{" "}
                                {booking?.startTime &&
                                    new Date(booking.startTime).toLocaleString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        year: "numeric",
                                        month: "short",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                            </div>


                            {(booking?.bookingType === "call" || booking?.bookingType === "chat") && (
                                <div className="col-md-6">
                                    <strong>Per Minute Price:</strong> {booking?.perMinPrice}
                                </div>
                            )}

                            {booking?.bookingType !== "audio" &&
                                booking?.bookingType !== "chat" &&
                                booking?.reason &&
                                booking?.reason !== "N/A" && (
                                    <div className="col-md-6"><strong>Reason:</strong> {booking?.reason}</div>
                                )}

                            <div className="col-md-6"><strong>Booking Status:</strong> {booking?.bookingStatus}</div>

                            {/* {(booking.bookingType !== "audio" && booking.bookingType !== "chat") ? (
                            <div className="col-md-6"><strong>Total Duration:</strong> {booking.totalDuration}</div>
                        ) : (
                            Number(booking.totalDuration) > 45 && (
                                <div className="col-md-6"><strong>Total Duration:</strong> {booking.totalDuration} sec</div>
                            )
                        )} */}
                            {(booking.bookingType !== "audio" && booking.bookingType !== "chat") ? (
                                <div className="col-md-6">
                                    <strong>Total Duration:</strong> {convertSecondsToTime(Number(booking.totalDuration))}
                                </div>
                            ) : (
                                Number(booking.totalDuration) > 45 && (
                                    <div className="col-md-6">
                                        <strong>Total Duration:</strong> {convertSecondsToTime(Number(booking.totalDuration))}
                                    </div>
                                )
                            )}


                            <div className="col-md-6"><strong>Total Deduction:</strong> {booking.totalDeduction}</div>
                            <div className="col-md-6">
                                <strong>Actual Deduction:</strong> {Number(booking.actualDeduction).toFixed(2)}
                            </div>
                            <div className="col-md-6"><strong>Promotional Deduction:</strong> {booking.promotionalDeduction}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default BookingDetails;

