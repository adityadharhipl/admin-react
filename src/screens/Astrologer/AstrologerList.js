import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAstro, verifyAstro, deleteAstro, fetchAstroUpdateRequest } from "../../Redux/Reducers/AstroReducer";
import {
  Box, Switch, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button,
  Tooltip, TextField, TablePagination, Backdrop, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineInfo } from 'react-icons/md';
import { BsDownload } from 'react-icons/bs';
import * as XLSX from "xlsx";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function AstrologerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const [astroPaginationModel, setAstroPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [editablePaginationModel, setEditablePaginationModel] = useState({ page: 0, pageSize: 10 });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  const [tabValue, setTabValue] = useState('active');
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fileInputRef = useRef();

  const {
    astroData = [],
    editableAstroData = [],
    pagination,
    editablePagination,
    loading: astroLoading
  } = useSelector(state => state?.AstroReducer || {});

  useEffect(() => {
    if (tabValue === 'active' || tabValue === 'pending') {
      const { page, pageSize } = astroPaginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10;
      }
      dispatch(fetchAstro({
        page: page + 1,
        limit: limit,
        search: debouncedSearchValue,
        status: tabValue
      }));
    } else if (tabValue === 'editable') {
      const { page, pageSize } = editablePaginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10;
      }
      dispatch(fetchAstroUpdateRequest({
        page: page + 1,
        limit: limit,
        search: debouncedSearchValue,
      }));
    }
  }, [
    dispatch,
    tabValue,
    astroPaginationModel.page,
    astroPaginationModel.pageSize,
    editablePaginationModel.page,
    editablePaginationModel.pageSize,
    debouncedSearchValue
  ]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    const token = localStorage.getItem("User-admin-token");
    const formData = new FormData();
    formData.append("file", file);
    setUploadLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/uploadAstrologers`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Astrologers uploaded successfully!");
        const { pageSize } = astroPaginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10;
        }
        dispatch(fetchAstro({ page: 1, limit: limit, search: '', status: tabValue }));
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong while uploading");
    } finally {
      setUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadCSVFormat = () => {
    const sampleData = [
      ["Full Name", "Email", "Mobile Number", "Aadhar No.", "Pan No.", "Address", "Chat Rate", "Call Rate", "Video Rate",],
      ["Astrologer-1", "astrologer1@gmail.com", "9850666462", "1234 5678 9012", "ABCDE1234F", "123 MG Road, Delhi", "100", "100", "100"],
      ["Astrologer-2", "astrologer2@gmail.com", "9850666463", "2345 6789 0123", "BCDEF2345G", "456 Park Street, Mumbai", "100", "100", "100"],
      ["Astrologer-3", "astrologer3@gmail.com", "9850666464", "3456 7890 1234", "CDEFG3456H", "789 Church Road, Bangalore", "100", "100", "100"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "astrologer_upload_format.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleToggle = (id, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: true }));
    dispatch(verifyAstro({ id, isProfileVerified: !currentStatus })).then(() => {
      toast.success(`Astrologer ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
      const { page, pageSize } = astroPaginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10;
      }
      dispatch(fetchAstro({ page: page + 1, limit: limit, search: debouncedSearchValue, status: tabValue }));
    }).finally(() => {
      setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: false }));
    });
  };

  const handleClickOpen = (userId) => setSelectedUserId(userId) || setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    if (selectedUserId) {
      setActionLoading(prev => ({ ...prev, delete: true }));
      dispatch(deleteAstro(selectedUserId)).then(() => {
        const { page, pageSize } = astroPaginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10;
        }
        dispatch(fetchAstro({ page: page + 1, limit: limit, search: debouncedSearchValue, status: tabValue }));
        setOpen(false);
        toast.success("Astrologer deleted successfully!");
      }).catch(() => {
        toast.error("Failed to delete astrologer");
      }).finally(() => {
        setActionLoading(prev => ({ ...prev, delete: false }));
      });
    }
  };

  const handleChangePage = (event, newPage, isEditable) => {
    if (isEditable) {
      setEditablePaginationModel({ ...editablePaginationModel, page: newPage });
    } else {
      setAstroPaginationModel({ ...astroPaginationModel, page: newPage });
    }
  };

  const handleChangeRowsPerPage = (event, isEditable) => {
    const value = event.target.value;
    const newPageSize = parseInt(value, 10);
    if (isEditable) {
      setEditablePaginationModel({ page: 0, pageSize: newPageSize });
    } else {
      setAstroPaginationModel({ page: 0, pageSize: newPageSize });
    }
  };

  const handleTabChange = (newValue) => {
    setSearchValue('');
    setTabValue(newValue);
    if (newValue === 'editable') {
      setEditablePaginationModel({ page: 0, pageSize: 10 });
    } else {
      setAstroPaginationModel({ page: 0, pageSize: 10 });
    }
  };

  const handleFeaturedToggle = async (rowId, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [`featured-${rowId}`]: true }));
    const token = localStorage.getItem("User-admin-token");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/markFeaturedAstro/${rowId}`,
        {
          method: "POST",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: !currentStatus }),
        }
      );
      if (response.ok) {
        toast.success("Featured status updated");
        const { page, pageSize } = astroPaginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10;
        }
        dispatch(fetchAstro({ page: page + 1, limit: limit, search: debouncedSearchValue, status: tabValue }));
      } else {
        toast.error("Failed to update featured status");
      }
    } catch (err) {
      console.error("Featured toggle error:", err);
      toast.error("API error on featured toggle");
    } finally {
      setActionLoading(prev => ({ ...prev, [`featured-${rowId}`]: false }));
    }
  };

  const handleExport = useCallback(async () => {
    const token = localStorage.getItem("User-admin-token");
    const search = debouncedSearchValue;

    let endpoint = "";
    if (tabValue === "editable") {
      endpoint = "getAstroUpdateRequests";
    } else if (tabValue === "active") {
      endpoint = "getAllAstroVerified";
    } else {
      endpoint = "getAstroUnVerified";
    }

    setExportLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/${endpoint}?&search=${encodeURIComponent(search)}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to export astrologers");

      const result = await response.json();
      const astrologers = Array.isArray(result) ? result : result?.data || [];

      if (!astrologers.length) {
        toast.error("No astrologer data available to export");
        return;
      }

      const headers = [
        "Full Name",
        "Email",
        "Mobile Number",
        "State",
        "City",
        "Experience",
        "Qualification",
        "Languages",
        "Expertise",
        "Chat Rate",
        "Call Rate",
        "Video Rate",
        "Created At",
      ];

      const rows = astrologers.map((item) => {
        const astro = tabValue === "editable" ? item.astrologerId : item;
        return [
          astro.fullName || "",
          astro.email || "",
          astro.mobileNumber || "",
          astro.state || "",
          astro.city || "",
          astro.experience || "",
          astro.qualification || "",
          (astro.languages || []).map((l) => l.languageName).join(" | "),
          (astro.expertise || []).map((e) => e.expertiseName).join(" | "),
          astro.chat?.ratePerMinute || "",
          astro.call?.ratePerMinute || "",
          astro.videoCall?.ratePerMinute || "",
          new Date(astro.createdAt).toLocaleDateString(),
        ];
      });

      // Combine headers and rows
      const worksheetData = [headers, ...rows];

      // Create worksheet & workbook
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Astrologers");

      // Auto-fit column width
      const columnWidths = headers.map((header) => ({ wch: header.length + 10 }));
      worksheet["!cols"] = columnWidths;

      // Save file
      XLSX.writeFile(workbook, "astrologers_export.xlsx");

      toast.success("Astrologers exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export astrologers");
    } finally {
      setExportLoading(false);
    }
  }, [debouncedSearchValue, tabValue]);

  const columns = [
    {
      field: 'sono',
      headerName: 'S.No',
      width: 80,
      filterable: false,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: tabValue === 'editable' ? 100 : 240,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          {tabValue === 'editable' ? (
            <IconButton
              size="small"
              component={Link}
              to={`/astrologerreq-view/${row.id}`}
              title="View Request"
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <i className="icofont-eye" style={{ fontSize: '18px' }}></i>
            </IconButton>
          ) : (
            <>
              <IconButton
                size="small"
                component={Link}
                to={`/astrologer-view/${row.id}`}
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
                to={`/astrologer-edit/${row.id}`}
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
                component={Link}
                to={`/astrologer-online-status/${row.id}`}
                title="Check Status"
                sx={{
                  color: '#4caf50',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                  },
                }}
              >
                <i className="icofont-check-circled" style={{ fontSize: '18px' }}></i>
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
            </>
          )}
        </Box>
      )
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 220,
      renderCell: (params) => (
        <Button
          onClick={() => navigate(`/booking-by-astro/${params.row.id}`)}
          sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',
            p: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            }
          }}
        >
          {params.row?.isBankDetailGiven && (
            <Tooltip title="Bank details pending verification">
              <i className="icofont-warning-alt text-danger" style={{ fontSize: '16px' }}></i>
            </Tooltip>
          )}
          <span>{params.value || '-'}</span>
        </Button>
      ),
    },
    // { field: 'profileVisitCount', headerName: 'No. Of Profile Visit', width: 150 },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'mobileNumber',
      headerName: 'Phone No.',
      width: 100,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'city',
      headerName: 'City',
      width: 120,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'state',
      headerName: 'State',
      width: 120,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 200,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      type: 'dateTime',
      valueFormatter: (value) => {
        if (!value) return '-';
        if (value instanceof Date) return value.toLocaleString();
        return new Date(value).toLocaleString();
      },
    },
    {
      field: 'isFeatured', headerName: 'Featured', width: 120,
      renderCell: ({ row }) => (
        <Switch
          checked={Boolean(row.isFeatured)}
          onChange={() => handleFeaturedToggle(row.id, row.isFeatured)}
          color="primary"
          disabled={actionLoading[`featured-${row.id}`]}
        />
      ),
    },
    {
      field: 'isProfileVerified', headerName: 'Profile Verified', width: 180, type: 'boolean',
      renderCell: ({ row }) => (
        <Switch
          checked={Boolean(row.isProfileVerified)}
          onChange={() => handleToggle(row.id, row.isProfileVerified)}
          color="primary"
          disabled={actionLoading[`toggle-${row.id}`]}
        />
      ),
    },
  ];

  const isEditableTab = tabValue === 'editable';
  const currentData = isEditableTab ? editableAstroData : astroData;
  const currentPagination = isEditableTab ? editablePagination : pagination;
  const currentPaginationModel = isEditableTab ? editablePaginationModel : astroPaginationModel;

  // Debug: Log data structure
  useEffect(() => {
    if (currentData && currentData.length > 0) {
      console.log(`[${isEditableTab ? 'Editable' : 'Active/Pending'}] Total items from API:`, currentData.length);
      console.log(`[${isEditableTab ? 'Editable' : 'Active/Pending'}] First item structure:`, currentData[0]);
      if (isEditableTab && currentData[0]) {
        console.log(`[Editable] First item has astrologerId:`, !!currentData[0].astrologerId);
        console.log(`[Editable] First item astrologerId structure:`, currentData[0].astrologerId);
      }
    }
  }, [currentData, isEditableTab]);

  const rows = (currentData || []).map((item, index) => {
    if (!item) return null;

    // For editable tab, check if astrologerId exists, otherwise use item directly
    // Some items might have astrologerId nested, others might be the astrologer object itself
    let astro;
    if (isEditableTab) {
      // Check if item has astrologerId property
      if (item.astrologerId) {
        astro = item.astrologerId;
      } else if (item._id && (item.fullName || item.email || item.mobileNumber)) {
        // Item itself is the astrologer object
        astro = item;
      } else {
        // Try to find astrologer data in any nested property
        astro = item.astrologer || item.astrologerData || item;
      }
    } else {
      astro = item;
    }

    // Skip if astro doesn't exist or doesn't have _id
    if (!astro) {
      console.warn(`Item at index ${index} has no astrologer data:`, item);
      return null;
    }

    // For editable tab, if astro doesn't have _id, try to get it from item
    const astroId = astro._id || (isEditableTab ? item._id : null);
    if (!astroId) {
      console.warn(`Item at index ${index} has no _id:`, { astro, item });
      return null;
    }

    const bank = astro.bankDetails || {};
    const isBankDetailGiven = !!bank.bankName && !!bank.accountNumber && !!bank.ifscCode && bank.verification === 'pending';
    const pageSize = currentPaginationModel.pageSize;

    return {
      sono: currentPaginationModel.page * pageSize + index + 1,
      id: astroId,
      requestId: isEditableTab ? (item._id || astroId) : null,
      fullName: astro.fullName || '-',
      profileVisitCount: astro.profileVisitCount || 0,
      email: astro.email || '-',
      mobileNumber: astro.mobileNumber || '-',
      city: astro.city || '-',
      isFeatured: astro.isFeatured || false,
      state: astro.state || '-',
      createdBy: astro?.createdBy?.fullName || '-',
      isProfileVerified: astro.isProfileVerified || false,
      createdAt: astro.createdAt ? new Date(astro.createdAt) : null,
      isBankDetailGiven: isBankDetailGiven,
    };
  }).filter(Boolean);


  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 righttitle="Add Astrologer" link="/astrologer-add" routebutton={true} pagetitle='Astrologers List' />

        {/* Tabs and Controls Card */}
        <div className="card mb-3" style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: 'none'
        }}>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 2 }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant={tabValue === "active" ? "contained" : "outlined"}
                  onClick={() => handleTabChange("active")}
                  sx={{
                    fontSize: '14px',
                    minHeight: 30,
                    padding: '4px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backgroundColor: tabValue === "active"
                      ? 'var(--primary-color, #E7B242)'
                      : 'transparent',
                    color: tabValue === "active"
                      ? '#ffffff'
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: tabValue === "active"
                      ? 'var(--primary-color, #E7B242)'
                      : 'rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                      backgroundColor: tabValue === "active"
                        ? 'var(--primary-color, #E7B242)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: tabValue === "active"
                        ? '#ffffff'
                        : 'var(--primary-color, #E7B242)',
                      borderColor: tabValue === "active"
                        ? 'var(--primary-color, #E7B242)'
                        : 'var(--primary-color, #E7B242)',
                    },
                    boxShadow: tabValue === "active" ? 'none' : 'none',
                  }}
                >
                  Active
                </Button>
                <Button
                  variant={tabValue === "pending" ? "contained" : "outlined"}
                  onClick={() => handleTabChange("pending")}
                  sx={{
                    fontSize: '14px',
                    minHeight: 30,
                    padding: '4px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backgroundColor: tabValue === "pending"
                      ? 'var(--primary-color, #E7B242)'
                      : 'transparent',
                    color: tabValue === "pending"
                      ? '#ffffff'
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: tabValue === "pending"
                      ? 'var(--primary-color, #E7B242)'
                      : 'rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                      backgroundColor: tabValue === "pending"
                        ? 'var(--primary-color, #E7B242)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: tabValue === "pending"
                        ? '#ffffff'
                        : 'var(--primary-color, #E7B242)',
                      borderColor: tabValue === "pending"
                        ? 'var(--primary-color, #E7B242)'
                        : 'var(--primary-color, #E7B242)',
                    },
                    boxShadow: tabValue === "pending" ? 'none' : 'none',
                  }}
                >
                  Inactive
                </Button>
                <Button
                  variant={tabValue === "editable" ? "contained" : "outlined"}
                  onClick={() => handleTabChange("editable")}
                  sx={{
                    fontSize: '14px',
                    minHeight: 30,
                    padding: '4px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backgroundColor: tabValue === "editable"
                      ? 'var(--primary-color, #E7B242)'
                      : 'transparent',
                    color: tabValue === "editable"
                      ? '#ffffff'
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: tabValue === "editable"
                      ? 'var(--primary-color, #E7B242)'
                      : 'rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                      backgroundColor: tabValue === "editable"
                        ? 'var(--primary-color, #E7B242)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: tabValue === "editable"
                        ? '#ffffff'
                        : 'var(--primary-color, #E7B242)',
                      borderColor: tabValue === "editable"
                        ? 'var(--primary-color, #E7B242)'
                        : 'var(--primary-color, #E7B242)',
                    },
                    boxShadow: tabValue === "editable" ? 'none' : 'none',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Edit Request</span>
                    <Box
                      sx={{
                        minWidth: '24px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: tabValue === "editable" ? '#ffffff' : '#ff5252',
                        color: tabValue === "editable" ? 'var(--primary-color, #E7B242)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '0 6px',
                      }}
                    >
                      {editablePagination?.totalDocs || 0}
                    </Box>
                  </Box>
                </Button>
              </Box>

              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                {tabValue !== 'editable' && (
                  <Button
                    variant="contained"
                    startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <BsDownload />}
                    size="small"
                    disabled={exportLoading || uploadLoading || astroLoading}
                    sx={{
                      fontSize: '13px',
                      px: 2,
                      py: 0.75,
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }
                    }}
                    onClick={handleExport}
                  >
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  disabled={uploadLoading || exportLoading || astroLoading}
                  sx={{
                    fontSize: '13px',
                    px: 2,
                    py: 0.75,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }
                  }}
                  onClick={triggerFileSelect}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload CSV'}
                </Button>

                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <Tooltip title="Download CSV Format">
                  <IconButton
                    size="small"
                    onClick={handleDownloadCSVFormat}
                    sx={{
                      color: '#7B1FA2',
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: 'rgba(123, 31, 162, 0.08)',
                        borderColor: '#7B1FA2',
                      },
                    }}
                  >
                    <MdOutlineInfo size={18} />
                  </IconButton>
                </Tooltip>

                {(tabValue === 'active' || tabValue === 'pending') && (
                  <TextField
                    label="Search Astrologers..."
                    variant="outlined"
                    size="small"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    sx={{
                      width: '240px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontSize: '13px',
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '13px',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </div>
        </div>

        <div className="row g-0">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div className="card-body" style={{ padding: 0 }}>
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
                  '& .MuiDataGrid-footerContainer': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                }}>
                  <DataGrid
                    loading={astroLoading}
                    columns={columns}
                    rows={rows}
                    disableRowSelectionOnClick
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={setColumnVisibilityModel}
                    paginationMode="server"
                    hideFooterPagination
                    getRowId={(row) => isEditableTab ? row.requestId : row.id}
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
                  count={currentPagination?.totalDocs || 0}
                  page={currentPaginationModel.page}
                  onPageChange={(event, newPage) => handleChangePage(event, newPage, isEditableTab)}
                  rowsPerPage={currentPaginationModel.pageSize}
                  onRowsPerPageChange={(event) => handleChangeRowsPerPage(event, isEditableTab)}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelRowsPerPage="Rows per page:"
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
        <DialogTitle>Delete Astrologer</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete this astrologer?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={actionLoading.delete}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading.delete}
            startIcon={actionLoading.delete ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {actionLoading.delete ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop Loader - Shows when any API call is in progress */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={astroLoading || uploadLoading || exportLoading || Object.values(actionLoading).some(loading => loading)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" size={60} />
          <Box sx={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#fff',
            textAlign: 'center'
          }}>
            {uploadLoading && 'Uploading astrologers...'}
            {exportLoading && 'Exporting data...'}
            {actionLoading.delete && 'Deleting astrologer...'}
            {astroLoading && !uploadLoading && !exportLoading && !actionLoading.delete && 'Loading astrologers...'}
            {Object.values(actionLoading).some(loading => loading) && !uploadLoading && !exportLoading && !actionLoading.delete && !astroLoading && 'Processing...'}
          </Box>
        </Box>
      </Backdrop>
    </div>
  );
}

export default AstrologerList;