import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteCoupon } from "../../Redux/Reducers/CoupansReducer";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    TablePagination,
    CircularProgress,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageHeader1 from '../../components/common/PageHeader1';

function ListConsultationCoupon() {
    const dispatch = useDispatch();

    const [coupons, setCoupons] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [paginationDetail, setPaginationDetail] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchCoupons = async () => {
        const token = localStorage.getItem("User-admin-token");
        if (!token) {
            setError("Authentication token not found.");
            setStatus("error");
            return;
        }

        setStatus('loading');
        try {
            const { page, pageSize } = paginationModel;
            let limit = Number(pageSize);
            if (isNaN(limit)) {
                // Use a large default limit for "All" option
                limit = 10000;
            }

            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: limit.toString(),
            });

            // Add category filter based on tab
            if (tabValue === 0) {
                params.append('category', 'flat_extra_rupees');
            } else if (tabValue === 1) {
                params.append('category', 'flat_extra_percentage');
            }

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            if (startDate) {
                params.append('startDate', startDate);
            }

            if (endDate) {
                params.append('endDate', endDate);
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BASEURL}/admin/coupon?${params.toString()}`,
                { headers: { 'Authorization': token } }
            );

            const data = response.data;
            setCoupons(data?.data || []);
            setPaginationDetail(data?.paginationDetail || {});
            setStatus('success');
            setError(null);
        } catch (err) {
            setError(err.message);
            setStatus('error');
            setCoupons([]);
            setPaginationDetail({});
        }
    };

    useEffect(() => {
        fetchCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationModel.page, paginationModel.pageSize, tabValue, searchQuery, startDate, endDate]);

    const handleTabChange = (newValue) => {
        setTabValue(newValue);
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const handleChangePage = (event, newPage) => {
        setPaginationModel({ ...paginationModel, page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const value = event.target.value;
        const newPageSize = parseInt(value, 10);
        setPaginationModel({ page: 0, pageSize: newPageSize });
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setStartDate(null);
        setEndDate(null);
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem("User-admin-token");
            if (!token) {
                toast.error("Authentication token not found.");
                return;
            }

            const params = new URLSearchParams({
                page: '1',
                limit: '10000',
            });

            // Add category filter based on tab
            if (tabValue === 0) {
                params.append('category', 'flat_extra_rupees');
            } else if (tabValue === 1) {
                params.append('category', 'flat_extra_percentage');
            }

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            if (startDate) {
                params.append('startDate', startDate);
            }

            if (endDate) {
                params.append('endDate', endDate);
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BASEURL}/admin/coupon?${params.toString()}`,
                { headers: { 'Authorization': token } }
            );

            const couponsData = response.data?.data || [];

            if (couponsData.length === 0) {
                return;
            }

            const exportData = couponsData.map((item, index) => ({
                'S.No': index + 1,
                'Coupon Code': item?.couponCode || '',
                'Category': item?.category || '',
                'Discount Value': item?.discountValue || '',
                'Discount Type': item?.discountType || '',
                'Min Cart Value': item?.minCartValue || '',
                'Valid From': item?.validFrom ? new Date(item.validFrom).toLocaleDateString() : '',
                'Valid To': item?.validTo ? new Date(item.validTo).toLocaleDateString() : '',
                'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Coupons');

            const columnWidths = [
                { wch: 8 },
                { wch: 20 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 25 },
            ];
            worksheet['!cols'] = columnWidths;

            XLSX.writeFile(workbook, 'consultation_coupons_export.xlsx');
            toast.success('Coupons exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export coupons');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteCoupon(selectedUserId));
            await fetchCoupons();
            setOpen(false);
            toast.success('Coupon deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete coupon');
        }
    };

    const rows = useMemo(() => {
        const pageSize = paginationModel.pageSize;
        return Array.isArray(coupons)
            ? coupons.map((item, index) => ({
                id: item._id || index,
                _id: item._id,
                sono: paginationModel.page * pageSize + index + 1,
                couponCode: item?.couponCode,
                category: item?.category,
                discountValue: item?.discountValue,
                validTo: item?.validTo ? new Date(item?.validTo) : null,
                validFrom: item?.validFrom ? new Date(item?.validFrom) : null,
                minCartValue: item?.minCartValue,
                discountType: item.discountType,
                createdAt: item?.createdAt ? new Date(item?.createdAt) : null,
            }))
            : [];
    }, [coupons, paginationModel]);

    const columns = [
        {
            field: 'sono',
            headerName: 'S.No',
            width: 80,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <IconButton
                        size="small"
                        onClick={() => handleClickOpen(row._id)}
                        title="Delete Coupon"
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
        { field: 'couponCode', headerName: 'Coupon Code', width: 180 },
        { field: 'category', headerName: 'Category', width: 180 },
        {
            field: 'discountValue',
            headerName: 'Discount',
            width: 120,
            headerAlign: 'center',
            align: 'center',
        },
        { field: 'validFrom', headerName: 'Start Date', width: 150, type: 'date' },
        { field: 'validTo', headerName: 'End Date', width: 150, type: 'date' },
        {
            field: 'minCartValue',
            headerName: 'Min. Cart Value',
            width: 150,
            headerAlign: 'center',
            align: 'center',
        },
        { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
    ];

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1
                    pagetitle='Consultation Coupon List'
                    righttitle='Add Coupon'
                    link='/consultation-add'
                    routebutton={true}
                />

                {/* Toolbar with Filters */}
                <div className="card mb-3" style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none'
                }}>
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Search"
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                                }}
                                sx={{
                                    minWidth: '200px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                    }
                                }}
                                placeholder="Search coupons..."
                            />

                            <TextField
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={startDate || ''}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    minWidth: '180px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        paddingRight: '10px',
                                    }
                                }}
                            />

                            <TextField
                                label="End Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={endDate || ''}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    minWidth: '180px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        paddingRight: '10px',
                                    }
                                }}
                            />

                            <Button
                                variant="outlined"
                                onClick={handleResetFilter}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
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
                                startIcon={isExporting ? <CircularProgress size={16} /> : null}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    ml: 'auto',
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
                    </div>
                </div>

                {/* Tabs Card */}
                <div className="card mb-3" style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none'
                }}>
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Button
                                variant={tabValue === 0 ? "contained" : "outlined"}
                                onClick={() => handleTabChange(0)}
                                sx={{
                                    fontSize: '14px',
                                    minHeight: 36,
                                    padding: '4px 16px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    backgroundColor: tabValue === 0
                                        ? 'var(--primary-color, #E7B242)'
                                        : 'transparent',
                                    color: tabValue === 0
                                        ? '#ffffff'
                                        : 'rgba(0, 0, 0, 0.6)',
                                    borderColor: tabValue === 0
                                        ? 'var(--primary-color, #E7B242)'
                                        : 'rgba(0, 0, 0, 0.23)',
                                    '&:hover': {
                                        backgroundColor: tabValue === 0
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                        color: tabValue === 0
                                            ? '#ffffff'
                                            : 'var(--primary-color, #E7B242)',
                                        borderColor: tabValue === 0
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'var(--primary-color, #E7B242)',
                                    },
                                    boxShadow: tabValue === 0 ? 'none' : 'none',
                                }}
                            >
                                Flat Rs Extra
                            </Button>
                            <Button
                                variant={tabValue === 1 ? "contained" : "outlined"}
                                onClick={() => handleTabChange(1)}
                                sx={{
                                    fontSize: '14px',
                                    minHeight: 36,
                                    padding: '4px 16px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    backgroundColor: tabValue === 1
                                        ? 'var(--primary-color, #E7B242)'
                                        : 'transparent',
                                    color: tabValue === 1
                                        ? '#ffffff'
                                        : 'rgba(0, 0, 0, 0.6)',
                                    borderColor: tabValue === 1
                                        ? 'var(--primary-color, #E7B242)'
                                        : 'rgba(0, 0, 0, 0.23)',
                                    '&:hover': {
                                        backgroundColor: tabValue === 1
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                        color: tabValue === 1
                                            ? '#ffffff'
                                            : 'var(--primary-color, #E7B242)',
                                        borderColor: tabValue === 1
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'var(--primary-color, #E7B242)',
                                    },
                                    boxShadow: tabValue === 1 ? 'none' : 'none',
                                }}
                            >
                                Percent Extra
                            </Button>
                        </Box>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card" style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: 'none',
                            overflow: 'hidden'
                        }}>
                            <div className="card-body" style={{ padding: 0, position: 'relative' }}>
                                {error && (
                                    <div className="alert alert-danger m-3" style={{ borderRadius: '8px' }}>
                                        <strong>Error:</strong> {error}
                                    </div>
                                )}
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
                                        loading={status === 'loading'}
                                        paginationMode="server"
                                        hideFooterPagination
                                        getRowId={(row) => row.id}
                                        columnVisibilityModel={columnVisibilityModel}
                                        onColumnVisibilityModelChange={(newModel) =>
                                            setColumnVisibilityModel(newModel)
                                        }
                                        disableSelectionOnClick
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
                                </Box>
                                <TablePagination
                                    component="div"
                                    count={paginationDetail?.totalDocs || 0}
                                    page={paginationModel.page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={paginationModel.pageSize}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    labelRowsPerPage="Rows per page:"
                                    sx={{
                                        borderTop: '1px solid #e9ecef',
                                        '& .MuiTablePagination-toolbar': {
                                            padding: '12px 20px',
                                        },
                                    }}
                                />
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
                        Are you sure you want to delete this coupon?
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

export default ListConsultationCoupon;
