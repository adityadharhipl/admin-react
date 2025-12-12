import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Toaster, toast } from "react-hot-toast";
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Switch,
    TextField,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReview, verifyReviews } from '../../Redux/Reducers/ReviewCourseReducer';
import * as XLSX from 'xlsx';

function GenericReviewList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const reviewData = useSelector((state) => state?.ReviewCourseReducer?.review || []);
    const status = useSelector((state) => state?.ReviewCourseReducer?.status);
    const pagination = useSelector((state) => state?.ReviewCourseReducer?.pagination);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
            limit = 10000;
        }
        dispatch(fetchReview({
            page: page + 1,
            limit,
            search: searchQuery || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }));
    }, [paginationModel, dispatch, searchQuery, startDate, endDate]);

    const GenericReviewData = useMemo(() => {
        return reviewData?.map((item, index) => ({
            id: item._id,
            serialNo: paginationModel.page * paginationModel.pageSize + index + 1,
            comment: item?.intakeForm?.message || "-",
            astrologerName: item?.intakeForm?.astrologerId?.fullName || "-",
            userName: item?.intakeForm?.userId?.fullName || "-",
            rating: item?.rating || 0,
            parentId: item._id,
            status: item?.status === "approved",
            createdAt: item?.createdAt ? new Date(item.createdAt) : null,
            updatedAt: item?.updatedAt ? new Date(item.updatedAt) : null,
        })) || [];
    }, [reviewData, paginationModel]);

    const handleClickOpen = (reviewId) => {
        setSelectedReviewId(reviewId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChangePage = (event, newPage) => {
        setPaginationModel({ ...paginationModel, page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const newPageSize = Number(event.target.value);
        setPaginationModel({ page: 0, pageSize: newPageSize });
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem("User-admin-token");
            const params = new URLSearchParams();

            if (searchQuery) params.append('search', searchQuery);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const url = `${process.env.REACT_APP_BASEURL}/admin/feedbacks?${params.toString()}`;
            const response = await axios.get(url, {
                headers: { Authorization: token },
            });

            const allData = response?.data?.data || [];
            const exportData = allData.map((item, index) => ({
                'S.No': index + 1,
                'Comment': item?.intakeForm?.message || '-',
                'Rating': item?.rating || 0,
                'Astrologer Name': item?.intakeForm?.astrologerId?.fullName || '-',
                'User Name': item?.intakeForm?.userId?.fullName || '-',
                'Status': item?.status === "approved" ? "Approved" : "Rejected",
                'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
                'Updated At': item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Astrologer Reviews');
            XLSX.writeFile(wb, `Astrologer_Reviews_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Export successful!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (selectedReviewId) {
            try {
                const token = localStorage.getItem("User-admin-token");
                const { page, pageSize } = paginationModel;
                let limit = Number(pageSize);
                if (isNaN(limit)) {
                    limit = 10000;
                }
                await axios.delete(`${process.env.REACT_APP_BASEURL}/admin/feedback/${selectedReviewId}`, {
                    headers: {
                        Authorization: ` ${token}`,
                    },
                });
                toast.success("Review deleted successfully!");
                dispatch(fetchReview({
                    page: page + 1,
                    limit,
                    search: searchQuery || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                }));
                setOpen(false);
            } catch (error) {
                console.error("Error deleting Review:", error);
                toast.error("Failed to delete Review!");
            }
        }
    };
    const handleToggle = (id, currentStatus) => {
        const newStatus = currentStatus ? "rejected" : "approved";
        dispatch(verifyReviews({ id, status: newStatus }))
            .unwrap()
            .then(() => {
                toast.success(`Review ${newStatus} successfully.`);
                const { page, pageSize } = paginationModel;
                let limit = Number(pageSize);
                if (isNaN(limit)) {
                    limit = 10000;
                }
                dispatch(fetchReview({
                    page: page + 1,
                    limit,
                    search: searchQuery || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                }));
            })
            .catch((err) => toast.error(err));
    };

    const columns = [
        {
            field: 'serialNo',
            headerName: 'S.No',
            width: 80,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/review-edit/${row?.parentId}`}
                        title="Edit Review"
                        sx={{
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <i className="icofont-edit" style={{ fontSize: '18px' }}></i>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleClickOpen(row?.parentId)}
                        title="Delete Review"
                        sx={{
                            color: '#d32f2f',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            },
                        }}
                    >
                        <i className="icofont-ui-delete" style={{ fontSize: '18px' }}></i>
                    </IconButton>
                </Box>
            ),
        },
        {
            field: 'comment',
            headerName: 'Comment',
            width: 300,
            renderCell: (params) => (
                <Box
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                    title={params.value}
                >
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                    <i className="icofont-star" style={{ color: '#ffc107', fontSize: '16px' }}></i>
                    <span>{params.value || '0'}</span>
                </Box>
            ),
        },
        { field: 'astrologerName', headerName: 'Astrologer Name', width: 220 },
        { field: 'userName', headerName: 'User Name', width: 220 },
        { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
        { field: 'updatedAt', headerName: 'Updated At', width: 200, type: 'dateTime' },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ row }) => (
                <Switch checked={Boolean(row.status)} onChange={() => handleToggle(row.id, row.status)} color="primary" />
            ),
        },
    ];

    return (
        <>
            <Toaster />
            <div className="body d-flex">
                <div className="container-xxl">
                    <PageHeader1 pagetitle="Astrologer Reviews" />

                    {/* Custom Toolbar */}
                    {/* <div className="card mb-3" style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <div className="card-body" style={{ padding: '16px 20px' }}>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                '@media (max-width: 768px)': {
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                }
                            }}>
                                <TextField
                                    size="small"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{
                                        minWidth: 200,
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <i className="icofont-search" style={{ fontSize: '18px', color: '#666' }}></i>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        minWidth: 200,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '8px 8px 12px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="End Date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        minWidth: 200,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '8px 8px 12px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilter}
                                    sx={{
                                        borderColor: 'var(--primary-color, #E7B242)',
                                        color: 'var(--primary-color, #E7B242)',
                                        '&:hover': {
                                            borderColor: 'var(--primary-color, #E7B242)',
                                            backgroundColor: 'rgba(231, 178, 66, 0.08)',
                                        },
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={exportToExcel}
                                    disabled={isExporting}
                                    sx={{
                                        backgroundColor: 'var(--primary-color, #E7B242)',
                                        '&:hover': {
                                            backgroundColor: 'var(--primary-color, #E7B242)',
                                            opacity: 0.9,
                                        },
                                        '&:disabled': {
                                            backgroundColor: 'var(--primary-color, #E7B242)',
                                            opacity: 0.6,
                                        },
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                    }}
                                >
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            </Box>
                        </div>
                    </div> */}

                    <div className="row g-0 mb-3">
                        <div className="col-md-12">
                            <div className="card" style={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: 'none',
                                overflow: 'hidden'
                            }}>
                                <div className="card-body" style={{ padding: 0 }}>
                                    <Box sx={{
                                        width: '100%',
                                        '& .MuiDataGrid-root': {
                                            border: 'none',
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f0f0f0',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f8f9fa',
                                            borderBottom: '2px solid #e9ecef',
                                            fontWeight: 600,
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            display: 'none',
                                        },
                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: '#f8f9fa',
                                        },
                                    }}>
                                        <DataGrid
                                            rows={GenericReviewData}
                                            columns={columns}
                                            loading={status === 'loading'}
                                            getRowId={(row) => row.id}
                                            columnVisibilityModel={columnVisibilityModel}
                                            onColumnVisibilityModelChange={(newModel) =>
                                                setColumnVisibilityModel(newModel)
                                            }
                                            disableSelectionOnClick
                                            paginationMode="server"
                                            hideFooterPagination
                                            autoHeight
                                            sx={{
                                                '& .MuiDataGrid-cell:focus': {
                                                    outline: 'none',
                                                },
                                                '& .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                },
                                            }}
                                        />
                                        <TablePagination
                                            component="div"
                                            count={pagination?.totalDocs || 0}
                                            page={paginationModel.page}
                                            onPageChange={handleChangePage}
                                            rowsPerPage={paginationModel.pageSize}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            rowsPerPageOptions={[10, 25, 50]}
                                        />
                                    </Box>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Delete Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this Review?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default GenericReviewList;
