import React, { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  IconButton,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayoutDetails } from "../../Redux/Reducers/PayoutReducer";
import PageHeader1 from "../../components/common/PageHeader1";
import { handleUnauthorized } from "../../TokenAuth/auth";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from "../../utils/dateUtils";

const PayoutDetails = () => {
  const dispatch = useDispatch();

  // --- REDUX STATE ---
  const payoutDataList = useSelector((state) => state?.PayoutReducer?.payoutDetails || []);
  const { status, error, paginationDetail = {}, summary = {} } = useSelector((state) => state.PayoutReducer);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // --- COMPONENT STATE ---
  // State for the main page filter
  const [startDate, setStartDate] = useState(todayDate);
  const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied

  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // State for dialogs and loading indicators
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Search Handler - Only applies search query on button click (no dates)
  const handleSearch = () => {
    // If search is empty, reset search
    if (!searchQuery.trim()) {
      setAppliedSearchQuery("");
      setLastAction(null);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
      return;
    }
    // Set applied search query and mark lastAction as "search"
    setAppliedSearchQuery(searchQuery.trim());
    setLastAction("search");
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // Apply Date Filters Handler - Only applies date filters (no search)
  const handleApplyFilters = () => {
    // Ensure we're using the current input values, not applied values
    const newStartDate = startDate || todayDate;
    const newEndDate = endDate || todayDate;
    setAppliedStartDate(newStartDate);
    setAppliedEndDate(newEndDate);
    setLastAction("date");
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // --- DATA FETCHING & EFFECTS ---
  // Fetch data when filters, pagination, or applied search change
  useEffect(() => {
    // CRITICAL: When search is active, send search query with page=1 and limit=1000000000000, NO dates
    if (lastAction === "search") {
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        dispatch(
          fetchPayoutDetails({
            page: 1,
            limit: 1000000000000,
            fromDate: "",
            toDate: "",
            search: appliedSearchQuery,
          })
        );
      } else {
        // If search is empty, reset and show all data with date filters
        setLastAction(null);
      }
      return; // Exit early, don't send dates
    }

    // For date filters or initial load, send page, limit, and dates
    const page = paginationModel.page + 1;
    let limit = Number(paginationModel.pageSize);
    if (isNaN(limit)) {
      limit = 10;
    }

    // Send dates directly without UTC conversion (backend expects IST dates)
    dispatch(
      fetchPayoutDetails({
        page: page,
        limit: limit,
        fromDate: appliedStartDate || "",
        toDate: appliedEndDate || "",
        search: "",
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, appliedStartDate, appliedEndDate, appliedSearchQuery, lastAction]);

  // Show toast for fetch errors
  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(`Error: ${error}`);
    }
  }, [status, error]);

  // --- EVENT HANDLERS ---
  // Reset filters and fetch all data
  const handleResetFilter = () => {
    setStartDate(todayDate);
    setEndDate(todayDate);
    setAppliedStartDate(todayDate);
    setAppliedEndDate(todayDate);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setLastAction(null);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) =>
    setPaginationModel((prev) => ({ ...prev, page: newPage }));

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newSize = parseInt(value, 10);
    setPaginationModel({ page: 0, pageSize: newSize });
  };

  // --- DATA & COLUMNS for DataGrid ---
  // Transform rows with useMemo (server-side filtering and pagination)
  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return payoutDataList.map((item, index) => ({
      ...item,
      id: item.astrologerId || index,
      sono: index + 1 + paginationModel.page * pageSize,
      earningAmount: item?.earningAmount || 0,
      tdsAmount: item?.tdsAmount || 0,
      amountAfterTds: item?.amountAfterTds || 0,
      adminProfit: item?.adminProfit || 0,
      disbursedAmount: item?.disbursedAmount || 0,
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    }));
  }, [payoutDataList, paginationModel]);

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
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <IconButton
            size="small"
            component={Link}
            to={`/payout-reportsView/${row.astrologerId}`}
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
        </Box>
      ),
    },
    { field: "astrologerId", headerName: "Astrologer ID", width: 150 },
    { field: "fullName", headerName: "Astrologer Name", width: 200 },
    {
      field: "earningAmount",
      headerName: "Astro Total Amount",
      width: 180,
      type: "number",
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
    {
      field: "tdsAmount",
      headerName: "TDS Amount",
      width: 150,
      type: "number",
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
    {
      field: "amountAfterTds",
      headerName: "Astro Amount After TDS",
      width: 200,
      type: "number",
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
    {
      field: "adminProfit",
      headerName: "Admin Total Profit",
      width: 180,
      type: "number",
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
    {
      field: "disbursedAmount",
      headerName: "Disbursed Amount",
      width: 170,
      type: "number",
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
  ];

  /**
   * Export logic - fetches all data from API with current filters
   */
  const handleExportSubmit = async () => {
    setIsExporting(true);

    // Helper to properly format data for CSV (handles commas, quotes)
    const escapeCsvCell = (cell) => {
      if (cell === null || cell === undefined) return '';
      const cellString = String(cell);
      if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
        return `"${cellString.replace(/"/g, '""')}"`;
      }
      return cellString;
    };

    try {
      const token = localStorage.getItem('User-admin-token');
      if (!token) {
        toast.error("Authorization token not found");
        setIsExporting(false);
        return;
      }

      // Fetch all data from API with current filters
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/payoutSummary`,
        {
          params: {
            fromDate: appliedStartDate || "",
            toDate: appliedEndDate || "",
            search: appliedSearchQuery || "",
          },
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
      }

      const allData = response.data?.data || [];

      if (!Array.isArray(allData) || allData.length === 0) {
        setIsExporting(false);
        setExportDialogOpen(false);
        return;
      }

      // Helper function to format date as DD:MM:YYYY
      const formatDateForExport = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';

          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();

          return `${day}:${month}:${year}`;
        } catch (error) {
          return '';
        }
      };

      // Format start and end dates for export
      const formatStartDate = () => {
        if (!appliedStartDate) return '';
        try {
          // Convert YYYY-MM-DD to DD/MM/YYYY format (using / instead of : to avoid Excel time interpretation)
          if (typeof appliedStartDate === 'string' && appliedStartDate.includes('-')) {
            const [year, month, day] = appliedStartDate.split('-');
            if (year && month && day) {
              return `${day}/${month}/${year}`;
            }
          }
          // If not in expected format, try to parse as date
          const date = new Date(appliedStartDate);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          }
          return '';
        } catch (error) {
          return '';
        }
      };

      const formatEndDate = () => {
        if (!appliedEndDate) return '';
        try {
          // Convert YYYY-MM-DD to DD/MM/YYYY format (using / instead of : to avoid Excel time interpretation)
          if (typeof appliedEndDate === 'string' && appliedEndDate.includes('-')) {
            const [year, month, day] = appliedEndDate.split('-');
            if (year && month && day) {
              return `${day}/${month}/${year}`;
            }
          }
          // If not in expected format, try to parse as date
          const date = new Date(appliedEndDate);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          }
          return '';
        } catch (error) {
          return '';
        }
      };

      // Get the columns to export (we'll skip the "Actions" and "sono" columns)
      const exportableColumns = columns.filter(col => col.field !== 'actions' && col.field !== 'sono');

      // Create the header row from column definitions, adding "From" and "To" at the end
      const headerRow = ['S.No', ...exportableColumns.map(col => escapeCsvCell(col.headerName)), 'From', 'To'].join(',');

      // Create data rows from API data
      const dataRows = allData.map((row, index) => {
        const sono = index + 1;
        const rowData = [
          sono,
          ...exportableColumns.map(col => {
            let value = row[col.field];
            // Format dates using UTC formatter
            if (col.field === 'createdAt' || col.field === 'updatedAt') {
              value = formatUTCDateForExport(value);
            }
            // Format currency values
            else if (col.valueFormatter && typeof value === 'number') {
              value = value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return escapeCsvCell(value);
          }),
          escapeCsvCell(formatStartDate()), // From date
          escapeCsvCell(formatEndDate())    // To date
        ];
        return rowData.join(',');
      });

      // Combine header and data into a single CSV string
      const csvContent = [headerRow, ...dataRows].join('\n');

      // Create a Blob and trigger the browser download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      link.setAttribute('href', blobUrl);

      // Create a dynamic filename
      const fileName = (startDate && endDate)
        ? `payout-details-${startDate}-to-${endDate}.csv`
        : `payout-details-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success('Export successful! Check your downloads.');
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || `Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Import logic remains unchanged
  const handleImportSubmit = async () => {
    // ... (import logic is the same as before)
    if (!importFile) {
      toast.error("Please select an Excel file to import.");
      return;
    }
    const token = localStorage.getItem('User-admin-token');
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }
    setIsImporting(true);
    const baseUrl = process.env.REACT_APP_BASEURL;
    const url = `${baseUrl}/admin/uploadPayoutExcel`;
    const formData = new FormData();
    formData.append('file', importFile);

    const importPromise = fetch(url, { method: 'POST', headers: { 'Authorization': token }, body: formData })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'File upload failed.');
        return result;
      });

    toast.promise(importPromise, {
      loading: 'Uploading and processing file...',
      success: 'Import successful! Refreshing data...',
      error: (err) => `Import failed: ${err.message}`,
    });

    try {
      await importPromise;
      dispatch(fetchPayoutDetails()); // Refresh grid data
      setImportDialogOpen(false);
      setImportFile(null);
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };


  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <Toaster />

        <PageHeader1 pagetitle="Payout Details" />

        {/* Summary Card */}
        {summary && Object.keys(summary).length > 0 && (
          <Box
            sx={{
              mb: 1.5,
              p: 1,
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                mb: 0.75,
                fontWeight: 600,
                color: '#333',
                fontSize: '14px',
              }}
            >
              Summary
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 1,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '10px',
                    mb: 0.25,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Total Amount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: 1.2,
                  }}
                >
                  ₹{summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '10px',
                    mb: 0.25,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Earning Amount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: 1.2,
                  }}
                >
                  ₹{summary.earningAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '10px',
                    mb: 0.25,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Admin Profit
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: 1.2,
                  }}
                >
                  ₹{summary.adminProfit?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '10px',
                    mb: 0.25,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  TDS Amount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: 1.2,
                  }}
                >
                  ₹{summary.tdsAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '10px',
                    mb: 0.25,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Amount After TDS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: 1.2,
                  }}
                >
                  ₹{summary.amountAfterTds?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

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
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              label="Search..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { handleSearch(); } }}
              sx={{ width: 280 }}
              placeholder="Search by astrologer name"
            />
            <IconButton
              onClick={handleSearch}
              sx={{
                backgroundColor: "var(--primary-color, #1976d2)",
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: "8px",
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
              onChange={(e) => {
                const newValue = e.target.value;
                setStartDate(newValue);
              }}
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
              onChange={(e) => {
                const newValue = e.target.value;
                setEndDate(newValue);
              }}
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
                "&:hover": { backgroundColor: "var(--primary-color, #1976d2)", opacity: 0.9 },
              }}
            >
              Apply Filters
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="outlined"
              onClick={handleResetFilter}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                borderColor: "var(--primary-color, #1976d2)",
                color: "var(--primary-color, #1976d2)",
                height: 40,
                px: 2,
                "&:hover": {
                  borderColor: "var(--primary-color, #1976d2)",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={() => setExportDialogOpen(true)}
              sx={{
                backgroundColor: 'var(--primary-color, #1976d2)',
                color: '#fff',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px',
                height: 40,
                px: 2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'var(--primary-color, #1976d2)',
                  boxShadow: 'none',
                },
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              onClick={() => setImportDialogOpen(true)}
              sx={{
                borderColor: 'var(--primary-color, #1976d2)',
                color: 'var(--primary-color, #1976d2)',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px',
                height: 40,
                px: 2,
                '&:hover': {
                  borderColor: 'var(--primary-color, #1976d2)',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Import
            </Button>
          </Box>
        </Box>

        {/* DataGrid Card */}
        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
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
                    count={paginationDetail?.totalRecords || 0}
                    page={paginationModel.page}
                    onPageChange={handleChangePage}
                    rowsPerPage={paginationModel.pageSize}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Rows per page:"
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
                    rows={rows}
                    columns={columns}
                    loading={status === 'loading'}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
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
        </div>
      </div>

      {/* --- DIALOGS --- */}
      {/* SIMPLIFIED Export Dialog - just a confirmation */}
      <Dialog open={exportDialogOpen} onClose={() => !isExporting && setExportDialogOpen(false)}>
        <DialogTitle>Export Payout Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will export the currently displayed data (including any active filters) as a CSV file.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={isExporting}>Cancel</Button>
          <Button
            onClick={handleExportSubmit}
            variant="contained"
            disabled={isExporting}
            sx={{
              backgroundColor: 'var(--primary-color, #1976d2)',
              '&:hover': {
                backgroundColor: 'var(--primary-color, #1976d2)',
              },
            }}
          >
            {isExporting ? "Exporting..." : "Confirm & Export"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => !isImporting && setImportDialogOpen(false)}>
        <DialogTitle>Import Payout Excel</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Select an Excel file (.xlsx, .xls) to upload.
          </DialogContentText>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: 'var(--primary-color, #1976d2)',
              textTransform: 'none',
              borderRadius: '8px',
              mt: 2,
              '&:hover': {
                backgroundColor: 'var(--primary-color, #1976d2)',
              },
            }}
          >
            Choose File
            <input type="file" hidden accept=".xlsx, .xls" onChange={(e) => setImportFile(e.target.files[0])} />
          </Button>
          {importFile && (
            <Typography sx={{ mt: 2, ml: 1, fontSize: '14px', color: 'text.secondary' }}>
              Selected: {importFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} disabled={isImporting}>Cancel</Button>
          <Button
            onClick={handleImportSubmit}
            variant="contained"
            disabled={!importFile || isImporting}
            sx={{
              backgroundColor: 'var(--primary-color, #1976d2)',
              '&:hover': {
                backgroundColor: 'var(--primary-color, #1976d2)',
              },
            }}
          >
            {isImporting ? "Importing..." : "Import & Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PayoutDetails;