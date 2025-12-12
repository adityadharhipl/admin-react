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
  fetchUserTickets,
  deleteUserTicket,
} from "../../Redux/Reducers/UserTicketReducer";
import socket from "../../socket/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';
import axios from 'axios';

function UserSupportList() {
  const dispatch = useDispatch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const pagination = useSelector((state) => state?.UserTicketReducer?.pagination) || {};
  const ticketData = useSelector((state) => state.UserTicketReducer?.data || []);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("open");
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const senderData = JSON.parse(localStorage.getItem("User-admin-data"));
    const senderId = senderData?._id;

    function onConnect() {
      setIsConnected(true);
      if (senderId) {
        socket.emit("new user", senderId);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleNewTicket = () => {
      if (activeTab === "open") {
        toast.success("A new ticket has arrived! Refreshing list...");
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = 10000;
        }
        dispatch(fetchUserTickets({
          page: page + 1,
          limit,
          status: "active",
          userType: "user",
          search: searchQuery || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }));
      }
    };

    socket.on("new ticket", handleNewTicket);
    return () => socket.off("new ticket", handleNewTicket);
  }, [dispatch, activeTab, paginationModel, searchQuery, startDate, endDate]);

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = 10000;
    }
    const status = activeTab === "open" ? "active" : "close";
    dispatch(fetchUserTickets({
      page: page + 1,
      limit,
      status,
      userType: "user",
      search: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }));
  }, [paginationModel, dispatch, activeTab, searchQuery, startDate, endDate]);

  const handleClickOpen = (ticketId) => {
    setSelectedTicketId(ticketId);
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
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("User-admin-token");
      const params = new URLSearchParams();
      const status = activeTab === "open" ? "active" : "close";

      params.append('status', status);
      params.append('userType', 'user');
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${process.env.REACT_APP_BASEURL}/admin/ticket?${params.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: token },
      });

      const data = response.data?.data || [];
      const exportData = data.map((item, index) => ({
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
      XLSX.utils.book_append_sheet(wb, ws, 'User Tickets');
      XLSX.writeFile(wb, `User_Tickets_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTicketId) {
      await dispatch(deleteUserTicket(selectedTicketId));
      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = 10000;
      }
      const status = activeTab === "open" ? "active" : "close";
      dispatch(fetchUserTickets({
        page: page + 1,
        limit,
        status,
        userType: "user",
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }));
    }
    setOpen(false);
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
          <IconButton
            size="small"
            component={Link}
            to={`/user-chat/${row.id}`}
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
    return Array.isArray(ticketData) ?
      ticketData.map((ticket, index) => ({
        id: ticket?._id || index.toString(),
        sono: paginationModel.page * paginationModel.pageSize + index + 1,
        userName: ticket?.fullName || '-',
        email: ticket?.email || '-',
        phoneNumber: ticket?.mobile || '-',
        feedback: ticket?.description || '-',
        ticketId: ticket?.ticketId || '-',
        status: ticket?.status === "active" ? "Open" : "Closed",
        createdAt: ticket?.createdAt ? new Date(ticket?.createdAt) : null,
        updatedAt: ticket?.updatedAt ? new Date(ticket?.updatedAt) : null,
      }))
      : [];
  }, [ticketData, paginationModel]);

  const loading = useSelector((state) => state?.UserTicketReducer?.status === 'loading');

  return (
    <>
      <ToastContainer />
      <div className="body d-flex">
        <div className="container-xxl">
          <PageHeader1 pagetitle="User Ticket List" />

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
                <div className="card-body" style={{ padding: '20px' }}>
                  {/* Custom Toolbar */}
                  <Box sx={{
                    mb: 2,
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}>
                    <TextField
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
              Are you sure you want to delete this user support ticket?
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

export default UserSupportList;
