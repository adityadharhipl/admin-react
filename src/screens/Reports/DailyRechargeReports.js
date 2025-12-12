import React, { useEffect, useState, useMemo } from "react";
import { Box, TextField, Button, TablePagination, Select, MenuItem, FormControl, InputLabel, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import PageHeader1 from "../../components/common/PageHeader1";
import { useDispatch, useSelector } from "react-redux";
import { fetchRechargeReport } from "../../Redux/Reducers/CallAndChatReducer";
import axios from "axios";
import { handleUnauthorized } from "../../TokenAuth/auth";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from "../../utils/dateUtils";

function DailyRechargeReport() {
  const dispatch = useDispatch();
  const RechargeData = useSelector((state) => state?.CallAndChatReducer || {});
  const { data: rowsData = [], paginationDetail = {}, status = "idle" } = RechargeData;

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
  const [searchType, setSearchType] = useState("userName"); // "userName", "mobileNumber", "invoiceNumber", "paymentStatus"
  const [appliedSearchType, setAppliedSearchType] = useState("userName");
  const [startDate, setStartDate] = useState(todayDate);
  const [appliedStartDate, setAppliedStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [appliedEndDate, setAppliedEndDate] = useState(todayDate);
  const [isExporting, setIsExporting] = useState(false);
  const [lastAction, setLastAction] = useState(null); // "search" or "date" to track which was last applied

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
        dispatch(fetchRechargeReport(params));
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

  // Auto-reset search when input becomes empty
  useEffect(() => {
    if (!searchQuery.trim() && appliedSearchQuery) {
      setAppliedSearchQuery("");
      setAppliedSearchType(searchType);
      setLastAction(null);
      setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    }
  }, [searchQuery]);

  const columns = [
    {
      field: "sono",
      headerName: "S.No",
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    { field: "fullName", headerName: "User Name", width: 180 },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 150,
      renderCell: ({ row }) => (
        <Box
          sx={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'capitalize',
            display: 'inline-block',
            backgroundColor: row.paymentStatus === 'success' || row.paymentStatus === 'completed'
              ? 'rgba(76, 175, 80, 0.1)'
              : row.paymentStatus === 'pending' || row.paymentStatus === 'processing'
                ? 'rgba(255, 152, 0, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
            color: row.paymentStatus === 'success' || row.paymentStatus === 'completed'
              ? '#4caf50'
              : row.paymentStatus === 'pending' || row.paymentStatus === 'processing'
                ? '#ff9800'
                : '#f44336',
          }}
        >
          {row.paymentStatus || 'N/A'}
        </Box>
      ),
    },
    { field: "mobileNumber", headerName: "Mobile No.", width: 150 },
    {
      field: "openingBalance",
      headerName: "Opening Balance",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "rechargeAmount",
      headerName: "Recharge Amount",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "promoAmount",
      headerName: "Promo Amount",
      width: 140,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "invoiceAmount",
      headerName: "Invoice Amount",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "gst",
      headerName: "GST",
      width: 120,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    {
      field: "totalWallet",
      headerName: "Total Wallet",
      width: 160,
      type: 'number',
      valueFormatter: (value) => `${value?.toLocaleString('en-IN') || '0'}`,
    },
    { field: "invoiceNumber", headerName: "Invoice No", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueFormatter: formatUTCDateForDataGrid
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 180,
      valueFormatter: formatUTCDateForDataGrid
    },
  ];

  // Filter and transform rows - same pattern as SessionReport.js
  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return rowsData
      ?.filter((item) => {
        if (!appliedSearchQuery.trim()) return true;
        const query = appliedSearchQuery.toLowerCase();
        return (
          (item?.fullName?.toLowerCase().includes(query)) ||
          (item?.mobileNumber?.toString().includes(query)) ||
          (item?.invoiceNumber?.toLowerCase().includes(query)) ||
          (item?.paymentStatus?.toLowerCase().includes(query))
        );
      })
      ?.map((item, index) => ({
        ...item,
        id: item._id || item.id || index,
        sono: index + 1 + paginationModel.page * pageSize,
        fullName: item?.fullName || "N/A",
        mobileNumber: item?.mobileNumber || "N/A",
        openingBalance: item?.openingBalance || 0,
        rechargeAmount: item?.rechargeAmount || 0,
        promoAmount: item?.promoAmount || 0,
        totalWallet: item?.totalWallet || 0,
        gst: item?.gst || 0,
        invoiceNumber: item?.invoiceNumber || "N/A",
        invoiceAmount: item?.invoiceAmount || 0,
        paymentStatus: item?.paymentStatus || "N/A",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
  }, [rowsData, paginationModel, appliedSearchQuery]);

  // Pagination Handlers - same pattern as SessionReport.js
  const handleChangePage = (event, newPage) =>
    setPaginationModel((prev) => ({ ...prev, page: newPage }));

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newSize = parseInt(value, 10);
    setPaginationModel({ page: 0, pageSize: newSize });
  };

  // Search Handler - Only applies search query (no dates)
  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedSearchType(searchType);
    setLastAction("search");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Apply Date Filters Handler - Only applies date filters (no search)
  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setLastAction("date");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Reset Filter Handler
  const isFilterActive = startDate !== todayDate || endDate !== todayDate || searchQuery || appliedSearchQuery;

  const handleResetFilter = () => {
    setStartDate(todayDate);
    setEndDate(todayDate);
    setAppliedStartDate(todayDate);
    setAppliedEndDate(todayDate);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSearchType("userName");
    setAppliedSearchType("userName");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Export to CSV function - fetches all data from API
  const handleExport = async () => {
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
      const token = localStorage.getItem("User-admin-token");

      // Fetch all data from API with current filters (date + search)
      // Use currently selected dates (startDate, endDate) - user's current selection
      const params = {
        startDate: startDate,
        endDate: endDate
      };

      // Add search parameters if search query exists
      if (appliedSearchQuery && appliedSearchType) {
        // Map searchType to backend parameter names
        const searchParamMap = {
          userName: 'userName',
          mobileNumber: 'mobileNumber',
          invoiceNumber: 'invoiceNumber',
          paymentStatus: 'paymentStatus'
        };

        const backendParam = searchParamMap[appliedSearchType] || 'search';
        params[backendParam] = appliedSearchQuery;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/rechargeReportExport`,
        {
          params,
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

      // Get the columns to export
      const exportableColumns = columns.filter(col => col.field !== 'sono'); // Exclude S.No as it's calculated

      // Create the header row from column definitions
      const headerRow = ['S.No', ...exportableColumns.map(col => escapeCsvCell(col.headerName))].join(',');

      // Transform API data to match row structure
      const transformedData = allData.map((item, index) => {
        return {
          id: item._id || item.id || index,
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          openingBalance: item?.openingBalance || 0,
          rechargeAmount: item?.rechargeAmount || 0,
          promoAmount: item?.promoAmount || 0,
          totalWallet: item?.totalWallet || 0,
          gst: item?.gst || 0,
          invoiceNumber: item?.invoiceNumber || "N/A",
          invoiceAmount: item?.invoiceAmount || 0,
          paymentStatus: item?.paymentStatus || "N/A",
          createdAt: item.createdAt || null,
          updatedAt: item.updatedAt || null,
        };
      });

      // Create data rows from API data
      const dataRows = transformedData.map((row, index) => {
        const sono = index + 1;
        return [sono, ...exportableColumns.map(col => {
          let value = row[col.field];
          // Format dates using UTC to preserve original date
          if (col.field === 'createdAt' || col.field === 'updatedAt') {
            value = formatUTCDateForExport(value);
          }
          // Format currency values
          if (col.valueFormatter && typeof value === 'number') {
            value = value.toLocaleString('en-IN');
          }
          return escapeCsvCell(value);
        })].join(',');
      });

      // Combine header and data into a single CSV string
      const csvContent = [headerRow, ...dataRows].join('\n');

      // Create a Blob and trigger the browser download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `recharge-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(error.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Recharge Report" />
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Search By</InputLabel>
              <Select
                value={searchType}
                label="Search By"
                onChange={(e) => setSearchType(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.87)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color, #1976d2)",
                  },
                }}
              >
                <MenuItem value="userName">User Name</MenuItem>
                <MenuItem value="mobileNumber">Mobile Number</MenuItem>
                <MenuItem value="invoiceNumber">Invoice Number</MenuItem>
                <MenuItem value="paymentStatus">Payment Status</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Search..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{ width: 280 }}
              placeholder={
                searchType === "userName" ? "Search by user name..." :
                  searchType === "mobileNumber" ? "Search by mobile number..." :
                    searchType === "invoiceNumber" ? "Search by invoice number..." :
                      "Search by payment status..."
              }
            />
            <IconButton
              onClick={handleSearch}
              sx={{
                backgroundColor: "var(--primary-color, #1976d2)",
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "var(--primary-color, #1976d2)",
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
                "&:hover": {
                  backgroundColor: "var(--primary-color, #1976d2)",
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
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={isExporting}
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
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </Box>
        </Box>
        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div className="card-body" style={{ padding: 0 }}>
                {/* Custom Pagination on Top - same pattern as SessionReport.js */}
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
                    disableSelectionOnClick
                    loading={status === "loading"}
                    hideFooterPagination
                    hideFooter
                    sx={{
                      '& .MuiDataGrid-cell:focus': { outline: 'none' },
                      '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
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
}

export default DailyRechargeReport;
