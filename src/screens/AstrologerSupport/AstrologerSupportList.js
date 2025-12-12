import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import PageHeader1 from "../../components/common/PageHeader1";
import {
  fetchAstroTickets,
  deleteAstroTicket,
} from "../../Redux/Reducers/AstroTicketReducer";
import socket from "../../socket/socket";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import axios from 'axios';

function AstrologerSupportList() {
  const dispatch = useDispatch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const pagination = useSelector((state) => state?.AstroTicketReducer?.pagination) || {};
  const DataAstro = useSelector((state) => state.AstroTicketReducer?.data || []);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("open");
  const [isConnected, setIsConnected] = useState(socket.connected);


  useEffect(() => {

    const senderData = JSON.parse(localStorage.getItem("User-admin-data"));
    const senderId = senderData?._id;

    function onConnect() {
      setIsConnected(true);
      // console.log("Socket connected!");
      if (senderId) {
        socket.emit("new user", senderId);

      } else {

      }
    }

    function onDisconnect() {
      setIsConnected(false);
      // console.log(" Socket disconnected!");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      onConnect();
    }


    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);



  useEffect(() => {
    const handleNewTicket = (newTicketData) => {
      if (activeTab === "open") {
        toast.success("A new ticket has arrived! Updating list...");
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10000;
        }
        dispatch(fetchAstroTickets({
          page: page + 1,
          limit,
          status: "active",
          userType: "astro",
          search: searchQuery || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }));
      }
    };

    socket.on('new ticket', handleNewTicket);
    return () => {
      socket.off('new ticket', handleNewTicket);
    };
  }, [dispatch, activeTab, paginationModel, searchQuery, startDate, endDate]);

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    const status = activeTab === "open" ? "active" : "close";
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = 10;
    }
    dispatch(fetchAstroTickets({
      page: page + 1,
      limit,
      status,
      userType: "astro",
      search: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }));
  }, [paginationModel, dispatch, activeTab, searchQuery, startDate, endDate]);

  // Open delete confirmation dialog
  const handleClickOpen = (feedbackId) => {
    setSelectedFeedbackId(feedbackId);
    setOpen(true);
  };

  // Close delete dialog
  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPaginationModel({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const newPageSize = Number(event.target.value);
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("User-admin-token");
      const status = activeTab === "open" ? "active" : "close";
      const params = new URLSearchParams({
        status,
        userType: "astro",
      });

      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${process.env.REACT_APP_BASEURL}/admin/ticket?${params.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: token },
      });

      const allData = response?.data?.data || [];
      const exportData = allData.map((item, index) => ({
        'S.No': index + 1,
        'Ticket Number': item?.ticketId || '-',
        'User Name': item?.fullName || '-',
        'Email': item?.email || '-',
        'Phone Number': item?.mobile || '-',
        'Feedback': item?.description || '-',
        'Status': item?.status === "active" ? "Open" : "Closed",
        'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
        'Updated At': item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Astrologer Tickets');
      XLSX.writeFile(wb, `Astrologer_Tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export successful!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedFeedbackId) {
      await dispatch(deleteAstroTicket(selectedFeedbackId));
      const { page, pageSize } = paginationModel;
      const status = activeTab === "open" ? "active" : "close";
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10;
      }
      dispatch(fetchAstroTickets({
        page: page + 1,
        limit,
        status,
        userType: "astro",
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }));
    }
    setOpen(false);
  };

  const filteredData = useMemo(() => {
    return DataAstro?.filter((feedback) => {
      if (activeTab === "open") {
        return feedback?.status === "active";
      } else if (activeTab === "close") {
        return feedback?.status === "close";
      }
      return false;
    }) || [];
  }, [DataAstro, activeTab]);

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
          <IconButton
            size="small"
            component={Link}
            to={`/AstroSupportChat/${row.id}`}
            title="View Ticket"
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
            onClick={() => handleClickOpen(row.id)}
            title="Delete Ticket"
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
    { field: "ticketId", headerName: "Ticket Number", width: 150 },
    { field: "userName", headerName: "User Name", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    {
      field: "feedback",
      headerName: "Feedback",
      width: 300,
      renderCell: ({ row }) => (
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
          title={row?.feedback || ''}
        >
          {row?.feedback || '-'}
        </Box>
      ),
    },
    { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
    { field: 'updatedAt', headerName: 'Updated At', width: 200, type: 'dateTime' },
  ];

  const rows = useMemo(() => {
    return filteredData?.map((feedback, index) => ({
      id: feedback?._id || index.toString(),
      sono: paginationModel.page * paginationModel.pageSize + index + 1,
      userName: feedback?.fullName || "N/A",
      email: feedback?.email || "N/A",
      phoneNumber: feedback?.mobile || "N/A",
      feedback: feedback?.description || "No feedback provided",
      ticketId: feedback?.ticketId || "N/A",
      status: feedback?.status === "active" ? "Open" : "Closed",
      createdAt: feedback?.createdAt ? new Date(feedback?.createdAt) : null,
      updatedAt: feedback?.updatedAt ? new Date(feedback?.updatedAt) : null,
    })) || [];
  }, [filteredData, paginationModel]);

  const loading = useSelector((state) => state?.AstroTicketReducer?.status === 'loading');

  return (
    <>
      <ToastContainer />
      <div className="body d-flex">
        <div className="container-xxl">
          <PageHeader1 pagetitle="Astrologer Ticket List" />

          {/* Buttons Card */}
          <div className="card mb-3" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: 'none'
          }}>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant={activeTab === "open" ? "contained" : "outlined"}
                  onClick={() => {
                    setActiveTab("open");
                    setPaginationModel({ page: 0, pageSize: 10 });
                    setSearchQuery('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  sx={{
                    fontSize: '14px',
                    minHeight: 30,
                    padding: '4px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backgroundColor: activeTab === "open"
                      ? 'var(--primary-color, #E7B242)'
                      : 'transparent',
                    color: activeTab === "open"
                      ? '#ffffff'
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: activeTab === "open"
                      ? 'var(--primary-color, #E7B242)'
                      : 'rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                      backgroundColor: activeTab === "open"
                        ? 'var(--primary-color, #E7B242)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: activeTab === "open"
                        ? '#ffffff'
                        : 'var(--primary-color, #E7B242)',
                      borderColor: activeTab === "open"
                        ? 'var(--primary-color, #E7B242)'
                        : 'var(--primary-color, #E7B242)',
                    },
                    boxShadow: activeTab === "open" ? 'none' : 'none',
                  }}
                >
                  Open Tickets
                </Button>
                <Button
                  variant={activeTab === "close" ? "contained" : "outlined"}
                  onClick={() => {
                    setActiveTab("close");
                    setPaginationModel({ page: 0, pageSize: 10 });
                    setSearchQuery('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  sx={{
                    fontSize: '14px',
                    minHeight: 30,
                    padding: '4px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    backgroundColor: activeTab === "close"
                      ? 'var(--primary-color, #E7B242)'
                      : 'transparent',
                    color: activeTab === "close"
                      ? '#ffffff'
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: activeTab === "close"
                      ? 'var(--primary-color, #E7B242)'
                      : 'rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                      backgroundColor: activeTab === "close"
                        ? 'var(--primary-color, #E7B242)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: activeTab === "close"
                        ? '#ffffff'
                        : 'var(--primary-color, #E7B242)',
                      borderColor: activeTab === "close"
                        ? 'var(--primary-color, #E7B242)'
                        : 'var(--primary-color, #E7B242)',
                    },
                    boxShadow: activeTab === "close" ? 'none' : 'none',
                  }}
                >
                  Closed Tickets
                </Button>
              </Box>

              {/* Custom Toolbar */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mt: 2,
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }
              }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    minWidth: 200,
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <i className="icofont-search" style={{ fontSize: '18px', color: '#666' }}></i>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  size="small"
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
                    borderRadius: '8px',
                    textTransform: 'none',
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
                    borderRadius: '8px',
                    textTransform: 'none',
                  }}
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </Box>
            </div>
          </div>

          <div className="row g-0 mb-3">
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
                      columns={columns}
                      rows={rows}
                      loading={loading}
                      disableSelectionOnClick
                      paginationMode="server"
                      hideFooterPagination
                      autoHeight
                      getRowId={(row) => row.id}
                      columnVisibilityModel={{}}
                      sx={{
                        '& .MuiDataGrid-cell:focus': {
                          outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                          outline: 'none',
                        },
                      }}
                    />
                    <TablePagination
                      component="div"
                      count={pagination?.totalDocs || 0}
                      page={paginationModel.page}
                      onPageChange={handleChangePage}
                      rowsPerPage={paginationModel.pageSize}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[10, 25, 50]}
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
              Are you sure you want to delete this Astrologer Support ticket?
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
    </>
  );
}

export default AstrologerSupportList;