import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CircularProgress, Box, Card, CardContent, Typography, Chip, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleUnauthorized } from '../../TokenAuth/auth';
import { ArrowBack } from '@mui/icons-material';

function OnlineStatus() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [onlineStatusData, setOnlineStatusData] = useState(null);
    const token = localStorage.getItem("User-admin-token");

    useEffect(() => {
        if (id) {
            fetchOnlineStatus();
        }
    }, [id]);

    const fetchOnlineStatus = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_BASEURL}/admin/onlineStatus/${id}`,
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                setOnlineStatusData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch online status');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error fetching online status:', error);
                toast.error(error.response?.data?.message || 'Error fetching online status');
            }
        } finally {
            setLoading(false);
        }
    };

    const rows = useMemo(() => {
        if (!onlineStatusData?.sessions || !Array.isArray(onlineStatusData.sessions)) {
            return [];
        }
        return onlineStatusData.sessions.map((item, index) => ({
            ...item,
            id: item._id || `session-${index}`,
            sono: index + 1,
            status: item.status || '-',
            isManuallyBusy: item.isManuallyBusy ? 'Yes' : 'No',
            startTimeIST: item.startTimeIST || '-',
            endTimeIST: item.endTimeIST || '-',
            duration: item.duration || '-',
            isOngoing: item.isOngoing ? 'Yes' : 'No',
        }));
    }, [onlineStatusData]);

    const columns = [
        { field: "sono", headerName: "S.No", width: 80, align: "center", headerAlign: "center" },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value || '-'}
                    sx={{
                        fontWeight: 600,
                        backgroundColor: params.value === 'online' ? '#4caf50' : '#9e9e9e',
                        color: '#fff',
                        textTransform: 'capitalize',
                    }}
                />
            )
        },
        {
            field: "isManuallyBusy",
            headerName: "Manually Busy",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    sx={{
                        fontWeight: 600,
                        backgroundColor: params.value === 'Yes' ? '#ff9800' : '#9e9e9e',
                        color: '#fff',
                    }}
                />
            )
        },
        { field: "startTimeIST", headerName: "Start Time (IST)", width: 200 },
        { field: "endTimeIST", headerName: "End Time (IST)", width: 200 },
        { field: "duration", headerName: "Duration", width: 150 },
        {
            field: "isOngoing",
            headerName: "Ongoing",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    sx={{
                        fontWeight: 600,
                        backgroundColor: params.value === 'Yes' ? '#2196f3' : '#9e9e9e',
                        color: '#fff',
                    }}
                />
            )
        },
    ];

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
                <div className="d-flex align-items-center gap-3">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/astrologer-list')}
                        sx={{ textTransform: 'none' }}
                    >
                        Back
                    </Button>
                    <h4 className="mb-0 fw-bold">
                        Online Status Details
                    </h4>
                </div>
            </div>

            <div className="card-body">
                {onlineStatusData ? (
                    <Box sx={{ mt: 2 }}>
                        <Card sx={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            height: '150px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <CardContent sx={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: '16px !important',
                                '&:last-child': { pb: '16px' }
                            }}>
                                {/* Astrologer Information Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '16px' }}>
                                        Astrologer Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>
                                            <strong>Full Name:</strong> {onlineStatusData?.astrologer?.fullName || '-'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>
                                            <strong>Email:</strong> {onlineStatusData?.astrologer?.email || '-'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>
                                            <strong>Mobile Number:</strong> {onlineStatusData?.astrologer?.mobileNumber || '-'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Current Status Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '16px' }}>
                                        Current Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Chip
                                            label={onlineStatusData?.currentStatus ? onlineStatusData.currentStatus.charAt(0).toUpperCase() + onlineStatusData.currentStatus.slice(1) : 'Offline'}
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor: onlineStatusData?.currentStatus === 'online' ? '#4caf50' : '#9e9e9e',
                                                color: '#fff',
                                                minWidth: '120px',
                                                height: '28px',
                                                fontSize: '13px',
                                                textTransform: 'capitalize'
                                            }}
                                        />
                                        <Chip
                                            label={onlineStatusData?.isManuallyBusy ? 'Manually Busy' : 'Available'}
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor: onlineStatusData?.isManuallyBusy ? '#ff9800' : '#9e9e9e',
                                                color: '#fff',
                                                minWidth: '120px',
                                                height: '28px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No online status data available
                        </Typography>
                    </Box>
                )}

                {/* Session Table */}
                {onlineStatusData?.sessions && onlineStatusData.sessions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '18px' }}>
                            Status History
                        </Typography>
                        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            <Box sx={{ p: 2 }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        "& .MuiDataGrid-root": { border: "none" },
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: "#f8f9fa",
                                            borderBottom: "2px solid #e9ecef",
                                            fontWeight: 600,
                                        },
                                    }}
                                >
                                    <DataGrid
                                        autoHeight
                                        columns={columns}
                                        rows={rows}
                                        getRowId={(row) => row.id}
                                        disableRowSelectionOnClick
                                        hideFooter
                                        sx={{
                                            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                                                outline: "none",
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                )}
            </div>
        </>
    );
}

export default OnlineStatus;

