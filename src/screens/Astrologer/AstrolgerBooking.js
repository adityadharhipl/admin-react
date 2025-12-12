import React, { useState, useEffect } from "react";

import { useParams } from 'react-router-dom';
import axios from "axios";
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

function BookingList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [""],
    });

    const token = localStorage.getItem("User-admin-token");
    const { astoID } = useParams();


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_BASEURL}/admin/astroBooking/${astoID}`,
                    {
                        headers: { Authorization: token },
                    }
                );

                const bookings = res.data.data || [];
                const formattedRows = bookings.map((booking, index) => ({
                    id: booking._id || `generated-${index}`,
                    soNo: index + 1,
                    orderId: booking.orderId || "",
                    userName: booking.userName || "",
                    astroName: booking.astroName || "",
                    bookingType: booking.bookingType || "",
                    startTime
                        : booking.startTime

                            ? new Date(booking.startTime
                            ).toLocaleString()
                            : "",
                    bookingTime
                        : booking.bookingTime

                            ? new Date(booking.bookingTime
                            ).toLocaleString()
                            : "",
                    bookingStatus: booking?.bookingStatus || "",
                    totalDuration: booking.totalDuration || "",
                    actualDeduction: booking.actualDeduction || "",
                    promotionalDeduction: booking.promotionalDeduction || "",
                }));


                setRows(formattedRows);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [astoID, token]);



    const handleClose = () => {
        setOpen(false);
    };



    const columns = [
        { field: "soNo", headerName: "SO NO", width: 80 },
        { field: "orderId", headerName: "Booking ID", width: 150 },
        { field: "userName", headerName: "User Name", width: 180 },
        { field: "astroName", headerName: "Astrologer Name", width: 180 },
        { field: "bookingType", headerName: "Booking Type", width: 180 },
        { field: "bookingStatus", headerName: "Booking Status", width: 180 },
        { field: "totalDuration", headerName: "Total Duration", width: 180 },
        { field: "actualDeduction", headerName: "Actual Deduction", width: 180 },
        {
            field: "promotionalDeduction",
            headerName: "Promotional Deduction",
            width: 200,
        },
        { field: "startTime", headerName: "Created At", width: 200 },
        { field: "bookingTime", headerName: "Updated At", width: 200 },
    ];

    return (
        <Box className="body d-flex" sx={{ padding: 2 }}>
            <Box className="container-xxl" sx={{ width: "100%" }}>
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
                <h4>Astro Bookings List</h4>

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 300,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: "100%", mt: 2 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            checkboxSelection={false}
                            disableSelectionOnClick
                            components={{ Toolbar: GridToolbar }}
                            filterModel={filterModel}
                            onFilterModelChange={(model) => setFilterModel(model)}
                            columnVisibilityModel={columnVisibilityModel}
                            onColumnVisibilityModelChange={(newModel) =>
                                setColumnVisibilityModel(newModel)
                            }
                        />
                    </Box>
                )}


            </Box>
        </Box>
    );
}

export default BookingList;
