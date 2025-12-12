import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCustomerSupport,
    deleteCustomerSupport,
} from "../../Redux/Reducers/UserFeedBacksupportReducer";
import {
    Box,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
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

function MessageSupportDetails() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.UserFeedBacksupport || {});
    const MessageData = useSelector((state) => state?.UserFeedBacksupport?.queries || []);
    const pagination = useSelector((state) => state?.UserFeedBacksupport?.pagination);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [open, setOpen] = useState(false);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
            limit = 10000;
        }
        dispatch(fetchCustomerSupport({
            page: page + 1,
            limit,
            search: searchQuery || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }));
    }, [paginationModel, dispatch, searchQuery, startDate, endDate]);

    const handleClickOpen = (messageId) => {
        setSelectedMessageId(messageId);
        setOpen(true);
    };


    const handleClose = () => {
        setOpen(false);
    };


    const handleChangePage = (event, newPage) => {
        setPaginationModel({ ...paginationModel, page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const newPageSize = event.target.value === -1 ? -1 : Number(event.target.value);
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

            const url = `${process.env.REACT_APP_BASEURL}/admin/customerSupport?${params.toString()}`;
            const response = await axios.get(url, {
                headers: { Authorization: token },
            });

            const data = response.data?.data || [];
            const exportData = data.map((item, index) => ({
                'S.No': index + 1,
                'User Name': item?.name || '-',
                'Email': item?.email || '-',
                'Phone Number': item?.mobile || '-',
                'Subject': item?.subject || '-',
                'Feedback': item?.description || '-',
                'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'User Feedback');
            XLSX.writeFile(wb, `User_Feedback_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = () => {
        if (selectedMessageId) {
            dispatch(deleteCustomerSupport(selectedMessageId));
            const { page, pageSize } = paginationModel;
            let limit = Number(pageSize);
            if (isNaN(limit)) {
                limit = 10000;
            }
            dispatch(fetchCustomerSupport({
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
                        to={`/MessageView-detail/${row.id}`}
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
                        title="Delete Feedback"
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
        { field: "userName", headerName: "User Name", width: 200 },
        { field: "email", headerName: "Email", width: 250 },
        { field: "phoneNumber", headerName: "Phone Number", width: 150 },
        { field: "subject", headerName: "Subject", width: 180 },
        {
            field: "message",
            headerName: "Feedback",
            width: 300,
            renderCell: ({ row }) => (
                <Box
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                    title={row?.message || ''}
                >
                    {row?.message || '-'}
                </Box>
            ),
        },
        { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
    ];

    const rows = useMemo(() => {
        return Array.isArray(MessageData) ?
            MessageData.map((message, index) => ({
                sono: paginationModel.page * paginationModel.pageSize + index + 1,
                id: message?._id,
                userName: message?.name || '-',
                email: message?.email || '-',
                phoneNumber: message?.mobile || '-',
                subject: message?.subject || '-',
                message: message?.description || '-',
                createdAt: message?.createdAt ? new Date(message?.createdAt) : null,
            }))
            : [];
    }, [MessageData, paginationModel]);


    const loading = status === 'loading';

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                {/* Page Header */}
                <PageHeader1 pagetitle="User FeedBack List" />
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card" style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: 'none',
                            overflow: 'hidden'
                        }}>
                            <div className="card-body" style={{ padding: '20px' }}>
                                {/* Custom Toolbar */}
                                <Box sx={{
                                    mb: 2,
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                }}>
                                    <TextField
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        size="small"
                                        sx={{ flexGrow: 1, minWidth: '200px' }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="icofont-search" style={{ fontSize: '18px', color: '#666' }}></i>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        size="small"
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
                                        label="End Date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        size="small"
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
                                        }}
                                    >
                                        {isExporting ? 'Exporting...' : 'Export'}
                                    </Button>
                                </Box>

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
                        Are you sure you want to delete this feedback?
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

export default MessageSupportDetails;
