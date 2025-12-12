import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import PageHeader1 from "../../components/common/PageHeader1";
import { fetchCreditNotes } from "../../Redux/Reducers/CreditNoteReportReducer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleUnauthorized } from "../../TokenAuth/auth";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from "../../utils/dateUtils";
import SearchIcon from '@mui/icons-material/Search';

const CreditReports = () => {
  const dispatch = useDispatch();

  const {
    data: creditNotes = [],
    paginationDetail = { totalDocs: 0, page: 1, limit: 10 },
    status,
  } = useSelector((state) => state.CreditNoteReportReducer || {});

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
  const [startDate, setStartDate] = useState(todayDate);
  const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
  const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Sync MUI DataGrid pagination with backend
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // DataGrid starts at 0, backend starts at 1
    pageSize: 10,
  });

  // Search Handler - Only applies search query (no dates)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setAppliedSearchQuery("");
      setLastAction(null);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
      return;
    }
    setAppliedSearchQuery(searchQuery.trim());
    setLastAction("search");
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // Apply Date Filters Handler - Only applies date filters (no search)
  const handleApplyFilters = () => {
    setAppliedStartDate(startDate || todayDate);
    setAppliedEndDate(endDate || todayDate);
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
  }, [searchQuery, appliedSearchQuery]);

  // ✅ Fetch credit notes dynamically
  useEffect(() => {
    // CRITICAL: When search is active, send search query with page=1 and limit=10000, NO dates
    if (lastAction === "search") {
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        dispatch(
          fetchCreditNotes({
            page: 1,
            limit: 10000, // Set limit to 10000 for search
            search: appliedSearchQuery,
            startDate: "", // Explicitly empty dates for search
            endDate: "",   // Explicitly empty dates for search
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
      limit = paginationDetail?.totalDocs || 10000;
    }

    const params = {
      page: page,
      limit: limit,
    };

    // Only send dates if last action was date filter or initial load
    if (lastAction === "date" || lastAction === null) {
      params.startDate = convertISTToUTCForAPI(appliedStartDate, 'start');
      params.endDate = convertISTToUTCForAPI(appliedEndDate, 'end');
      params.search = ""; // Explicitly empty search for date filters/initial load
    }

    dispatch(fetchCreditNotes(params));
  }, [dispatch, paginationModel.page, paginationModel.pageSize, appliedStartDate, appliedEndDate, appliedSearchQuery, lastAction]);

  // ✅ Map rows for DataGrid with useMemo
  const mappedRows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return (creditNotes || [])
      .filter((item) => !item?.creditNoteFor?.toLowerCase().includes("course"))
      .map((item, index) => ({
        id: item._id || index,
        sono: index + 1 + paginationModel.page * pageSize,
        creditNoteFor: item.creditNoteFor,
        cancelledInvoice: item.cancelledInvoice,
        segment: item.segment,
        status: item.status || "",
        basicAmount: item.basicAmount || 0,
        gst: item.gst || 0,
        invoiceAmount: item.invoiceAmount || 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creditNotePdfUrl: item.creditNotePdfUrl,
      }));
  }, [creditNotes, paginationModel, paginationDetail]);

  // ✅ View PDF
  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.warn("PDF URL is not available for this record.");
    }
  };

  // ✅ Columns
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
          <Tooltip title="View PDF">
            <IconButton
              size="small"
              onClick={() => handleViewPdf(row.creditNotePdfUrl)}
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
        </Box>
      ),
    },
    { field: "creditNoteFor", headerName: "Credit Note", width: 180 },
    { field: "cancelledInvoice", headerName: "Cancelled Invoice", width: 200 },
    { field: "segment", headerName: "Segment", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: ({ row }) => (
        <Box
          sx={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'capitalize',
            display: 'inline-block',
            backgroundColor: row.status === 'active' || row.status === 'completed'
              ? 'rgba(76, 175, 80, 0.1)'
              : row.status === 'pending' || row.status === 'processing'
                ? 'rgba(255, 152, 0, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
            color: row.status === 'active' || row.status === 'completed'
              ? '#4caf50'
              : row.status === 'pending' || row.status === 'processing'
                ? '#ff9800'
                : '#f44336',
          }}
        >
          {row.status || 'N/A'}
        </Box>
      ),
    },
    {
      field: "basicAmount",
      headerName: "Basic Amount",
      width: 150,
      type: 'number',
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "gst",
      headerName: "GST",
      width: 120,
      type: 'number',
      valueFormatter: (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A',
    },
    {
      field: "invoiceAmount",
      headerName: "Invoice Amount",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    { field: "createdAt", headerName: "Created At", width: 180, valueFormatter: formatUTCDateForDataGrid },
    { field: "updatedAt", headerName: "Updated At", width: 180, valueFormatter: formatUTCDateForDataGrid },
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
    setLastAction(null);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // ✅ Excel Export - fetches all data from API
  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("User-admin-token");
    try {
      const params = new URLSearchParams();
      if (appliedStartDate) {
        params.append('startDate', convertISTToUTCForAPI(appliedStartDate, 'start'));
      }
      if (appliedEndDate) {
        params.append('endDate', convertISTToUTCForAPI(appliedEndDate, 'end'));
      }
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        params.append('search', appliedSearchQuery);
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/creditNotes?${params.toString()}`,
        {
          headers: { Authorization: token },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
      }

      const allData = (response.data?.data || [])
        .filter((item) => !item?.creditNoteFor?.toLowerCase().includes("course"));

      if (!Array.isArray(allData) || allData.length === 0) {
        toast.warn("No data available to export");
        setIsExporting(false);
        return;
      }

      const exportData = allData.map((row, index) => ({
        "S.No.": index + 1,
        "Credit Note": row.creditNoteFor || "",
        "Cancelled Invoice": row.cancelledInvoice || "",
        Segment: row.segment || "",
        Status: row.status || "",
        "Basic Amount": row.basicAmount || 0,
        GST: row.gst || 0,
        "Invoice Amount": row.invoiceAmount || 0,
        "Created At": formatUTCDateForExport(row.createdAt),
        "Updated At": formatUTCDateForExport(row.updatedAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Credit Reports");

      XLSX.writeFile(
        workbook,
        `CreditReports_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      toast.success("Export successful!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.response?.data?.message || "Failed to export Excel file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <ToastContainer />
        <PageHeader1 pagetitle="Credit Note Report" />

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
          {/* Search Section */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              label="Search..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { handleSearch(); } }}
              sx={{ width: 280 }}
              placeholder="Search by credit note, invoice, segment..."
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
          </Box>

          {/* Date Filters Section */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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
                flexShrink: 0
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={isExporting}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                backgroundColor: "var(--primary-color, #1976d2)",
                color: "#fff",
                fontWeight: 500,
                height: 40,
                px: 2,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-color, #1976d2)",
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
                flexShrink: 0
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
                    rows={mappedRows}
                    columns={columns}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    loading={status === "loading"}
                    disableSelectionOnClick
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
    </div>
  );
};

export default CreditReports;
