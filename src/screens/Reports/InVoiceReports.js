import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import PageHeader1 from "../../components/common/PageHeader1";
import { useDispatch, useSelector } from "react-redux";
import { fetchRechargeReport } from "../../Redux/Reducers/CallAndChatReducer";
import { handleUnauthorized } from "../../TokenAuth/auth";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from "../../utils/dateUtils";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvoiceReportList = () => {
  const dispatch = useDispatch();
  const {
    data: rowsData = [],
    paginationDetail = {},
    status = "idle",
  } = useSelector((state) => state?.CallAndChatReducer || {});

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("userName"); // "userName", "mobileNumber"
  const [appliedSearchType, setAppliedSearchType] = useState("userName");
  const [startDate, setStartDate] = useState(todayDate);
  const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
  const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);

  // Search Handler - Only applies search query (no dates)
  const handleSearch = () => {
    // If search is empty, do nothing - don't trigger API call
    if (!searchQuery.trim()) {
      setAppliedSearchQuery("");
      setLastAction(null);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
      return;
    }
    // Set search and mark lastAction as "search" to prevent dates
    const trimmedQuery = searchQuery.trim();
    setAppliedSearchQuery(trimmedQuery);
    setAppliedSearchType(searchType);
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

  // Auto-reset search when input becomes empty
  useEffect(() => {
    if (!searchQuery.trim() && appliedSearchQuery) {
      setAppliedSearchQuery("");
      setLastAction(null);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
    }
  }, [searchQuery]);

  useEffect(() => {
    // CRITICAL: When search is active, send search query with page and limit=10000, NO dates
    if (lastAction === "search") {
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        const params = {
          page: 1,
          limit: 10000,
          search: appliedSearchQuery,
          searchType: appliedSearchType,
        };
        // Redux action will map searchType to backend parameter names
        dispatch(fetchRechargeReport(params));
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
      limit = paginationDetail?.totalRecords || 10000;
    }

    const params = {
      page: page,
      limit: limit,
    };

    // Only send dates if last action was date filter or initial load
    if (lastAction === "date" || lastAction === null) {
      params.startDate = convertISTToUTCForAPI(appliedStartDate, 'start');
      params.endDate = convertISTToUTCForAPI(appliedEndDate, 'end');
    }

    dispatch(fetchRechargeReport(params));
  }, [dispatch, paginationModel.page, paginationModel.pageSize, appliedStartDate, appliedEndDate, appliedSearchQuery, appliedSearchType, lastAction]);

  // Transform rows - no client-side filtering, server handles it
  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return rowsData
      ?.map((item, index) => ({
        ...item,
        id: item._id || item.id || index,
        sono: index + 1 + paginationModel.page * pageSize,
        createdAt: item.createdAt || null, // Preserve as string
      }));
  }, [rowsData, paginationModel]);

  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } else {

      toast.warn("PDF URL is not available for this record.");
    }
  };

  const handleCreditNoteClick = (invoiceNumber) => {
    setInvoiceToCancel(invoiceNumber);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setInvoiceToCancel(null);
  };

  const handleConfirmCreditNote = async () => {
    if (!invoiceToCancel) return;

    const token = localStorage.getItem("User-admin-token");
    const apiUrl = `${process.env.REACT_APP_BASEURL}/admin/creditNote`;

    if (!token) {

      toast.error("Authentication token not found. Please log in again.");
      handleCloseConfirm();
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelledInvoice: invoiceToCancel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create credit note.");
      }

      // Use toast for success
      toast.success("Credit note created successfully!");

    } catch (error) {
      console.error("Error creating credit note:", error);

      toast.error(`Error: ${error.message}`);
    } finally {
      handleCloseConfirm();
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
          <Tooltip title="View/Open PDF">
            <IconButton
              size="small"
              onClick={() => handleViewPdf(row.invoicePdfUrl)}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <i className="icofont-eye" style={{ fontSize: '18px' }}></i>
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Credit Note">
            <IconButton
              size="small"
              onClick={() => handleCreditNoteClick(row.invoiceNumber)}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <i className="icofont-file-document" style={{ fontSize: '18px' }}></i>
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    { field: "fullName", headerName: "User Name", width: 180 },
    { field: "mobileNumber", headerName: "Mobile No.", width: 150 },
    { field: "invoiceNumber", headerName: "Invoice No.", width: 220 },
    { field: "segment", headerName: "Segment", width: 130 },
    {
      field: "rechargeAmount",
      headerName: "Basic Amount",
      width: 140,
      type: 'number',
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    { field: "state", headerName: "State", width: 120 },
    {
      field: "sgst",
      headerName: "SGST",
      width: 120,
      type: 'number',
      valueFormatter: (value) => value && value !== "-" ? `₹${value.toLocaleString('en-IN')}` : '-',
    },
    {
      field: "cgst",
      headerName: "CGST",
      width: 120,
      type: 'number',
      valueFormatter: (value) => value && value !== "-" ? `₹${value.toLocaleString('en-IN')}` : '-',
    },
    {
      field: "igst",
      headerName: "IGST",
      width: 120,
      type: 'number',
      valueFormatter: (value) => value && value !== "-" ? `₹${value.toLocaleString('en-IN')}` : '-',
    },
    {
      field: "invoiceAmount",
      headerName: "Invoice Amount",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueFormatter: formatUTCDateForDataGrid,
    },
  ];

  // Pagination Handlers
  const handleChangePage = (event, newPage) =>
    setPaginationModel((prev) => ({ ...prev, page: newPage }));

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newSize = parseInt(value, 10);
    setPaginationModel({ page: 0, pageSize: newSize });
  };

  // Reset Filter Handler
  const handleResetFilter = () => {
    setStartDate(todayDate);
    setEndDate(todayDate);
    setAppliedStartDate(todayDate);
    setAppliedEndDate(todayDate);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSearchType("userName");
    setAppliedSearchType("userName");
    setLastAction(null);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // Export to Excel function - fetches all data from API
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("User-admin-token");

      // Build query parameters for export - include search if present
      const params = new URLSearchParams();
      if (appliedStartDate) {
        params.append('startDate', convertISTToUTCForAPI(appliedStartDate, 'start'));
      }
      if (appliedEndDate) {
        params.append('endDate', convertISTToUTCForAPI(appliedEndDate, 'end'));
      }
      // Include search parameters in export if search was applied - map to direct field names
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        if (appliedSearchType === "userName") {
          params.append('userName', appliedSearchQuery);
        } else if (appliedSearchType === "mobileNumber") {
          params.append('mobileNumber', appliedSearchQuery);
        }
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/rechargeReportExport?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error("Unauthorized: Please login again");
        }
        throw new Error("Failed to export data");
      }

      const result = await response.json();
      const exportRows = Array.isArray(result) ? result : result?.data || [];

      if (!Array.isArray(exportRows) || exportRows.length === 0) {
        toast.warn("No data available to export");
        setIsExporting(false);
        return;
      }

      const exportData = exportRows.map((row, index) => ({
        "S.No.": index + 1,
        "User Name": row.fullName || "",
        "Mobile Number": row.mobileNumber || "",
        "Invoice Number": row.invoiceNumber || "",
        Segment: row.segment || "",
        "Basic Amount": row.rechargeAmount || 0,
        State: row.state || "",
        SGST: row.sgst && row.sgst !== "-" ? row.sgst : "-",
        CGST: row.cgst && row.cgst !== "-" ? row.cgst : "-",
        IGST: row.igst && row.igst !== "-" ? row.igst : "-",
        "Invoice Amount": row.invoiceAmount || 0,
        "Created At": formatUTCDateForExport(row.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "InvoiceReport");
      XLSX.writeFile(workbook, `Invoice_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Export successful!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="body d-flex">
      {/* Add ToastContainer here. It's invisible but needed to render toasts. */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container-xxl">
        <PageHeader1 pagetitle="Invoice Report" />

        {/* Search and Export Toolbar */}
        <Box sx={{ width: '100%', mb: 2 }}>
          {/* Top Line: Search Items + Date Filters */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
              <InputLabel>Search By</InputLabel>
              <Select
                value={searchType}
                label="Search By"
                onChange={(e) => setSearchType(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="userName">User Name</MenuItem>
                <MenuItem value="mobileNumber">Mobile Number</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder={
                searchType === "userName" ? "Search by user name..." :
                  "Search by mobile number..."
              }
              variant="outlined"
              size="small"
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
                  position: 'relative',
                  '&::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '0px',
                    marginRight: '4px',
                    opacity: 0.7,
                    position: 'absolute',
                    right: 0,
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
                  position: 'relative',
                  '&::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '0px',
                    marginRight: '4px',
                    opacity: 0.7,
                    position: 'absolute',
                    right: 0,
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
          {/* Bottom Line: Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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
                '&:hover': { borderColor: 'var(--primary-color, #1976d2)', backgroundColor: 'rgba(25, 118, 210, 0.04)' },
                flexShrink: 0
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={exportToExcel}
              disabled={isExporting}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                height: 40,
                px: 2,
                backgroundColor: "var(--primary-color, #1976d2)",
                color: "#fff",
                "&:hover": { backgroundColor: "var(--primary-color, #1976d2)", opacity: 0.9 },
                "&:disabled": { backgroundColor: "var(--primary-color, #1976d2)", opacity: 0.6 },
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

        <div className="row g-0 mb-3">
          <div className="col-12">
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
                    getRowId={(row) => row.id}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationMode="server"
                    loading={status === "loading"}
                    disableSelectionOnClick
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

      <Dialog open={isConfirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to create a credit note for invoice{" "}
            <strong>{invoiceToCancel}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleConfirmCreditNote} color="error" variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InvoiceReportList;