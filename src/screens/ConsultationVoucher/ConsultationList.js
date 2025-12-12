import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, FormControl, Select, MenuItem, TextField, TablePagination, CircularProgress } from '@mui/material';
import PageHeader1 from '../../components/common/PageHeader1';
import { deleteGiftAmount, updatePositionChange } from '../../Redux/Reducers/ConsultationReducer';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { handleUnauthorized } from '../../TokenAuth/auth';

function ConsultationListTable() {
    const dispatch = useDispatch();
    const [giftAmountStateDtaa, setGiftAmountStateDtaa] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(false);
    const BASE_URL = process.env.REACT_APP_BASEURL;
    const getAuthToken = () => localStorage.getItem("User-admin-token");
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0,
    });
    const [paginationDetail, setPaginationDetail] = useState({
        totalDocs: 0,
        totalPages: 0
    });

    const giftAmountList = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page,
                limit: limit,
                ...(filter !== "All" && { category: filter }),
                ...(searchQuery && { search: searchQuery }),
                ...(startDate && { startDate: startDate }),
                ...(endDate && { endDate: endDate })
            });

            const response = await fetch(`${BASE_URL}/admin/giftAmount?${queryParams}`, {
                headers: { 'Authorization': getAuthToken() },
            });

            if (!response.ok) throw new Error('Failed to fetch gift amounts');
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }

            const data = await response.json();
            setGiftAmountStateDtaa(data?.data || []);
            setPaginationDetail({
                totalDocs: data?.paginationDetail?.totalDocs || 0,
                totalPages: data?.paginationDetail?.totalPages || 0
            });
        } catch (error) {
            toast.error(error.message || "Failed to fetch gift amounts");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const page = paginationModel.page + 1;
        let limit = Number(paginationModel.pageSize);
        if (isNaN(limit)) {
            limit = paginationDetail?.totalDocs || 10000;
        }

        giftAmountList(page, limit);
    }, [paginationModel, filter, searchQuery, startDate, endDate, paginationDetail?.totalDocs]);

    const handleDelete = async () => {
        if (selectedCouponId) {
            try {
                await dispatch(deleteGiftAmount(selectedCouponId)).unwrap();
                toast.success("Gift Amount deleted successfully!");
                giftAmountList();
            } catch (error) {
                toast.error(error || "Failed to delete!");
            }
        }
        setOpen(false);
    };

    const handlePositionChange = async (row, newPosition) => {
        const body = [{
            position: newPosition,
            category: row.category,
        }];
        try {
            await dispatch(updatePositionChange({ id: row._id, giftAmountsArray: body })).unwrap();
            toast.success("Position updated successfully!");
            giftAmountList(paginationModel.page + 1, paginationModel.pageSize);
        } catch (error) {
            toast.error(error || "Failed to update position!");
        }
    };

    // Pagination Handlers
    const handleChangePage = (event, newPage) =>
        setPaginationModel((prev) => ({ ...prev, page: newPage }));

    const handleChangeRowsPerPage = (event) => {
        const value = event.target.value;
        const newSize = parseInt(value, 10);
        setPaginationModel({ page: 0, pageSize: newSize });
    };

    // Reset Filter Handler
    const isFilterActive = startDate || endDate || searchQuery;
    const handleResetFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setSearchQuery("");
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const token = getAuthToken();
            if (!token) {
                toast.error("Authorization token not found");
                setIsExporting(false);
                return;
            }

            const queryParams = new URLSearchParams({
                ...(filter !== "All" && { category: filter }),
                ...(searchQuery && { search: searchQuery }),
                ...(startDate && { startDate: startDate }),
                ...(endDate && { endDate: endDate })
            });

            const response = await axios.get(`${BASE_URL}/admin/giftAmount?${queryParams}`, {
                headers: { 'Authorization': token },
            });

            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }

            const allData = response.data?.data || [];

            if (!Array.isArray(allData) || allData.length === 0) {
                setIsExporting(false);
                return;
            }

            const exportData = allData.map((item, index) => ({
                "S.No": index + 1,
                Title: item.title || "",
                Amount: item.actualAmount || 0,
                GiftAmount: item.giftAmount || 0,
                Category: item.category || "",
                CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
                UpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "GiftAmounts");
            XLSX.writeFile(workbook, `ConsultationList_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Export successful!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error(error.response?.data?.message || `Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const rows = useMemo(() => {
        const pageSize = paginationModel.pageSize;
        return giftAmountStateDtaa.map((item, index) => ({
            id: item._id || index,
            sono: index + 1 + paginationModel.page * pageSize,
            _id: item._id,
            title: item?.title || "N/A",
            actualAmount: item?.actualAmount || 0,
            position: item?.position,
            giftAmount: item?.giftAmount || 0,
            category: item?.category || "N/A",
            createdAt: item?.createdAt ? new Date(item?.createdAt) : null,
            updatedAt: item?.updatedAt ? new Date(item?.updatedAt) : null,
        }));
    }, [giftAmountStateDtaa, paginationModel]);

    const allColumns = [
        { field: 'sono', headerName: 'S.No', width: 80, headerAlign: 'center', align: 'center' },
        {
            field: "position",
            headerName: "Index",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const total = paginationDetail?.totalDocs || 0;
                return (
                    <Select
                        size="small"
                        value={params.row.position}
                        onChange={(e) => handlePositionChange(params.row, e.target.value)}
                        sx={{
                            height: 32,
                            width: "90px",
                            backgroundColor: "#fff",
                            borderRadius: '8px',
                            fontSize: '13px',
                        }}
                    >
                        {Array.from({ length: total }, (_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {i + 1}
                            </MenuItem>
                        ))}
                    </Select>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton component={Link} to={`/Concoupons-edit/${row._id}`} title="Edit">
                        <i className="icofont-edit" style={{ fontSize: '18px', color: '#1976d2' }}></i>
                    </IconButton>
                    <IconButton onClick={() => { setSelectedCouponId(row._id); setOpen(true); }} title="Delete">
                        <i className="icofont-ui-delete" style={{ fontSize: '18px', color: '#d32f2f' }}></i>
                    </IconButton>
                </Box>
            ),
        },
        { field: 'title', headerName: 'Title', width: 250 },
        { field: 'actualAmount', headerName: 'Amount', width: 150 },
        { field: 'giftAmount', headerName: 'Gift Amount', width: 160 },
        { field: 'category', headerName: 'Category', width: 180 },
        { field: 'createdAt', headerName: 'Created At', width: 180, type: 'dateTime' },
        { field: 'updatedAt', headerName: 'Updated At', width: 180, type: 'dateTime' },
    ];

    const columns = filter === "All"
        ? allColumns.filter(col => col.field !== "position")
        : allColumns;

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1 pagetitle="Wallet Recharge Pack List" righttitle="Create New" link="/consultationvoucher-add" routebutton={true} />

                {/* Search and Export Toolbar */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <FormControl sx={{ minWidth: 220 }} size="small">
                            <Select
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            >
                                <MenuItem value="All">All Categories</MenuItem>
                                <MenuItem value="First Recharge">First Recharge</MenuItem>
                                <MenuItem value="Second Recharge">Second Recharge</MenuItem>
                                <MenuItem value="Third Recharge">Third Recharge</MenuItem>
                                <MenuItem value="Fourth Recharge">Fourth Recharge</MenuItem>
                                <MenuItem value="Fifth Recharge">Fifth Recharge & onwards</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Search..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 280 }}
                            placeholder="Search by title..."
                        />
                        {/* <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={startDate || ""}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: 180,
                                    "& .MuiInputBase-input[type='date']": {
                                        paddingRight: "12px",
                                        "&::-webkit-calendar-picker-indicator": {
                                            cursor: "pointer",
                                            padding: "4px 8px",
                                            marginLeft: "4px",
                                            opacity: 0.7,
                                            "&:hover": {
                                                opacity: 1,
                                            },
                                        },
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "rgba(0, 0, 0, 0.23)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "rgba(0, 0, 0, 0.87)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "var(--primary-color, #1976d2)",
                                        },
                                    },
                                }}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={endDate || ""}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: 180,
                                    "& .MuiInputBase-input[type='date']": {
                                        paddingRight: "12px",
                                        "&::-webkit-calendar-picker-indicator": {
                                            cursor: "pointer",
                                            padding: "4px 8px",
                                            marginLeft: "4px",
                                            opacity: 0.7,
                                            "&:hover": {
                                                opacity: 1,
                                            },
                                        },
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "rgba(0, 0, 0, 0.23)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "rgba(0, 0, 0, 0.87)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "var(--primary-color, #1976d2)",
                                        },
                                    },
                                }}
                            />
                        </Box> */}
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        {isFilterActive && (
                            <Button
                                variant="outlined"
                                onClick={handleResetFilter}
                                sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    borderColor: "var(--primary-color, #1976d2)",
                                    color: "var(--primary-color, #1976d2)",
                                    "&:hover": {
                                        borderColor: "var(--primary-color, #1976d2)",
                                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                                    },
                                }}
                            >
                                Reset Filter
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="btn btn-primary"
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                height: 40,
                                px: 2,
                               
                            }}
                        >
                            {isExporting ? (
                                <>
                                    <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />
                                    Exporting...
                                </>
                            ) : (
                                "Export to Excel"
                            )}
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <div className="card" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none', overflow: 'hidden' }}>
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Custom Pagination on Top */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                backgroundColor: "#f8f9fa",
                                borderBottom: "2px solid #e9ecef",
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={paginationDetail?.totalDocs || 0}
                                page={paginationModel.page}
                                onPageChange={handleChangePage}
                                rowsPerPage={paginationModel.pageSize}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[10, 25, 50]}
                            />
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
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8f9fa',
                            },
                        }}>
                            <DataGrid
                                autoHeight
                                columns={columns}
                                rows={rows}
                                loading={loading}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[10, 25, 50]}
                                paginationMode="server"
                                disableRowSelectionOnClick
                                getRowId={(row) => row.id}
                                hideFooterPagination
                                hideFooter
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
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this voucher?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ConsultationListTable;
