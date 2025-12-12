import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  TextField,
  TablePagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import PageHeader1 from "../../components/common/PageHeader1";
import { handleUnauthorized } from "../../TokenAuth/auth";
import { formatUTCDateForDataGrid, formatUTCDateForExport } from "../../utils/dateUtils";

const CouponReportDemo = () => {
  const token = localStorage.getItem("User-admin-token");

  const [coupons, setCoupons] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Delete dialog states
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch coupons with pagination
  const fetchCoupons = async (page, limit) => {
    if (!token) {
      setError("Authorization token missing");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiPage = page + 1;
      let url = `${process.env.REACT_APP_BASEURL}/admin/coupon?page=${apiPage}&limit=${limit}`;

      // Add filters to URL
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");

      const data = await res.json();

      const mappedRows = (data?.data || [])
        .filter((item) => item?.type?.toLowerCase() !== "education") // exclude education coupons
        .map((item, index) => ({
          ...item,
          id: item._id || item.id || index,
          mobileNumber: item?.mobileNumber,
          astrologerName: item?.astrologerName,
          uniqueCodes:
            item?.type === "google_pay"
              ? item?.uniqueCodes?.map((uc) => uc.code).join(", ")
              : item?.code,
          couponCode: item?.couponCode,
          noOfUsersUse: item?.noOfUsersUse || item?.numCoupons || "N/A",
          usedCoupons: item?.usedCoupons || item?.usedBy?.length || "0",
          validFrom: item.validFrom,
          validTo: item.validTo,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
        }));

      setCoupons(mappedRows);
      setTotalCoupons(data?.paginationDetail?.totalDocs || 0);
    } catch (err) {
      setError(err.message || "Unknown error");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = totalCoupons || 10000;
    }
    fetchCoupons(page ?? 0, limit);
  }, [paginationModel, startDate, endDate, searchQuery]);


  // Open delete dialog
  const handleClickOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  // Close delete dialog
  const handleClose = () => setOpen(false);

  // Dummy delete handler: locally remove item
  const handleDelete = () => {
    setCoupons((prev) => prev.filter((c) => c.id !== selectedId));
    setOpen(false);
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

  // Filter and transform rows with useMemo
  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return coupons.map((item, index) => ({
      ...item,
      sono: index + 1 + paginationModel.page * pageSize,
    }));
  }, [coupons, paginationModel]);

  // Export to Excel function - fetches all data from API
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      if (!token) {
        setError("Authorization token missing");
        setIsExporting(false);
        return;
      }

      // Fetch all data from API with current filters
      let url = `${process.env.REACT_APP_BASEURL}/admin/coupon`;

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
      }

      const allData = (response.data?.data || [])
        .filter((item) => item?.type?.toLowerCase() !== "education");

      if (!Array.isArray(allData) || allData.length === 0) {
        setError("No data available to export");
        setIsExporting(false);
        return;
      }

      const exportData = allData.map((row, index) => ({
        "S.No": index + 1,
        "Category": row.category || "",
        "Type": row.type || "",
        "Code": row.code || "",
        "Google Coupon Code": row.type === "google_pay"
          ? row.uniqueCodes?.map((uc) => uc.code).join(", ")
          : row.code || "",
        "Coupon Code": row.couponCode || "",
        "Max Usage Limit": row.noOfUsersUse || row.numCoupons || "N/A",
        "Used Coupons": row.usedCoupons || row.usedBy?.length || "0",
        "Valid From": formatUTCDateForExport(row.validFrom),
        "Valid To": formatUTCDateForExport(row.validTo),
        "Created At": formatUTCDateForExport(row.createdAt),
        "Updated At": formatUTCDateForExport(row.updatedAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CouponReport");
      XLSX.writeFile(workbook, `Coupon_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      setError(error.response?.data?.message || "Failed to export data");
    } finally {
      setIsExporting(false);
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
    { field: "category", headerName: "Coupon Category", width: 160 },
    { field: "type", headerName: "Coupon Type", width: 150 },
    { field: "uniqueCodes", headerName: "Google Coupon Code", width: 180 },
    { field: "couponCode", headerName: "Coupon Code", width: 150 },
    {
      field: "noOfUsersUse",
      headerName: "Max Usage Limit",
      width: 160,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "usedCoupons",
      headerName: "Used Coupons",
      width: 140,
      headerAlign: 'center',
      align: 'center',
    },
    { field: "validFrom", headerName: "Valid From", width: 180, valueFormatter: formatUTCDateForDataGrid },
    { field: "validTo", headerName: "Valid To", width: 180, valueFormatter: formatUTCDateForDataGrid },
    { field: "createdAt", headerName: "Created At", width: 180, valueFormatter: formatUTCDateForDataGrid },
    { field: "updatedAt", headerName: "Updated At", width: 180, valueFormatter: formatUTCDateForDataGrid },
  ];

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Coupon Usage Report" />

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '8px',
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
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
          <TextField
            label="Search..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 280 }}
            placeholder="Search by category, type, code..."
          />
          <Box sx={{ display: "flex", gap: 2 }}>
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
              onClick={exportToExcel}
              disabled={isExporting}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                backgroundColor: "var(--primary-color, #1976d2)",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "var(--primary-color, #1976d2)",
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
                    count={totalCoupons || 0}
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
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    loading={loading}
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
};

export default CouponReportDemo;
