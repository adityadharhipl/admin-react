import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import PageHeader1 from "../../components/common/PageHeader1";
import { useDispatch, useSelector } from "react-redux";
import { fetchSessionReport } from "../../Redux/Reducers/InvoiceReportReducer";
import { formatUTCDateForDataGrid, formatUTCDateForExport, convertISTToUTCForAPI } from "../../utils/dateUtils";

const SessionReports = () => {
  const dispatch = useDispatch();
  const { data: rowsData = [], paginationDetail = {}, status = "idle" } =
    useSelector((state) => state?.InvoiceReportReducer || {});

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

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("astrologerName"); // "astrologerName", "userName", "mobile", "sessionType"
  const [appliedSearchType, setAppliedSearchType] = useState("astrologerName");
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
        dispatch(fetchSessionReport(params));
      }
      return; // Exit early, don't send dates
    }

    // For date filters or initial load, send page, limit, and dates
    const page = paginationModel.page + 1;
    let limit = Number(paginationModel.pageSize);
    if (isNaN(limit)) {
      limit = 10;
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

    dispatch(fetchSessionReport(params));
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

  const convertSecondsToTime = (totalSeconds = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours} hr ${minutes} min ${seconds} sec`;
  };

  const formatCamelCase = (str = "") =>
    str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (char) => char.toUpperCase());

  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return rowsData
      ?.map((item, index) => ({
        ...item,
        id: item._id || item.id || index,
        sono: index + 1 + paginationModel.page * pageSize,
        astrologerName: item?.astrologerName && item?.astrologerName !== "N/A" ? item?.astrologerName : "Deleted Astrologer",
        userName: item?.userName && item?.userName !== "N/A" ? item?.userName : "Deleted User",
        mobileNumber: item?.mobileNumber && item?.mobileNumber !== "N/A" ? item?.mobileNumber : "-",
        sessionType: formatCamelCase(item?.sessionType),
        duration: convertSecondsToTime(item?.duration),
      }))
  }, [rowsData, paginationModel]);

  const columns = [
    { field: "sono", headerName: "S.No", width: 80, align: "center", headerAlign: "center" },
    { field: "astrologerName", headerName: "Astrologer Name", width: 180 },
    { field: "userName", headerName: "User Name", width: 160 },
    { field: "mobileNumber", headerName: "Mobile No.", width: 150 },
    { field: "sessionType", headerName: "Call/Chat", width: 120 },
    { field: "session", headerName: "Session", width: 150 },
    { field: "duration", headerName: "Duration", width: 140 },
    { field: "walletBefore", headerName: "Wallet Before", width: 150 },
    { field: "walletAmount", headerName: "Wallet During Consult", width: 180 },
    { field: "walletAfter", headerName: "Wallet After", width: 150 },
    { field: "astroShare", headerName: "Astro Share", width: 140 },
    // { field: "promotionShare", headerName: "Promotion Share", width: 160 },
    { field: "companyShare", headerName: "Company Share", width: 160 },
    { field: "createdAt", headerName: "Created At", width: 180, valueFormatter: formatUTCDateForDataGrid },
    { field: "updatedAt", headerName: "Updated At", width: 180, valueFormatter: formatUTCDateForDataGrid },
  ];

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("User-admin-token");

      // Fetch all data with current filters for export (date + search filters)
      // Use currently selected dates and search query - user's current selection
      const params = {
        startDate: startDate,
        endDate: endDate
      };

      // Add search parameters if search query exists
      if (searchQuery && searchType) {
        // Map searchType to backend parameter names
        const searchParamMap = {
          mobile: 'mobileNumber',
          astrologerName: 'astrologerName',
          userName: 'userName',
          sessionType: 'sessionType'
        };

        const backendParam = searchParamMap[searchType] || 'search';
        params[backendParam] = searchQuery;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/sessionReportExport`,
        {
          params,
          headers: {
            Authorization: token,
          },
        }
      );

      const exportRows = response.data?.data || [];

      if (!Array.isArray(exportRows) || exportRows.length === 0) {
        alert("No data available to export");
        setIsExporting(false);
        return;
      }

      const convertSecondsToTime = (totalSeconds = 0) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours} hr ${minutes} min ${seconds} sec`;
      };

      const formatCamelCase = (str = "") =>
        str
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (char) => char.toUpperCase());

      const exportData = exportRows.map((row, index) => ({
        "S.No": index + 1,
        "Astrologer Name": row.astrologerName && row?.astrologerName !== "N/A" ? row?.astrologerName : "Deleted Astrologer",
        "User Name": row.userName && row?.userName !== "N/A" ? row?.userName : "Deleted User",
        "Mobile No.": row.mobileNumber && row?.mobileNumber !== "N/A" ? row?.mobileNumber : "-",
        "Call/Chat": formatCamelCase(row.sessionType || ""),
        "Session": row.session || "",
        "Duration": convertSecondsToTime(row.duration),
        "Wallet Before": row.walletBefore || 0,
        "Wallet During Consult": row.walletAmount || 0,
        "Wallet After": row.walletAfter || "",
        "Astro Share": row.astroShare || 0,
        "Promotion Share": row.promotionShare || "",
        "Company Share": row.companyShare || "",
        "Created At": formatUTCDateForExport(row.createdAt),
        "Updated At": formatUTCDateForExport(row.updatedAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SessionReports");
      XLSX.writeFile(workbook, `Session_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert(error.response?.data?.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClickOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleDelete = () => {
    setOpen(false);
  };

  // 🧭 Pagination Handlers
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

  // 🔄 Reset Filter Handler
  const isFilterActive = startDate !== todayDate || endDate !== todayDate || searchQuery || appliedSearchQuery;

  const handleResetFilter = () => {
    setStartDate(todayDate);
    setEndDate(todayDate);
    setAppliedStartDate(todayDate);
    setAppliedEndDate(todayDate);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSearchType("astrologerName");
    setAppliedSearchType("astrologerName");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Session Reports" />

        {/* 🔹 Top Toolbar: Search + Export */}
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
            <FormControl size="small" sx={{ minWidth: 140 }}>
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
                    borderColor: "#E7B242",
                  },
                }}
              >
                <MenuItem value="astrologerName">Astrologer Name</MenuItem>
                <MenuItem value="userName">User Name</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="sessionType">Session Type</MenuItem>
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
              sx={{ width: 220 }}
              placeholder={
                searchType === "astrologerName" ? "Search by astrologer name..." :
                  searchType === "userName" ? "Search by user name..." :
                    searchType === "mobile" ? "Search by mobile..." :
                      "Search by session type..."
              }
            />
            <IconButton
              onClick={handleSearch}
              sx={{
                backgroundColor: "#E7B242",
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#E7B242",
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
                    borderColor: "#E7B242",
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
                    borderColor: "#E7B242",
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
                backgroundColor: "#E7B242",
                color: "#fff",
                height: 40,
                px: 2,
                "&:hover": {
                  backgroundColor: "#E7B242",
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
                borderColor: "#E7B242",
                color: "#E7B242",
                height: 40,
                px: 2,
                "&:hover": {
                  borderColor: "#E7B242",
                  backgroundColor: "rgba(231, 178, 66, 0.08)",
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={exportToExcel}
              disabled={isExporting}
              className="btn btn-primary"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                backgroundColor: "#E7B242",
                color: "#fff",
                height: 40,
                px: 2,
                "&:hover": {
                  backgroundColor: "#E7B242",
                  opacity: 0.9,
                },
                "&:disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
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

        {/* 🧾 DataGrid Section */}
        <div
          className="card"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className="card-body" style={{ padding: 0 }}>
            {/* 👇 Custom Pagination on Top */}
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

            <Box
              sx={{
                width: "100%",
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #e9ecef",
                  fontWeight: 600,
                },
              }}
            >
              <DataGrid
                autoHeight
                columns={columns}
                rows={rows}
                getRowId={(row) => row.id}
                rowCount={paginationDetail?.totalRecords || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                paginationMode="server"
                loading={status === "loading"}
                disableRowSelectionOnClick
                hideFooterPagination
                hideFooter
                components={{
                  LoadingOverlay: CircularProgress,
                }}
                sx={{
                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                }}
              />
            </Box>
          </div>
        </div>
      </div>

      {/* 🗑️ Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this session record?
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
};

export default SessionReports;
