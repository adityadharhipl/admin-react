import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchQuery,
    deleteQuery,
} from "../../Redux/Reducers/UserFeedbackReducerList";
import {
    Box,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Alert,
    CircularProgress,
    TextField,
    TablePagination,
    InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import PageHeader1 from "../../components/common/PageHeader1";
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast } from 'react-toastify';

function AstroSupportDetails() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.UserFeedbackReducerList || {});
    const FeedbackData = useSelector((state) => state.UserFeedbackReducerList?.data || []);
    const pagination = useSelector((state) => state.UserFeedbackReducerList?.pagination);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
            limit = 10000;
        }
        dispatch(fetchQuery({
            page: page + 1,
            limit,
            search: searchQuery || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }));
    }, [paginationModel, dispatch, searchQuery, startDate, endDate]);

    const handleClickOpen = (feedbackId) => {
        setSelectedFeedbackId(feedbackId);
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

            const url = `${process.env.REACT_APP_BASEURL}/admin/query?${params.toString()}`;
            const response = await axios.get(url, {
                headers: { Authorization: token },
            });

            const allData = response?.data?.data || [];
            const exportData = allData.map((item, index) => ({
                'S.No': index + 1,
                'User Name': item?.name || '-',
                'Email': item?.email || '-',
                'Phone Number': item?.mobile || '-',
                'Query': item?.query || '-',
                'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Astro Feedback');
            XLSX.writeFile(wb, `Astro_Feedback_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Export successful!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = () => {
        if (selectedFeedbackId) {
            dispatch(deleteQuery(selectedFeedbackId));
            const { page, pageSize } = paginationModel;
            let limit = Number(pageSize);
            if (isNaN(limit)) {
                limit = 10000;
            }
            dispatch(fetchQuery({
                page: page + 1,
                limit,
                search: searchQuery || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            }));
            setOpen(false);
        }
    };

    const columns = [
        {
            field: "sono",
            headerName: "S.No",
            width: 80,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: "actions",
            headerName: "Actions",
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
                        to={`/AstroView-detail/${row.id}`}
                        title="View Details"
                        sx={{
                            color: '#d32f2f',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            },
                        }}
                    >
                        <i className="icofont-eye" style={{ fontSize: '18px' }}></i>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleClickOpen(row.id)}
                        title="Delete Query"
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
        { field: "name", headerName: "User Name", width: 200 },
        { field: "email", headerName: "Email", width: 250 },
        { field: "mobile", headerName: "Phone Number", width: 150 },
        {
            field: "feedback",
            headerName: "Query",
            width: 300,
            renderCell: ({ row }) => (
                <Box
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                    title={row?.feedback || ''}
                >
                    {row?.feedback || '-'}
                </Box>
            ),
        },
        { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
    ];

    const rows = useMemo(() => {
        return Array.isArray(FeedbackData) ? FeedbackData.map((feedback, index) => ({
            sono: paginationModel.page * paginationModel.pageSize + index + 1,
            id: feedback?._id,
            name: feedback?.name || '-',
            email: feedback?.email || '-',
            mobile: feedback?.mobile || '-',
            feedback: feedback?.query || '-',
            createdAt: feedback?.createdAt ? new Date(feedback?.createdAt) : null,
        })) : [];
    }, [FeedbackData, paginationModel]);

    const loading = status === 'loading';

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1 pagetitle="Astro Feedback List" />

                {status === 'failed' && error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            borderRadius: '8px',
                        }}
                    >
                        Error: {error}
                    </Alert>
                )}

                {/* Custom Toolbar */}
                <div className="card mb-3" style={{
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
                </div>

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
                                        columns={columns}
                                        rows={rows}
                                        loading={loading}
                                        disableSelectionOnClick
                                        columnVisibilityModel={columnVisibilityModel}
                                        onColumnVisibilityModelChange={(newModel) =>
                                            setColumnVisibilityModel(newModel)
                                        }
                                        paginationMode="server"
                                        hideFooterPagination
                                        autoHeight
                                        getRowId={(row) => row.id}
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
                        Are you sure you want to delete this query?
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
    );
}

export default AstroSupportDetails;
