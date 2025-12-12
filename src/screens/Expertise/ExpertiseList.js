import React, { useEffect, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Box,
  TextField,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import PageHeader1 from "../../components/common/PageHeader1";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import * as XLSX from "xlsx";

function ExpertiseList() {
  const token = localStorage.getItem("User-admin-token");

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [selectedExpertiseId, setSelectedExpertiseId] = useState(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract fetchExpertiseData with useCallback so we can call it after deletion too
  const fetchExpertiseData = useCallback(async () => {
    if (!token) {
      setError("No token found");
      setRows([]);
      setRowCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = rowCount > 0 ? rowCount : 10000;
      }

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
      });

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const requestUrl = `${process.env.REACT_APP_BASEURL}/admin/expertise?${params.toString()}`;

      const response = await axios.get(requestUrl, {
        headers: { Authorization: token },
      });

      const totalDocs = response?.data?.paginationDetail?.totalDocs || 0;
      const expertiseList = response?.data?.data || [];

      const pageSizeForSono = pageSize;
      const formattedRows = expertiseList.map((item, index) => ({
        id: item._id,
        sono: page * pageSizeForSono + index + 1,
        name: item.expertiseName || "N/A",
        expertiseIcon: item?.expertiseIcon || "N/A",
        createdAt: item?.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : "",
      }));

      setRows(formattedRows);
      setRowCount(totalDocs);

      // If current page is now beyond total pages (after deletion), adjust page
      const totalPages = Math.ceil(totalDocs / pageSize);
      if (paginationModel.page >= totalPages && totalPages > 0) {
        setPaginationModel((prev) => ({
          ...prev,
          page: totalPages - 1,
        }));
      }
    } catch (err) {
      console.error("Error fetching expertise:", err);
      setError("Failed to fetch data");
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearchQuery, startDate, endDate, token, rowCount]);

  // Fetch data on mount and pagination change
  useEffect(() => {
    fetchExpertiseData();
  }, [fetchExpertiseData]);

  // Delete Expertise
  const handleClickOpen = (id) => {
    setSelectedExpertiseId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPaginationModel({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newPageSize = parseInt(value, 10);
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/expertise?${params.toString()}`,
        { headers: { Authorization: token } }
      );

      const expertiseList = response?.data?.data || [];
      const exportData = expertiseList.map((item, index) => ({
        'S.No': index + 1,
        'Expertise Name': item.expertiseName || 'N/A',
        'Icon URL': item?.expertiseIcon || 'N/A',
        'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expertise List');

      const columnWidths = [
        { wch: 10 },
        { wch: 25 },
        { wch: 40 },
        { wch: 25 },
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.writeFile(workbook, 'expertise_list_export.xlsx');
      toast.success('Expertise exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export expertise');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpertiseId) return;

    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASEURL}/admin/expertise/${selectedExpertiseId}`,
        { headers: { Authorization: token } }
      );
      toast.success("Expertise deleted successfully!");
      handleClose();
      await fetchExpertiseData();
    } catch (error) {
      toast.error("Error deleting expertise");
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "sono",
      headerName: "S.No",
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <IconButton
            size="small"
            component={Link}
            to={`/expertise-edit/${row?.id}`}
            title="Edit Expertise"
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <i className="icofont-edit" style={{ fontSize: '18px' }}></i>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleClickOpen(row.id)}
            title="Delete Expertise"
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            <i className="icofont-ui-delete" style={{ fontSize: '18px' }}></i>
          </IconButton>
        </Box>
      ),
    },
    {
      field: "expertiseIcon",
      headerName: "Icon",
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {params?.value && params.value !== "N/A" ? (
            <img
              src={params.value}
              alt="Icon"
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                borderRadius: '6px',
                backgroundColor: '#f5f5f5',
                padding: '4px'
              }}
            />
          ) : (
            <span style={{ color: '#999', fontSize: '14px' }}>No Icon</span>
          )}
        </Box>
      ),
    },
    { field: "name", headerName: "Expertise Name", width: 250 },
    { field: "createdAt", headerName: "Created At", width: 250 },

  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className="body d-flex">
        <div className="container-xxl">
          <PageHeader1 righttitle="Add Expertise" link="/expertise-add" routebutton={true} pagetitle='Expertise List' />
          <div className="row g-0 mb-3">
            <div className="col-md-12">
              <div className="card" style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: 'none',
                overflow: 'hidden'
              }}>
                <div className="card-body" style={{ padding: '0', position: "relative" }}>
                  {/* <Box sx={{
                    p: 2,
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                  }}>
                    <TextField
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      size="small"
                      sx={{
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                        '& .MuiInputBase-input': {
                          padding: '8px 12px',
                          fontSize: '14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className="icofont-search" style={{ color: '#999' }}></i>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate || ''}
                      onChange={(e) => setStartDate(e.target.value)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        max: endDate || undefined,
                      }}
                      sx={{
                        minWidth: 200,
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
                      value={endDate || ''}
                      onChange={(e) => setEndDate(e.target.value)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: startDate || undefined,
                      }}
                      sx={{
                        minWidth: 200,
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
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      variant="outlined"
                      onClick={handleResetFilter}
                      sx={{
                        borderColor: 'var(--primary-color, #E7B242)',
                        color: 'var(--primary-color, #E7B242)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '14px',
                        px: 2,
                        py: 0.75,
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
                      sx={{
                        backgroundColor: 'var(--primary-color, #E7B242)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '14px',
                        px: 2,
                        py: 0.75,
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
                      {isExporting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} color="inherit" />
                          <span>Exporting...</span>
                        </Box>
                      ) : (
                        'Export'
                      )}
                    </Button>
                  </Box> */}

                  {error ? (
                    <div className="alert alert-danger m-3" style={{ borderRadius: '8px' }}>
                      <strong>Error:</strong> {error}
                    </div>
                  ) : (
                    <>
                      <Box sx={{
                        width: '100%',
                        position: 'relative',
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
                          rows={rows}
                          columns={columns}
                          loading={loading}
                          paginationMode="server"
                          hideFooterPagination
                          getRowId={(row) => row.id}
                          disableSelectionOnClick
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
                      <TablePagination
                        component="div"
                        count={rowCount || 0}
                        page={paginationModel.page}
                        onPageChange={handleChangePage}
                        rowsPerPage={paginationModel.pageSize}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Rows per page:"
                        sx={{
                          borderTop: '1px solid #e9ecef',
                          '& .MuiTablePagination-toolbar': {
                            padding: '12px 20px',
                          },
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expertise?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ExpertiseList;