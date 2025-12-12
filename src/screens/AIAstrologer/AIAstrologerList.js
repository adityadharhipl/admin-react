import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button, Switch, TablePagination, TextField, InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import * as XLSX from 'xlsx';

// Debounce hook for dynamic search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function AIAstrologerList() {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [aiAstroData, setAiAstroData] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const token = localStorage.getItem('User-admin-token');

  // Static expertise labels mapping
  const expertiseLabels = {
    BabynameGenerator: 'Baby Name Generator',
    Career: 'Career',
    FaceReading: 'Face Reading',
    Finance: 'Finance',
    Health: 'Health',
    Love: 'Love',
    Marriage: 'Marriage',
    PalmReading: 'Palm Reading',
    Remedies: 'Remedies',
  };

  // Fetch AI Astrologers
  useEffect(() => {
    const fetchAIAstrologers = async () => {
      setLoading(true);
      try {
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10;
        }

        const params = {
          page: page + 1,
          limit: limit,
        };

        if (debouncedSearchValue) params.search = debouncedSearchValue;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(
          `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer`,
          {
            params,
            headers: { Authorization: token },
          }
        );

        const { data, paginationDetail } = response.data || {};
        const { totalDocs: total = 0, totalPages = 1, page: currentPage = 1 } = paginationDetail || {};

        setAiAstroData(Array.isArray(data) ? data : []);
        setTotalDocs(total);
        setPaginationModel((prev) => ({
          ...prev,
          page: currentPage - 1,
          totalPages,
        }));
      } catch (error) {
        console.error('Error fetching AI Astrologers:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch AI Astrologers');
      } finally {
        setLoading(false);
      }
    };

    fetchAIAstrologers();
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearchValue, startDate, endDate, token]);

  // Delete handler
  const handleClickOpen = (userId) => {
    setSelectedUserId(userId);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChangePage = (event, newPage) => {
    setPaginationModel({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const newPageSize = Number(event.target.value);
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  const handleResetFilter = () => {
    setSearchValue('');
    setStartDate('');
    setEndDate('');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const params = {};

      if (searchValue) params.search = searchValue;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const url = `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer?${new URLSearchParams(params).toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: token },
      });

      const data = response.data?.data || [];
      const exportData = data.map((item, index) => ({
        'S.No': index + 1,
        'Name': item?.name || '-',
        'Title': item?.title || '-',
        'Specialization': item?.specialization || '-',
        'Experience': item?.experience || '-',
        'Rating': item?.rating || 0,
        'Languages': Array.isArray(item?.languages) ? item.languages.map(l => typeof l === 'object' && l.languageName ? l.languageName : l).filter(Boolean).join(', ') : '-',
        'Expertise': Array.isArray(item?.expertise) ? item.expertise.map(e => typeof e === 'object' && e.expertiseName ? e.expertiseName : expertiseLabels[e] || e).filter(Boolean).join(', ') : '-',
        'AI Model': item?.aiModel || '-',
        'Total Consultations': item?.totalConsultations || 0,
        'Response Time': item?.responseTime || '-',
        'Price/Min (₹)': item?.pricePerMinute || 0,
        'Total Reviews': item?.totalReviews || 0,
        'Active': item?.isActive ? 'Yes' : 'No',
        'Online': item?.isOnline ? 'Yes' : 'No',
        'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
        'Updated At': item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AI Astrologers');
      XLSX.writeFile(wb, `AI_Astrologers_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${selectedUserId}`,
        { headers: { Authorization: token } }
      );
      toast.success('AI Astrologer deleted successfully!');
      setOpen(false);
      // Refresh
      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10000;
      }
      const params = {
        page: page + 1,
        limit: limit,
      };
      if (debouncedSearchValue) params.search = debouncedSearchValue;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/ai-astrologer`, {
        params,
        headers: { Authorization: token },
      });
      const { data, paginationDetail } = res.data || {};
      setAiAstroData(Array.isArray(data) ? data : []);
      setTotalDocs(paginationDetail?.totalDocs || 0);
    } catch (error) {
      console.error('Error deleting AI Astrologer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete AI Astrologer');
    }
  };

  // Status toggle
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        }
      );
      toast.success('Status updated successfully!');
      setAiAstroData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleOnline = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
        { isOnline: !currentStatus },
        {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        }
      );
      toast.success('Online status updated successfully!');
      setAiAstroData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isOnline: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating online status:', error);
      toast.error(error.response?.data?.message || 'Failed to update online status');
    }
  };

  const columns = [
    {
      field: 'sono',
      headerName: 'S.No',
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <IconButton
            size="small"
            component={Link}
            to={`/ai-astrologer-view/${row.id}`}
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
          <IconButton
            size="small"
            component={Link}
            to={`/ai-astrologer-edit/${row.id}`}
            title="Edit"
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
            title="Delete"
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
      field: 'name',
      headerName: 'Name',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {params.row.profileImg ? (
            <img
              src={params.row.profileImg}
              alt={params.value}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e0e0e0',
              }}
              onError={(e) => {
                e.target.src =
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png';
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e0e0e0',
              }}
            >
              <i className="icofont-user" style={{ fontSize: '20px', color: '#999' }}></i>
            </Box>
          )}
          <span style={{ fontWeight: 500 }}>{params.value || '-'}</span>
        </Box>
      ),
    },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'specialization', headerName: 'Specialization', width: 150 },
    { field: 'experience', headerName: 'Experience', width: 120 },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <i className="icofont-star" style={{ color: '#ffc107', fontSize: '16px' }}></i>
          <span>{params.value || '0'}</span>
        </Box>
      ),
    },
    {
      field: 'languages',
      headerName: 'Languages',
      width: 200,
      renderCell: (params) => {
        const languagesText = params.value?.join(', ') || '-';
        return (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
            title={languagesText}
          >
            {languagesText}
          </Box>
        );
      },
    },
    {
      field: 'expertise',
      headerName: 'Expertise',
      width: 220,
      renderCell: (params) => {
        const expertiseText = params.value?.join(', ') || '-';
        return (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
            title={expertiseText}
          >
            {expertiseText}
          </Box>
        );
      },
    },
    { field: 'aiModel', headerName: 'AI Model', width: 150 },
    { field: 'totalConsultations', headerName: 'Total Consultations', width: 150 },
    { field: 'responseTime', headerName: 'Response Time', width: 130 },
    { field: 'pricePerMinute', headerName: 'Price/Min (₹)', width: 120 },
    { field: 'totalReviews', headerName: 'Total Reviews', width: 120 },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Switch
          checked={Boolean(row.isActive)}
          onChange={() => handleToggleActive(row.id, row.isActive)}
          color="primary"
        />
      ),
    },
    {
      field: 'isOnline',
      headerName: 'Online',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Switch
          checked={Boolean(row.isOnline)}
          onChange={() => handleToggleOnline(row.id, row.isOnline)}
          color="success"
        />
      ),
    },
    { field: 'createdAt', headerName: 'Created At', width: 180, type: 'dateTime' },
    { field: 'updatedAt', headerName: 'Updated At', width: 180, type: 'dateTime' },
  ];

  const rows = useMemo(() => {
    if (!Array.isArray(aiAstroData)) return [];
    return aiAstroData.map((astro, index) => ({
      sono: paginationModel.page * paginationModel.pageSize + index + 1,
      id: astro._id,
      name: astro.name || '-',
      title: astro.title || '-',
      specialization: astro.specialization || '-',
      description: astro.description || '-',
      experience: astro.experience || '-',
      rating: astro.rating || 0,
      languages: Array.isArray(astro.languages)
        ? astro.languages
          .map((l) =>
            typeof l === 'object' && l.languageName ? l.languageName : l
          )
          .filter(Boolean)
        : [],
      expertise: Array.isArray(astro.expertise)
        ? astro.expertise
          .map((e) =>
            typeof e === 'object' && e.expertiseName
              ? e.expertiseName
              : expertiseLabels[e] || e
          )
          .filter(Boolean)
        : [],
      aiModel: astro.aiModel || '-',
      isActive: astro.isActive || false,
      totalConsultations: astro.totalConsultations || 0,
      responseTime: astro.responseTime || '-',
      currency: astro.currency || 'INR',
      isOnline: astro.isOnline || false,
      pricePerMinute: astro.pricePerMinute || 0,
      totalReviews: astro.totalReviews || 0,
      profileImg: astro.profileImg || '',
      createdAt: astro.createdAt ? new Date(astro.createdAt) : null,
      updatedAt: astro.updatedAt ? new Date(astro.updatedAt) : null,
    }));
  }, [aiAstroData, paginationModel.page, paginationModel.pageSize]);

  return (
    <div className="body d-flex">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container-xxl">
        <PageHeader1
          pagetitle="AI Astrologers List"
          routebutton={true}
          righttitle="Add AI Astrologer"
          link="/ai-astrologer-add"
        />

        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div className="card-body" style={{ padding: '20px' }}>
                {/* Custom Toolbar */}
                {/* <Box sx={{
                  mb: 2,
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}>
                  <TextField
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="icofont-search" style={{ fontSize: '18px', color: '#666' }}></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
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
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
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
                  <Button
                    variant="outlined"
                    onClick={handleResetFilter}
                    sx={{
                      borderColor: 'var(--primary-color, #E7B242)',
                      color: 'var(--primary-color, #E7B242)',
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
                </Box> */}

                <Box sx={{
                  width: '100%',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-cell[data-field="actions"]': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    loading={loading}
                    columns={columns}
                    rows={rows}
                    disableSelectionOnClick
                    paginationMode="server"
                    hideFooterPagination
                    getRowId={(row) => row.id}
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
                  count={totalDocs || 0}
                  page={paginationModel.page}
                  onPageChange={handleChangePage}
                  rowsPerPage={paginationModel.pageSize}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50]}
                  sx={{
                    borderTop: '1px solid #e9ecef',
                    '& .MuiTablePagination-toolbar': {
                      padding: '12px 20px',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete AI Astrologer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this AI Astrologer?
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
}

export default AIAstrologerList;