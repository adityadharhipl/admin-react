import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import toast, { Toaster } from 'react-hot-toast';
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Tooltip,
    InputAdornment,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import userImg from "../../assets/images/user.svg";
import { fetchUsers } from '../../Redux/Reducers/UserManagementReducer';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineInfo } from "react-icons/md";
import { BsDownload } from 'react-icons/bs';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from '../../utils/dateUtils';


function UsersList() {
    const [selectedRows, setSelectedRows] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const [inactiveUsersLoading, setInactiveUsersLoading] = useState(false);
    const [inactiveRowCount, setInactiveRowCount] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('fullName'); // 'fullName', 'email', 'mobileNumber'

    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();
    const [startDate, setStartDate] = useState(todayDate);
    const [endDate, setEndDate] = useState(todayDate);
    const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
    const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
    const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied

    const [couponSubject, setCouponSubject] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState(null);
    const [couponOpen, setCouponOpen] = useState(false);
    const [couponValue, setCouponValue] = useState('');
    const [submitAttemptedCoupon, setSubmitAttemptedCoupon] = useState(false);

    // Recharge states
    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [rechargeValue, setRechargeValue] = useState('');
    const [submitAttemptedRecharge, setSubmitAttemptedRecharge] = useState(false);
    const [isSendRecharge, setIsSendRecharge] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const usersFromStore = useSelector((state) => state?.UserManagementReducer?.users || []);
    const paginationInfo = useSelector((state) => state?.UserManagementReducer?.pagination);
    const loading = useSelector((state) => state?.UserManagementReducer?.loading || false);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

    const isInitialMount = useRef(true);
    // Removed fileInputRef - no longer needed for CSV download

    const [isSend, setIsSend] = useState(false);


    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            toast.error("No file selected");
            return;
        }
        const token = localStorage.getItem("User-admin-token");
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/uploadUsers`, {
                method: "POST",
                headers: { Authorization: token },
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                toast.success("Users uploaded successfully!");
                const pageSize = paginationModel.pageSize;
                let limit = Number(pageSize);
                if (isNaN(limit)) {
                    limit = 10;
                }
                const params = {
                    page: 1,
                    limit: limit,
                };

                if (lastAction === "date" || lastAction === null) {
                    params.startDate = appliedStartDate;
                    params.endDate = appliedEndDate;
                }

                if (lastAction === "search" && appliedSearchQuery) {
                    if (searchType === 'fullName') {
                        params.fullName = appliedSearchQuery;
                    } else if (searchType === 'email') {
                        params.email = appliedSearchQuery;
                    } else if (searchType === 'mobileNumber') {
                        params.mobileNumber = appliedSearchQuery;
                    }
                }

                dispatch(fetchUsers(params));
            } else {
                toast.error(result.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Something went wrong while uploading");
        }
    };
    const handleDownloadCSVFormat = () => {
        const sampleData = [
            ["Full Name", "Email", "Mobile Number", "Country Code", "State", "City", "Address", "DOB", "Time of Birth"],
            ["User-1", "user1@example.com", "98XXXXXXX1", "91", "Delhi", "New Delhi", "123 Main Street", "15-05-1990", "10:30 AM"],
            ["User-2", "user2@example.com", "98XXXXXXX2", "91", "Delhi", "New Delhi", "123 Main Street", "15-05-2000", "02:30 PM"],
            ["User-1", "user1@example.com", "98XXXXXXX3", "91", "Delhi", "New Delhi", "123 Main Street", "15-05-2014", "08:00 AM"],
        ];

        const csvContent = sampleData.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "user_upload_format.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadCSV = async () => {
        const token = localStorage.getItem("User-admin-token");
        setIsDownloadingCSV(true);

        try {
            const params = new URLSearchParams();

            // Only send startDate and endDate, no page, no limit
            if (appliedStartDate) {
                params.append('startDate', convertISTToUTCForAPI(appliedStartDate, 'start'));
            }
            if (appliedEndDate) {
                params.append('endDate', convertISTToUTCForAPI(appliedEndDate, 'end'));
            }

            const response = await fetch(
                `${process.env.REACT_APP_BASEURL}/admin/user/export?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const result = await response.json();
            const users = Array.isArray(result) ? result : result?.data || [];
            if (!users.length) {
                toast.error("No user data available to download");
                return;
            }

            // Only these 4 fields: fullName, email, mobileNumber, createdAt
            const headers = ["Full Name", "Email", "Mobile Number", "Created At"];

            // Create CSV content
            const csvRows = [
                headers.join(","), // Header row
                ...users.map((user) => [
                    `"${(user.fullName || "").replace(/"/g, '""')}"`, // Escape quotes
                    `"${(user.email || "").replace(/"/g, '""')}"`,
                    `"${(user.mobileNumber || "").replace(/"/g, '""')}"`,
                    `"${formatUTCDateForExport(user.createdAt).replace(/"/g, '""')}"`,
                ].join(",")),
            ];

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "users_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("CSV downloaded successfully!");
        } catch (error) {
            console.error("CSV download failed:", error);
            toast.error("Failed to download CSV");
        } finally {
            setIsDownloadingCSV(false);
        }
    };

    const fetchInactiveUsers = useCallback(async (page, limit, search = '') => {
        setInactiveUsersLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/inactiveUsers`, {
                headers: { 'Authorization': `${localStorage.getItem("User-admin-token")}` },
                params: {
                    page,
                    limit,
                    search,
                }
            });

            if (response.status === 200 && response.data.data && typeof response.data.data !== 'undefined') {
                setInactiveUsers(response.data.data || []);
                setInactiveRowCount(response.data.paginationDetail?.totalDocs || 0);
            } else {
                setInactiveUsers([]);
                setInactiveRowCount(0);
            }
        } catch (error) {
            console.error('Error fetching inactive users:', error);
            setInactiveUsers([]);
            setInactiveRowCount(0);
            toast.error(error.response?.data?.message || 'Failed to fetch inactive users.');
        } finally {
            setInactiveUsersLoading(false);
        }
    }, []);

    // Search Handler - Only applies search query (no dates, no limit changes)
    const handleSearch = () => {
        // If search is empty, do nothing - don't trigger API call
        if (!searchQuery.trim()) {
            return;
        }
        // Set search and mark lastAction as "search" to prevent dates
        setAppliedSearchQuery(searchQuery.trim());
        setLastAction("search");
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Apply Date Filters Handler - Only applies date filters (no search)
    const handleApplyFilters = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setLastAction("date");
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Reset Filter Handler
    const handleResetFilter = () => {
        setStartDate(todayDate);
        setEndDate(todayDate);
        setAppliedStartDate(todayDate);
        setAppliedEndDate(todayDate);
        setSearchQuery("");
        setAppliedSearchQuery("");
        setSearchType('fullName');
        setLastAction(null);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Auto-reset search when input becomes empty
    useEffect(() => {
        if (!searchQuery.trim() && appliedSearchQuery) {
            setAppliedSearchQuery("");
            setLastAction(null);
            setPaginationModel(prev => ({ ...prev, page: 0 }));
        }
    }, [searchQuery]);

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
            limit = 10;
        }

        // CRITICAL: When search is active, send search query with page and limit=10000, NO dates
        if (lastAction === "search") {
            // When search is active, send search parameters with page and limit=10000, NO dates
            const params = {
                page: page + 1,
                limit: 10000,
            };
            if (appliedSearchQuery && appliedSearchQuery.trim()) {
                if (searchType === 'fullName') {
                    params.fullName = appliedSearchQuery;
                } else if (searchType === 'email') {
                    params.email = appliedSearchQuery;
                } else if (searchType === 'mobileNumber') {
                    params.mobileNumber = appliedSearchQuery;
                }
            }
            // Only dispatch if search query exists
            if (appliedSearchQuery && appliedSearchQuery.trim()) {
                if (showInactive) {
                    fetchInactiveUsers(1, 10000, appliedSearchQuery);
                } else {
                    dispatch(fetchUsers(params));
                }
            }
            return; // Exit early, don't send dates
        }

        // For date filters or initial load, send page, limit, and dates
        const params = {
            page: page + 1,
            limit: limit,
        };

        if (lastAction === "date" || lastAction === null) {
            params.startDate = convertISTToUTCForAPI(appliedStartDate, 'start');
            params.endDate = convertISTToUTCForAPI(appliedEndDate, 'end');
        }

        // Dispatch with page, limit, and dates (only for date filters or initial load)
        if (showInactive) {
            fetchInactiveUsers(page + 1, limit, appliedSearchQuery);
        } else {
            dispatch(fetchUsers(params));
        }
    }, [paginationModel, dispatch, showInactive, appliedSearchQuery, appliedStartDate, appliedEndDate, searchType, lastAction, fetchInactiveUsers]);


    const handleManageSelected = () => {
        setSearchQuery('');
        setAppliedSearchQuery('');
        setStartDate(todayDate);
        setEndDate(todayDate);
        setAppliedStartDate(todayDate);
        setAppliedEndDate(todayDate);
        setSearchType('fullName');
        setLastAction(null);
        setShowInactive(true);
        setSelectedRows([]);
        setPaginationModel(prev => ({ page: 0, pageSize: prev.pageSize }));
    };

    const handleShowAllUsers = () => {
        setSearchQuery('');
        setAppliedSearchQuery('');
        setStartDate(todayDate);
        setEndDate(todayDate);
        setAppliedStartDate(todayDate);
        setAppliedEndDate(todayDate);
        setSearchType('fullName');
        setLastAction(null);
        setShowInactive(false);
        setSelectedRows([]);
        setPaginationModel(prev => ({ page: 0, pageSize: prev.pageSize }));
    };

    const handleChangePage = (event, newPage) => {
        setPaginationModel({ ...paginationModel, page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const value = event.target.value;
        const newPageSize = parseInt(value, 10);
        setPaginationModel({ page: 0, pageSize: newPageSize });
    };

    const handleCouponClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select users to send a coupon.");
            return;
        }
        setCouponOpen(true);
    };

    const handleRechargeClick = () => {
        if (selectedRows.length !== 1) {
            toast.error("Please select exactly one user for recharge.");
            return;
        }
        setRechargeOpen(true);
    };

    const handleRechargeClose = () => {
        setRechargeOpen(false);
        setRechargeValue('');
        setSubmitAttemptedRecharge(false);
        setIsSendRecharge(false);
    };

    const handleRechargeSend = async () => {
        setSubmitAttemptedRecharge(true);

        // ✅ Validate recharge amount
        const amount = parseFloat(rechargeValue);
        if (isNaN(amount) || amount < 1 || amount > 9999999) {
            toast.error("Recharge amount must be between ₹1 and ₹9,999,999.");
            return;
        }

        // ✅ Proceed with recharge
        setIsSendRecharge(true);
        try {
            const selectedUser = baseDataSet.find(user => user._id === selectedRows[0]);
            const response = await axios.post(
                `${process.env.REACT_APP_BASEURL}/admin/successRecharge`,
                {
                    amount: amount,
                    userId: [selectedRows[0]],
                    // name: selectedUser?.fullName,
                },
                {
                    headers: {
                        Authorization: `${localStorage.getItem("User-admin-token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Recharge successful!");
                handleRechargeClose();
                setSelectedRows([]);
                const { page, pageSize } = paginationModel;
                let limit = Number(pageSize);
                if (isNaN(limit)) {
                    limit = 10;
                }
                const params = {
                    page: page + 1,
                    limit: limit,
                };

                if (lastAction === "date" || lastAction === null) {
                    params.startDate = appliedStartDate;
                    params.endDate = appliedEndDate;
                }

                if (lastAction === "search" && appliedSearchQuery) {
                    if (searchType === 'fullName') {
                        params.fullName = appliedSearchQuery;
                    } else if (searchType === 'email') {
                        params.email = appliedSearchQuery;
                    } else if (searchType === 'mobileNumber') {
                        params.mobileNumber = appliedSearchQuery;
                    }
                }

                if (showInactive) {
                    fetchInactiveUsers(page + 1, limit, appliedSearchQuery);
                } else {
                    dispatch(fetchUsers(params));
                }
            } else {
                toast.error(response.data?.message || "Failed to process recharge.");
            }
        } catch (error) {
            console.error("Error processing recharge:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to process recharge. Please try again."
            );
        } finally {
            setIsSendRecharge(false);
        }
    };

    const handleCouponClose = () => {
        setCouponOpen(false);
        setCouponValue('');
        setCouponSubject('');
        setCouponMessage('');
        setSubmitAttemptedCoupon(false);
        setIsSend(false);
    };

    const handleCouponSend = async () => {
        setSubmitAttemptedCoupon(true);

        // ✅ Validate coupon value (robust to string or number input)
        const amount = parseFloat(couponValue);
        if (isNaN(amount) || amount < 1 || amount > 9999999) {
            toast.error("Coupon amount must be between ₹1 and ₹9,999,999.");
            return;
        }

        // ✅ Validate other fields
        if (selectedRows.length === 0) {
            toast.error("Please select at least one user.");
            return;
        }

        if (!couponSubject.trim()) {
            toast.error("Please enter a subject.");
            return;
        }

        if (!couponMessage.trim()) {
            toast.error("Please enter a message.");
            return;
        }

        // ✅ Proceed with sending
        setIsSend(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASEURL}/admin/userGiftAmount`,
                {
                    amount: amount,
                    subject: couponSubject,
                    message: couponMessage,
                    userIds: selectedRows,
                },
                {
                    headers: {
                        Authorization: `${localStorage.getItem("User-admin-token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Coupon sent successfully!");
                handleCouponClose();
                setSelectedRows([]);
                setCouponValue("");
                setCouponSubject("");
                setCouponMessage("");
            } else {
                toast.error(response.data?.message || "Failed to send coupon.");
            }
        } catch (error) {
            console.error("Error sending coupon:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to send the coupon. Please try again."
            );
        } finally {
            setIsSend(false);
        }
    };

    const handleDeleteUserClick = (userId) => {
        setSelectedUserIdToDelete(userId);
        setOpenDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
        setSelectedUserIdToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUserIdToDelete) return;
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASEURL}/admin/user/${selectedUserIdToDelete}`, {
                headers: { 'Authorization': ` ${localStorage.getItem("User-admin-token")}` },
            });
            if (response.status === 200) {
                toast.success("User deleted successfully!");
                setSelectedRows(prev => prev.filter(id => id !== selectedUserIdToDelete));
                const { page, pageSize } = paginationModel;
                let limit = Number(pageSize);
                if (isNaN(limit)) {
                    limit = 10;
                }
                const searchParams = {};
                if (appliedSearchQuery) {
                    if (searchType === 'fullName') {
                        searchParams.fullName = appliedSearchQuery;
                    } else if (searchType === 'email') {
                        searchParams.email = appliedSearchQuery;
                    } else if (searchType === 'mobileNumber') {
                        searchParams.mobileNumber = appliedSearchQuery;
                    }
                }
                if (showInactive) {
                    fetchInactiveUsers(page + 1, limit, appliedSearchQuery);
                } else {
                    dispatch(fetchUsers({ page: page + 1, limit: limit, ...searchParams }));
                }
            } else {
                toast.error(response.data?.message || "Failed to delete user.");
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || "Failed to delete the user. Please try again.");
        } finally {
            handleDeleteDialogClose();
        }
    };

    const columns = [
        { field: 'sono', headerName: 'S.No', width: 70, sortable: false, filterable: false },
        {
            field: "actions", headerName: "Actions", width: 100, sortable: false, filterable: false,
            renderCell: ({ row }) => (
                <Box>
                    <IconButton component={Link} to={`/users-edit/${row._id}`} color="primary">
                        <i className="icofont-edit text-danger" style={{ fontSize: '1.2rem' }}></i>
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteUserClick(row._id)}>
                        <i className="icofont-ui-delete text-danger" style={{ fontSize: '1.2rem' }}></i>
                    </IconButton>
                </Box>
            ),
        },
        // {
        //     field: 'profileImg', headerName: 'Image', width: 80,
        //     renderCell: (params) => (<img src={params.value || userImg} alt="User" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />),
        //     sortable: false, filterable: false,
        // },
        {
            field: 'fullName', headerName: 'Name', width: 200,
            renderCell: (params) => (
                <Button variant="text" size="small" sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }} onClick={() => navigate(`/booking-by-user/${params.row._id}`)}>
                    {params.value}
                </Button>
            ),
        },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'mobileNumber', headerName: 'Mobile', width: 130 },
        { field: 'createdAt', headerName: 'Created At', width: 170 },
        { field: 'updatedAt', headerName: 'Updated At', width: 170 },

    ];

    const baseDataSet = showInactive ? inactiveUsers : usersFromStore;

    const currentGridRows = (baseDataSet || []).map((user, index) => {
        const pageSize = paginationModel.pageSize;
        const serialNumberBase = paginationModel.page * pageSize;
        return {
            id: user._id,
            _id: user._id,
            sono: serialNumberBase + index + 1,
            profileImg: user.profileImg || userImg,
            fullName: user.fullName || 'N/A',
            email: user.email || '-',
            mobileNumber: user.mobileNumber || '-',
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
            updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "",
        };
    });

    const handleExport = async () => {
        const token = localStorage.getItem("User-admin-token");
        setIsExporting(true);

        try {
            const params = new URLSearchParams();

            // Only send startDate and endDate, no page, no limit
            if (appliedStartDate) {
                params.append('startDate', convertISTToUTCForAPI(appliedStartDate, 'start'));
            }
            if (appliedEndDate) {
                params.append('endDate', convertISTToUTCForAPI(appliedEndDate, 'end'));
            }

            const response = await fetch(
                `${process.env.REACT_APP_BASEURL}/admin/user/export?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to export user data");
            }

            const result = await response.json();
            const users = Array.isArray(result) ? result : result?.data || [];
            if (!users.length) {
                toast.error("No user data available to export");
                return;
            }

            // Only export these 4 fields: fullName, email, mobileNumber, createdAt
            const headers = [
                "Full Name",
                "Email",
                "Mobile Number",
                "Created At",
            ];

            const rows = users.map((user) => [
                user.fullName || "",
                user.email || "",
                user.mobileNumber || "",
                formatUTCDateForExport(user.createdAt), // Use formatter for export
            ]);

            const worksheetData = [headers, ...rows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

            // Auto column width
            const columnWidths = headers.map((header) => ({ wch: header.length + 10 }));
            worksheet["!cols"] = columnWidths;

            // Save Excel file
            XLSX.writeFile(workbook, "users_export.xlsx");

            toast.success("Users exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export users");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <Toaster />
            <div className="body d-flex">
                <div className="container-xxl">
                    <PageHeader1 righttitle="Add Users" link="/users-add" routebutton={true} pagetitle={<span className="page-header-spacing">Users List ({showInactive ? inactiveRowCount : (paginationInfo?.totalDocs || 0)})</span>} />
                    <div className="row g-0 mb-3 mt-1">
                        <div className="col-md-12">
                            <div className="card modern-card">
                                <div className="card-body p-3">
                                    <Box sx={{ width: '100%' }}>
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            gap={2}
                                            mb={2}
                                            className="modern-header w-100"
                                        >
                                            {/* Top Line: Search + Date Filters */}
                                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                <Tooltip title="Download CSV Format">
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleDownloadCSVFormat}
                                                        sx={{
                                                            color: 'var(--color-500)',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <MdOutlineInfo />
                                                    </IconButton>
                                                </Tooltip>
                                                <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
                                                    <InputLabel>Search By</InputLabel>
                                                    <Select
                                                        value={searchType}
                                                        label="Search By"
                                                        onChange={(e) => setSearchType(e.target.value)}
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        <MenuItem value="fullName">Full Name</MenuItem>
                                                        <MenuItem value="email">Email</MenuItem>
                                                        <MenuItem value="mobileNumber">Mobile Number</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <TextField
                                                    placeholder={
                                                        searchType === "fullName" ? "Search by full name..." :
                                                            searchType === "email" ? "Search by email..." :
                                                                "Search by mobile number..."
                                                    }
                                                    variant="outlined"
                                                    size="small"
                                                    className="modern-search"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyPress={(e) => { if (e.key === 'Enter') { handleSearch(); } }}
                                                    sx={{
                                                        width: { xs: '150px', sm: '180px', md: '200px' },
                                                        flexShrink: 0,
                                                        background: 'var(--card-color)',
                                                        borderRadius: '9px',
                                                        '& .MuiInputBase-input': { fontSize: '13px', padding: '9px 10px 9px 0' },
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={handleSearch}
                                                    sx={{
                                                        backgroundColor: "var(--primary-color, #1976d2)",
                                                        color: "#fff",
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "8px",
                                                        flexShrink: 0,
                                                        "&:hover": { backgroundColor: "var(--primary-color, #1976d2)", opacity: 0.9 },
                                                    }}
                                                >
                                                    <SearchIcon />
                                                </IconButton>
                                                <TextField
                                                    label="Start Date"
                                                    type="date"
                                                    variant="outlined"
                                                    size="small"
                                                    value={startDate || ""}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{
                                                        width: { xs: '140px', sm: '160px', md: '180px' },
                                                        flexShrink: 0,
                                                        '& .MuiInputBase-input[type="date"]': {
                                                            paddingRight: '8px',
                                                            paddingLeft: '14px',
                                                            '&::-webkit-calendar-picker-indicator': {
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                marginLeft: '0px',
                                                                marginRight: '4px',
                                                                opacity: 0.7,
                                                                position: 'relative',
                                                                '&:hover': {
                                                                    opacity: 1,
                                                                },
                                                            },
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            paddingRight: '8px',
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
                                                        width: { xs: '140px', sm: '160px', md: '180px' },
                                                        flexShrink: 0,
                                                        '& .MuiInputBase-input[type="date"]': {
                                                            paddingRight: '8px',
                                                            paddingLeft: '14px',
                                                            '&::-webkit-calendar-picker-indicator': {
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                marginLeft: '0px',
                                                                marginRight: '4px',
                                                                opacity: 0.7,
                                                                position: 'relative',
                                                                '&:hover': {
                                                                    opacity: 1,
                                                                },
                                                            },
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            paddingRight: '8px',
                                                        },
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={handleApplyFilters}
                                                    sx={{
                                                        borderRadius: "8px",
                                                        textTransform: "none",
                                                        backgroundColor: "var(--primary-color, #1976d2)",
                                                        color: "#fff",
                                                        height: 40,
                                                        px: 2,
                                                        flexShrink: 0,
                                                        "&:hover": { backgroundColor: "var(--primary-color, #1976d2)", opacity: 0.9 },
                                                    }}
                                                >
                                                    Apply Filters
                                                </Button>
                                            </Box>
                                            {/* Bottom Line: All Action Buttons */}
                                            <div className="modern-toolbar d-flex align-items-center flex-wrap" style={{ gap: '8px' }}>
                                                {/* Inactive / Show All Users */}
                                                <Button
                                                    className="modern-toolbar-btn"
                                                    variant="contained"
                                                    size="small"
                                                    onClick={showInactive ? handleShowAllUsers : handleManageSelected}
                                                >
                                                    {showInactive ? "Show All Users" : "Inactive Users"}
                                                </Button>
                                                {/* Send Gift */}
                                                <Button
                                                    className="modern-toolbar-btn"
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={handleCouponClick}
                                                    disabled={selectedRows.length === 0}
                                                >
                                                    Send Gift Amount
                                                </Button>
                                                {/* Success Recharge */}
                                                {selectedRows.length === 1 && (
                                                    <Button
                                                        className="modern-toolbar-btn"
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={handleRechargeClick}
                                                    >
                                                        Success Recharge
                                                    </Button>
                                                )}
                                                {/* Export */}
                                                <Button
                                                    className="modern-toolbar-btn"
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<BsDownload />}
                                                    onClick={handleExport}
                                                    disabled={isExporting}
                                                >
                                                    {isExporting ? "Exporting..." : "Export"}
                                                </Button>
                                                {/* Upload CSV */}
                                                <Button
                                                    className="modern-toolbar-btn"
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    onClick={handleDownloadCSV}
                                                    disabled={isDownloadingCSV}
                                                >
                                                    {isDownloadingCSV ? "Downloading..." : "Download CSV"}
                                                </Button>
                                                {/* Reset */}
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleResetFilter}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        borderColor: 'var(--primary-color, #1976d2)',
                                                        color: 'var(--primary-color, #1976d2)',
                                                        height: 40,
                                                        px: 2,
                                                        '&:hover': { borderColor: 'var(--primary-color, #1976d2)', backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        </Box>

                                        <DataGrid
                                            rows={currentGridRows}
                                            columns={columns}
                                            getRowId={(row) => row.id}
                                            autoHeight
                                            loading={showInactive ? inactiveUsersLoading : loading}
                                            checkboxSelection
                                            rowSelectionModel={selectedRows}
                                            onRowSelectionModelChange={(newSelectionModel) => setSelectedRows(newSelectionModel)}
                                            keepNonExistentRowsSelected
                                            paginationMode="server"
                                            hideFooterPagination
                                            columnVisibilityModel={columnVisibilityModel}
                                            onColumnVisibilityModelChange={setColumnVisibilityModel}
                                            disableRowSelectionOnClick
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: 'var(--border-color)',
                                                '& .MuiDataGrid-columnHeaders': {
                                                    backgroundColor: 'var(--color-200)',
                                                    borderBottom: '1px solid var(--border-color)'
                                                },
                                                '& .MuiDataGrid-row': { minHeight: 44 },
                                                '& .MuiDataGrid-cell': { borderColor: 'var(--border-color)', fontSize: '13px' },
                                                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, fontSize: '12px' },
                                                '& .MuiDataGrid-footerContainer': {
                                                    display: 'none',
                                                },
                                            }}
                                        />
                                        <TablePagination
                                            component="div"
                                            count={showInactive ? inactiveRowCount : (paginationInfo?.totalDocs || 0)}
                                            page={paginationModel.page}
                                            onPageChange={handleChangePage}
                                            rowsPerPage={paginationModel.pageSize}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            rowsPerPageOptions={[10, 25, 50]}
                                            labelRowsPerPage="Rows per page:"
                                            sx={{
                                                borderTop: '1px solid var(--border-color)',
                                                '& .MuiTablePagination-toolbar': {
                                                    padding: '12px 20px',
                                                },
                                            }}
                                        />
                                    </Box>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog open={couponOpen} onClose={handleCouponClose} fullWidth maxWidth="sm" >
                    <DialogTitle>Send Coupon</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Enter coupon details for {selectedRows.length} selected user(s).
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Amount (₹)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={couponValue}
                            onChange={(e) => setCouponValue(e.target.value)}
                            error={
                                submitAttemptedCoupon &&
                                (!couponValue.trim() ||
                                    Number(couponValue) < 1 ||
                                    Number(couponValue) > 9999999)
                            }
                            helperText={
                                submitAttemptedCoupon && !couponValue.trim()
                                    ? "Amount is required"
                                    : submitAttemptedCoupon && Number(couponValue) < 1
                                        ? "Minimum amount should be ₹1"
                                        : submitAttemptedCoupon && Number(couponValue) > 9999999
                                            ? "Amount cannot exceed 7 digits (₹9,999,999)"
                                            : ""
                            }
                            inputProps={{
                                min: 1,
                                max: 9999999,
                            }}
                        />
                        <TextField margin="dense" label="Subject" fullWidth variant="outlined" value={couponSubject}
                            onChange={(e) => setCouponSubject(e.target.value)} error={submitAttemptedCoupon && !couponSubject.trim()}
                            helperText={submitAttemptedCoupon && !couponSubject.trim() ? 'Subject is required' : ''} />
                        <TextField margin="dense" label="Message" fullWidth multiline rows={4} variant="outlined" value={couponMessage}
                            onChange={(e) => setCouponMessage(e.target.value)} error={submitAttemptedCoupon && !couponMessage.trim()}
                            helperText={submitAttemptedCoupon && !couponMessage.trim() ? 'Message is required' : ''} />
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <Button onClick={handleCouponClose}>Cancel</Button>
                        {isSend ?
                            <Button variant="contained" color="primary" disabled>Sending...</Button>
                            : <Button onClick={handleCouponSend} variant="contained" color="primary">Send</Button>
                        }
                    </DialogActions>
                </Dialog>

                <Dialog open={rechargeOpen} onClose={handleRechargeClose} fullWidth maxWidth="sm" >
                    <DialogTitle>Success Recharge</DialogTitle>
                    <DialogContent>
                        {selectedRows.length === 1 && baseDataSet && (
                            <>
                                <DialogContentText sx={{ mb: 2 }}>
                                    {(() => {
                                        const selectedUser = baseDataSet.find(user => user._id === selectedRows[0]);
                                        return selectedUser ? `User: ${selectedUser.fullName || 'N/A'} | Mobile: ${selectedUser.mobileNumber || 'N/A'}` : 'User not found';
                                    })()}
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Amount (₹)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={rechargeValue}
                                    onChange={(e) => setRechargeValue(e.target.value)}
                                    error={
                                        submitAttemptedRecharge &&
                                        (!rechargeValue.trim() ||
                                            Number(rechargeValue) < 1 ||
                                            Number(rechargeValue) > 9999999)
                                    }
                                    helperText={
                                        submitAttemptedRecharge && !rechargeValue.trim()
                                            ? "Amount is required"
                                            : submitAttemptedRecharge && Number(rechargeValue) < 1
                                                ? "Minimum amount should be ₹1"
                                                : submitAttemptedRecharge && Number(rechargeValue) > 9999999
                                                    ? "Amount cannot exceed 7 digits (₹9,999,999)"
                                                    : ""
                                    }
                                    inputProps={{
                                        min: 1,
                                        max: 9999999,
                                    }}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <Button onClick={handleRechargeClose}>Cancel</Button>
                        {isSendRecharge ?
                            <Button variant="contained" color="success" disabled>Processing...</Button>
                            : <Button onClick={handleRechargeSend} variant="contained" color="success">Process Recharge</Button>
                        }
                    </DialogActions>
                </Dialog>

                <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
                    <DialogTitle>{"Delete Confirmation"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this user record? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Confirm Delete</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default UsersList;