import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import PageHeader1 from "../../components/common/PageHeader1";

const AstrologerStatusByTimeRange = () => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowsData, setRowsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState(null);
  const [paginationDetail, setPaginationDetail] = useState(null);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [selectedAstrologerSessions, setSelectedAstrologerSessions] = useState([]);
  const [selectedAstrologerName, setSelectedAstrologerName] = useState("");

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Store initial default values
  const initialStartDate = getTodayDate();
  const initialEndDate = getTodayDate();
  const initialStartTime = "00:00"; // 12:00 AM
  const initialEndTime = getCurrentTime(); // Current time

  // Filter states with default values
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const token = localStorage.getItem("User-admin-token");
  const isInitialMount = useRef(true);

  // Format date from YYYY-MM-DD to MM/DD/YYYY
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format time from HH:MM to "X pm" or "X am" format
  const formatTimeForAPI = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const min = parseInt(minutes, 10);
    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = min > 0 ? `${displayHour}:${String(min).padStart(2, "0")} ${period}` : `${displayHour} ${period}`;
    return timeStr;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1; // API expects 1-based page
      let limit = Number(paginationModel.pageSize);
      if (isNaN(limit)) {
        limit = paginationDetail?.totalRecords || 10000;
      }

      const params = {
        page,
        limit,
      };
      if (startDate) params.startDate = formatDateForAPI(startDate);
      if (endDate) params.endDate = formatDateForAPI(endDate);
      if (startTime) params.startTime = formatTimeForAPI(startTime);
      if (endTime) params.endTime = formatTimeForAPI(endTime);

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/astrologersStatusByTimeRange`,
        {
          params,
          headers: {
            Authorization: token,
          },
        }
      );

      const data = response.data?.data || [];
      const summaryData = response.data?.summary || null;
      const paginationData = response.data?.paginationDetail || null;

      setRowsData(data);
      setSummary(summaryData);
      setPaginationDetail(paginationData);
      setTotalRecords(paginationData?.totalRecords || data.length);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(error.response?.data?.message || "Failed to fetch data");
      setRowsData([]);
      setTotalRecords(0);
      setSummary(null);
      setPaginationDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when pagination changes or on initial mount
  useEffect(() => {
    if (startDate && endDate && startTime && endTime) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        fetchData();
      } else {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  // Format duration from seconds to readable format
  const formatDuration = (seconds = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return rowsData.map((item, index) => ({
      ...item,
      id: item._id || item.id || index,
      sono: index + 1 + paginationModel.page * pageSize,
      astrologerName: item.fullName || "N/A",
      currentStatus: item.currentStatus || "offline",
      statusDuringRange: item.statusDuringRange || "offline",
      isManuallyBusy: item.isManuallyBusy || false,
      mobileNumber: item.mobileNumber || "N/A",
      email: item.email || "N/A",
      totalSessions: item.totalSessions || 0,
      type: item.type || "human",
      sessions: item.sessions || [],
    }));
  }, [rowsData, paginationModel, paginationDetail]);

  const handleOpenSessionsModal = (sessions, astrologerName) => {
    setSelectedAstrologerSessions(sessions || []);
    setSelectedAstrologerName(astrologerName || "");
    setSessionsModalOpen(true);
  };

  const handleCloseSessionsModal = () => {
    setSessionsModalOpen(false);
    setSelectedAstrologerSessions([]);
    setSelectedAstrologerName("");
  };

  const columns = [
    { field: "sono", headerName: "S.No", width: 80, align: "center", headerAlign: "center" },
    {
      field: "astrologerName",
      headerName: "Astrologer Name",
      width: 200,
      cellClassName: "astrologer-name-cell",
      renderCell: (params) => (
        <span style={{ paddingLeft: "8px", paddingRight: "8px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "currentStatus",
      headerName: "Current Status",
      width: 140,
      renderCell: (params) => {
        const status = params.value?.toLowerCase() || "";
        const color = status === "online" ? "#4caf50" : "#9e9e9e";
        return (
          <span style={{ color, fontWeight: 600, textTransform: "capitalize" }}>
            {params.value || "offline"}
          </span>
        );
      }
    },
    {
      field: "statusDuringRange",
      headerName: "Status During Range",
      width: 180,
      renderCell: (params) => {
        const status = params.value?.toLowerCase() || "";
        const color = status === "online" ? "#4caf50" : "#9e9e9e";
        return (
          <span style={{ color, fontWeight: 600, textTransform: "capitalize" }}>
            {params.value || "offline"}
          </span>
        );
      }
    },
    {
      field: "isManuallyBusy",
      headerName: "Manually Busy",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span style={{ color: params.value ? "#ff9800" : "#9e9e9e", fontWeight: 600 }}>
          {params.value ? "Yes" : "No"}
        </span>
      )
    },
    { field: "mobileNumber", headerName: "Mobile", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "type", headerName: "Type", width: 100 },
    {
      field: "totalSessions",
      headerName: "Total Sessions",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenSessionsModal(params.row.sessions, params.row.astrologerName)}
          sx={{
            textTransform: "none",
            borderColor: "#E7B242",
            color: "#E7B242",
            "&:hover": {
              borderColor: "#E7B242",
              backgroundColor: "rgba(231, 178, 66, 0.08)",
            },
          }}
        >
          {params.value || 0}
        </Button>
      )
    },
  ];

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (startDate) params.startDate = formatDateForAPI(startDate);
      if (endDate) params.endDate = formatDateForAPI(endDate);
      if (startTime) params.startTime = formatTimeForAPI(startTime);
      if (endTime) params.endTime = formatTimeForAPI(endTime);

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/astrologersStatusByTimeRange`,
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

      const formatDuration = (seconds = 0) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
          return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
          return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
      };

      const exportData = exportRows.map((row, index) => ({
        "S.No": index + 1,
        "Astrologer Name": row.fullName || "N/A",
        "Current Status": row.currentStatus || "offline",
        "Status During Range": row.statusDuringRange || "offline",
        "Manually Busy": row.isManuallyBusy ? "Yes" : "No",
        "Mobile Number": row.mobileNumber || "N/A",
        "Email": row.email || "N/A",
        "Type": row.type || "human",
        "Total Sessions": row.totalSessions || 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AstrologerStatus");
      XLSX.writeFile(
        workbook,
        `Astrologer_Status_Report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Export error:", error);
      alert(error.response?.data?.message || "Failed to export data");
    } finally {
      setIsExporting(false);
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

  // Reset Filter Handler - Reset to default values
  const isFilterActive = startDate !== initialStartDate || endDate !== initialEndDate || startTime !== initialStartTime || endTime !== initialEndTime;

  const handleResetFilter = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
    setRowsData([]);
    setTotalRecords(0);
    setSummary(null);
    setPaginationDetail(null);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleSearch = () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Please fill all fields: Start Date, End Date, Start Time, and End Time");
      return;
    }
    // Reset to first page when searching
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    // fetchData will be called by useEffect when paginationModel changes
  };

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Astrologer Status by Time Range" />

        {/* Summary Cards */}
        {summary && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
              }}
            >
              <Box sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                Total Astrologers
              </Box>
              <Box sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#212529" }}>
                {summary.totalAstrologers || 0}
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
              }}
            >
              <Box sx={{ fontSize: "0.875rem", color: "#155724", mb: 0.5 }}>
                Online
              </Box>
              <Box sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#155724" }}>
                {summary.online || 0}
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
              }}
            >
              <Box sx={{ fontSize: "0.875rem", color: "#856404", mb: 0.5 }}>
                Busy
              </Box>
              <Box sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#856404" }}>
                {summary.busy || 0}
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
              }}
            >
              <Box sx={{ fontSize: "0.875rem", color: "#721c24", mb: 0.5 }}>
                Offline
              </Box>
              <Box sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#721c24" }}>
                {summary.offline || 0}
              </Box>
            </Box>
          </Box>
        )}

        {/* Top Toolbar: Filters + Export */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              // display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                variant="outlined"
                size="small"
                value={startDate}
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
                value={endDate}
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
              <TextField
                label="Start Time"
                type="time"
                variant="outlined"
                size="small"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: 180,
                  "& input[type='time']::-webkit-calendar-picker-indicator": {
                    paddingRight: "8px",   // ⭐ SHIFT CLOCK ICON LEFT
                  },
                  "& .MuiInputBase-input[type='time']": {
                    paddingRight: "20px",  // ⭐ SPACE BETWEEN TEXT AND ICON
                  },
                }}
              />
              <TextField
                label="End Time"
                type="time"
                variant="outlined"
                size="small"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: 180,
                  "& input[type='time']::-webkit-calendar-picker-indicator": {
                    paddingRight: "8px",   // ⭐ SHIFT CLOCK ICON LEFT
                  },
                  "& .MuiInputBase-input[type='time']": {
                    paddingRight: "20px",  // ⭐ SPACE BETWEEN TEXT AND ICON
                  },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "flex-end", marginTop: "10px" }}>
              {isFilterActive && (
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    borderColor: "var(--primary-color, #E7B242)",
                    color: "var(--primary-color, #E7B242)",
                    "&:hover": {
                      borderColor: "var(--primary-color, #E7B242)",
                      backgroundColor: "rgba(231, 178, 66, 0.08)",
                    },
                  }}
                >
                  Reset Filter
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                className="btn btn-primary"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#E7B242",
                  color: "#fff",
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
              <Button
                variant="contained"
                onClick={exportToExcel}
                disabled={isExporting || rowsData.length === 0}
                className="btn btn-primary"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#E7B242",
                  color: "#fff",
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
        </Box>

        {/* DataGrid Section */}
        <div
          className="card"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
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
                count={totalRecords}
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
                rowCount={totalRecords}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                paginationMode="server"
                loading={loading}
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
                  "& .MuiDataGrid-cell": {
                    padding: "8px 16px",
                  },
                  "& .astrologer-name-cell": {
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  },
                }}
              />
            </Box>
          </div>
        </div>

        {/* Sessions Modal */}
        <Dialog
          open={sessionsModalOpen}
          onClose={handleCloseSessionsModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              margin: "5vh 5% 5vh auto",
              marginLeft: { xs: "5%", sm: "10%", md: "15%" },
              position: "relative",
              width: { xs: "90%", sm: "700px", md: "800px", lg: "900px" },
            }
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f8f9fa",
              borderBottom: "2px solid #e9ecef",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: "#212529",
                fontSize: "1.25rem",
              }}
            >
              Sessions - {selectedAstrologerName}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseSessionsModal}
              sx={{
                color: "#6c757d",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  color: "#212529",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              padding: 0,
              maxHeight: "calc(90vh - 120px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "calc(90vh - 120px)",
                borderRadius: 0,
                boxShadow: "none",
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Manually Busy
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Start Time (IST)
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      End Time (IST)
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Duration
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Ongoing
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Chat
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Call
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Video Call
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8f9fa",
                        color: "#212529",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                      align="center"
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAstrologerSessions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        align="center"
                        sx={{
                          padding: "40px 16px",
                          color: "#6c757d",
                          fontSize: "1rem",
                        }}
                      >
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedAstrologerSessions.map((session, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:nth-of-type(even)": {
                            backgroundColor: "#f8f9fa",
                          },
                          "&:hover": {
                            backgroundColor: "#e9ecef",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: 500,
                            color: "#495057",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <span
                            style={{
                              color: session.status === "online" ? "#4caf50" : "#6c757d",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              fontSize: "0.875rem",
                            }}
                          >
                            {session.status || "offline"}
                          </span>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <span
                            style={{
                              color: session.isManuallyBusy ? "#ff9800" : "#6c757d",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {session.isManuallyBusy ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                          }}
                        >
                          {session.startTimeIST || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                          }}
                        >
                          {session.endTimeIST || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {session.duration || "N/A"}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <span
                            style={{
                              color: session.isOngoing ? "#4caf50" : "#6c757d",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {session.isOngoing ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {session.consultationCounts?.chat || 0}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {session.consultationCounts?.call || 0}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#495057",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {session.consultationCounts?.videoCall || 0}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          {session.consultationCounts?.total || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions
            sx={{
              padding: "16px 24px",
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #e9ecef",
              position: "sticky",
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Button
              onClick={handleCloseSessionsModal}
              variant="contained"
              sx={{
                backgroundColor: "#E7B242",
                color: "#fff",
                textTransform: "uppercase",
                fontWeight: 600,
                padding: "8px 24px",
                borderRadius: "6px",
                fontSize: "0.875rem",
                letterSpacing: "0.5px",
                "&:hover": {
                  backgroundColor: "#d4a03a",
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AstrologerStatusByTimeRange;

