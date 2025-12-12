import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import PageHeader1 from '../../components/common/PageHeader1';
import { formatUTCDateForExport, convertISTToUTCForAPI } from '../../utils/dateUtils';
// Mixpanel tracking removed

function BookingList() {
  const [rows, setRows] = useState([]);
  const [selectedBookingType, setSelectedBookingType] = useState('All');
  const [appliedBookingType, setAppliedBookingType] = useState('All');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState('All');
  const [appliedBookingStatus, setAppliedBookingStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('userName'); // "userName", "astrologerName"
  const [appliedSearchType, setAppliedSearchType] = useState('userName');
  const [startDate, setStartDate] = useState(todayDate);
  const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
  const [isExporting, setIsExporting] = useState(false);
  const [paginationDetail, setPaginationDetail] = useState({});
  const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied
  const token = localStorage.getItem('User-admin-token');

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });


  const statusOptions = [
    'accepted', 'rejected', 'cancelled', 'pending',
    'ongoing', 'completed', 'missed', 'disConnected'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // CRITICAL: When search is active, send search query with page and limit=10000, NO dates, NO filters
        if (lastAction === "search") {
          if (appliedSearchQuery && appliedSearchQuery.trim()) {
            const params = new URLSearchParams({
              page: '1',
              limit: '10000',
            });
            // Map searchType to backend parameter names
            if (appliedSearchType === "userName") {
              params.append('userName', appliedSearchQuery);
            } else if (appliedSearchType === "astrologerName") {
              params.append('astrologerName', appliedSearchQuery);
            } else {
              params.append('search', appliedSearchQuery);
            }

            const requestUrl = `${process.env.REACT_APP_BASEURL}/admin/booking?${params.toString()}`;
            const response = await axios.get(requestUrl, {
              headers: { Authorization: token },
            });

            const bookings = response?.data?.data || [];
            const pagination = response?.data?.paginationDetail || {};

            const data = bookings.map((item, index) => {
              const formatCamelCase = (str) => {
                if (!str) return '';
                return str
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/^./, (char) => char.toUpperCase());
              };

              return {
                sono: index + 1,
                orderId: item?.orderId,
                userName: item?.userName,
                bookingId: item?.bookingId,
                astroName: item?.astroName,
                bookingTypeRaw: item?.bookingType,
                bookingType: formatCamelCase(item?.bookingType),
                bookingStatus: item?.bookingStatus,
                totalDuration:
                  Number(item?.actualDeduction || 0) +
                  Number(item?.promotionalDeduction || 0),
                actualDeduction:
                  item?.actualDeduction != null
                    ? `${Number(item.actualDeduction).toFixed(2)}`
                    : 'N/A',
                promoDeduction:
                  item?.promotionalDeduction != null
                    ? `${Number(item.promotionalDeduction).toFixed(2)}`
                    : 'N/A',
                createdAt: formatUTCDateForExport(item?.createdAt),
                duration: item?.totalDuration != null ? Number(item.totalDuration) : 0,
              };
            });

            setRows(data);
            setPaginationDetail(pagination);
            setLoading(false);
            return; // Exit early, don't send page/limit/dates/filters
          }
        }

        // For date filters or initial load, send page, limit, dates, and filters
        const apiPage = paginationModel.page + 1;
        let limit = Number(paginationModel.pageSize);
        if (isNaN(limit)) {
          limit = 10;
        }

        const params = new URLSearchParams({
          page: apiPage.toString(),
          limit: limit.toString(),
        });

        if (appliedBookingType !== 'All') {
          params.append('type', appliedBookingType);
        }

        if (appliedBookingStatus !== 'All') {
          params.append('status', appliedBookingStatus);
        }

        // Only send dates if last action was date filter or initial load
        if (lastAction === "date" || lastAction === null) {
          if (appliedStartDate) {
            params.append('startDate', convertISTToUTCForAPI(appliedStartDate, 'start'));
          }
          if (appliedEndDate) {
            params.append('endDate', convertISTToUTCForAPI(appliedEndDate, 'end'));
          }
        }

        const requestUrl = `${process.env.REACT_APP_BASEURL}/admin/booking?${params.toString()}`;
        const response = await axios.get(requestUrl, {
          headers: { Authorization: token },
        });

        const bookings = response?.data?.data || [];
        const pagination = response?.data?.paginationDetail || {};

        const data = bookings.map((item, index) => {
          const formatCamelCase = (str) => {
            if (!str) return '';
            return str
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/^./, (char) => char.toUpperCase());
          };

          return {
            sono: paginationModel.page * paginationModel.pageSize + index + 1,
            orderId: item?.orderId,
            userName: item?.userName,
            bookingId: item?.bookingId,
            astroName: item?.astroName,
            bookingTypeRaw: item?.bookingType,
            bookingType: formatCamelCase(item?.bookingType),
            bookingStatus: item?.bookingStatus,
            totalDuration:
              Number(item?.actualDeduction || 0) +
              Number(item?.promotionalDeduction || 0),
            actualDeduction:
              item?.actualDeduction != null
                ? `${Number(item.actualDeduction).toFixed(2)}`
                : 'N/A',
            promoDeduction:
              item?.promotionalDeduction != null
                ? `${Number(item.promotionalDeduction).toFixed(2)}`
                : 'N/A',
            createdAt: formatUTCDateForExport(item?.createdAt),
            duration: item?.totalDuration != null ? Number(item.totalDuration) : 0,
          };
        });

        setRows(data);
        setPaginationDetail(pagination);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRows([]);
        setPaginationDetail({});
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(false);
      setRows([]);
      setPaginationDetail({});
    }
  }, [paginationModel.page, paginationModel.pageSize, appliedBookingType, appliedBookingStatus, appliedSearchQuery, appliedSearchType, appliedStartDate, appliedEndDate, lastAction, token]);

  // Auto-reset search when input becomes empty
  useEffect(() => {
    if (!searchQuery.trim() && appliedSearchQuery) {
      setAppliedSearchQuery("");
      setAppliedSearchType(searchType);
      setLastAction(null);
      setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    }
  }, [searchQuery]);

  const handleChangePage = (event, newPage) => {
    setPaginationModel({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newPageSize = parseInt(value, 10);
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  // Search Handler - Only applies search query (no dates, no filters)
  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedSearchType(searchType);
    setLastAction("search");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Apply Date Filters Handler - Only applies date filters and booking type/status (no search)
  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedBookingType(selectedBookingType);
    setAppliedBookingStatus(selectedBookingStatus);
    setLastAction("date");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const isFilterActive = startDate !== todayDate || endDate !== todayDate || selectedBookingType !== 'All' || selectedBookingStatus !== 'All' || searchQuery || appliedSearchQuery;

  const handleResetFilter = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setSearchType('userName');
    setAppliedSearchType('userName');
    setStartDate(todayDate);
    setEndDate(todayDate);
    setAppliedStartDate(todayDate);
    setAppliedEndDate(todayDate);
    setSelectedBookingType('All');
    setAppliedBookingType('All');
    setSelectedBookingStatus('All');
    setAppliedBookingStatus('All');
    setLastAction(null);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      if (selectedBookingType !== 'All') {
        params.append('type', selectedBookingType);
      }

      if (selectedBookingStatus !== 'All') {
        params.append('status', selectedBookingStatus);
      }

      // Add search parameters if search query exists
      if (searchQuery && searchType) {
        // Map searchType to backend parameter names
        if (searchType === "userName") {
          params.append('userName', searchQuery);
        } else if (searchType === "astrologerName") {
          params.append('astrologerName', searchQuery);
        } else {
          params.append('search', searchQuery);
        }
      }

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/bookingExport?${params.toString()}`,
        {
          headers: { Authorization: token },
        }
      );

      const bookings = response?.data?.data || [];

      if (bookings.length === 0) {
        return;
      }

      const formatCamelCase = (str) => {
        if (!str) return '';
        return str
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/^./, (char) => char.toUpperCase());
      };

      const exportData = bookings.map((item, index) => ({
        'S.No': index + 1,
        'Order ID': item?.orderId || '',
        'User Name': item?.userName || '',
        'Astrologer Name': item?.astroName || '',
        'Booking Type': formatCamelCase(item?.bookingType) || '',
        'Booking Status': item?.bookingStatus || '',
        'Total Deduction': (Number(item?.actualDeduction || 0) + Number(item?.promotionalDeduction || 0)).toFixed(2),
        'Actual Deduction': item?.actualDeduction != null ? Number(item.actualDeduction).toFixed(2) : 'N/A',
        'Promotional Deduction': item?.promotionalDeduction != null ? Number(item.promotionalDeduction).toFixed(2) : 'N/A',
        'Total Duration': item?.totalDuration != null ? Number(item.totalDuration) : 0,
        'Created At': formatUTCDateForExport(item?.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

      const columnWidths = [
        { wch: 8 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 25 },
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.writeFile(workbook, 'bookings_export.xlsx');
      toast.success('Bookings exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASEURL}/admin/booking/${id}`, {
        headers: { Authorization: token },
      });
      const { page, pageSize } = paginationModel;
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: pageSize.toString(),
      });
      if (selectedBookingType !== 'All') params.append('type', selectedBookingType);
      if (selectedBookingStatus !== 'All') params.append('status', selectedBookingStatus);
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/booking?${params.toString()}`,
        { headers: { Authorization: token } }
      );
      const bookings = response?.data?.data || [];
      const pagination = response?.data?.paginationDetail || {};
      const formatCamelCase = (str) => {
        if (!str) return '';
        return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());
      };
      const data = bookings.map((item, index) => ({
        sono: page * pageSize + index + 1,
        orderId: item?.orderId,
        userName: item?.userName,
        bookingId: item?.bookingId,
        astroName: item?.astroName,
        bookingTypeRaw: item?.bookingType,
        bookingType: formatCamelCase(item?.bookingType),
        bookingStatus: item?.bookingStatus,
        totalDuration: Number(item?.actualDeduction || 0) + Number(item?.promotionalDeduction || 0),
        actualDeduction: item?.actualDeduction != null ? `${Number(item.actualDeduction).toFixed(2)}` : 'N/A',
        promoDeduction: item?.promotionalDeduction != null ? `${Number(item.promotionalDeduction).toFixed(2)}` : 'N/A',
        createdAt: item?.createdAt ? new Date(item?.createdAt).toLocaleString() : '',
        duration: item?.totalDuration != null ? Number(item.totalDuration) : 0,
      }));
      setRows(data);
      setPaginationDetail(pagination);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleClickOpen = (userId) => {
    setSelectedUserId(userId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId(null);
  };

  const handleDelete = async () => {
    if (selectedUserId) {
      await deleteBooking(selectedUserId);
    }
    handleClose();
  };

  const filteredRows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return rows.map((item, index) => ({
      ...item,
      sono: paginationModel.page * pageSize + index + 1,
    }));
  }, [rows, paginationModel]);

  const columns = [
    {
      field: 'sono',
      headerName: 'S.NO',
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <IconButton
            size="small"
            component={Link}
            to={`/booking-details/${row.bookingId}`}
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
          {/* <IconButton 
            size="small"
            onClick={() => handleClickOpen(row.bookingId)} 
            title="Delete Booking"
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            <i className="icofont-ui-delete" style={{ fontSize: '18px' }}></i>
          </IconButton> */}
        </Box>
      ),
    },
    { field: 'orderId', headerName: 'Order ID', width: 170 },
    { field: 'userName', headerName: 'User Name', width: 200 },
    { field: 'astroName', headerName: 'Astrologer Name', width: 200 },
    { field: 'bookingType', headerName: 'Booking Type', width: 180 },
    { field: 'bookingStatus', headerName: 'Booking Status', width: 180 },
    { field: 'totalDuration', headerName: 'Total Deduction', width: 180 },
    { field: 'actualDeduction', headerName: 'Actual Deduction', width: 180 },
    { field: 'promoDeduction', headerName: 'Promotional Deduction', width: 200 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    { field: 'duration', headerName: 'Total Duration', width: 180 },

  ];

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Bookings List" />

        {/* Toolbar with Filters */}
        <div className="card mb-3" style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: 'none'
        }}>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            {/* First Row: All Inputs in Single Line */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchType}
                  label="Search By"
                  onChange={(e) => setSearchType(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--primary-color, #E7B242)',
                    },
                  }}
                >
                  <MenuItem value="userName">User Name</MenuItem>
                  <MenuItem value="astrologerName">Astrologer Name</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{
                  minWidth: '180px',
                  flexShrink: 0,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                placeholder={
                  searchType === "userName" ? "Search by user name..." :
                  "Search by astrologer name..."
                }
              />
              <IconButton
                onClick={handleSearch}
                sx={{
                  backgroundColor: "var(--primary-color, #E7B242)",
                  color: "#fff",
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "var(--primary-color, #E7B242)",
                    opacity: 0.9,
                  },
                }}
              >
                <SearchIcon />
              </IconButton>

              <TextField
                label="Start Date"
                type="date"
                variant="outlined"
                size="small"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 160,
                  flexShrink: 0,
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
                variant="outlined"
                size="small"
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 160,
                  flexShrink: 0,
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

              <FormControl size="small" sx={{
                minWidth: '160px',
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}>
                <InputLabel>Booking Type</InputLabel>
                <Select
                  value={selectedBookingType}
                  label="Booking Type"
                  onChange={(e) => setSelectedBookingType(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="chat">Chat</MenuItem>
                  <MenuItem value="call">Call</MenuItem>
                  <MenuItem value="videocall">Video Call</MenuItem>
                  <MenuItem value="physicalvisit">Physical Visit</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{
                minWidth: '160px',
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}>
                <InputLabel>Booking Status</InputLabel>
                <Select
                  value={selectedBookingStatus}
                  label="Booking Status"
                  onChange={(e) => setSelectedBookingStatus(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Second Row: Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "var(--primary-color, #E7B242)",
                  color: "#fff",
                  height: 40,
                  px: 2,
                  "&:hover": {
                    backgroundColor: "var(--primary-color, #E7B242)",
                    opacity: 0.9,
                  },
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilter}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: 'var(--primary-color, #E7B242)',
                  color: 'var(--primary-color, #E7B242)',
                  height: 40,
                  px: 2,
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
                  backgroundColor: 'var(--primary-color, #E7B242)',
                  height: 40,
                  px: 2,
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

        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div className="card-body" style={{ padding: 0 }}>
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
                    labelRowsPerPage="Rows per page:"
                    sx={{
                      borderTop: '1px solid #e9ecef',
                      '& .MuiTablePagination-toolbar': {
                        padding: '4px 20px',
                      },
                    }}
                  />
                </Box>
                <Box sx={{
                  // height: 600,
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
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row.bookingId}
                    loading={loading}
                    paginationMode="server"
                    hideFooterPagination
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) =>
                      setColumnVisibilityModel(newModel)
                    }
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
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this booking?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default BookingList;
