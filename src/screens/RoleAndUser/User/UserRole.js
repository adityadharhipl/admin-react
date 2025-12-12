import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  TextField,
  TablePagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import PageHeader1 from "../../../components/common/PageHeader1";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { fetchUsers } from "../../../Redux/Reducers/UserRoleReducer";

const UserRole = () => {
  const dispatch = useDispatch();
  const { users, loading, pagination } = useSelector((state) => state.UserRoleReducer || {});

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = pagination?.totalDocs || 10000;
    }
    dispatch(fetchUsers({
      page: page + 1,
      limit: limit,
      search: searchQuery,
      startDate: startDate,
      endDate: endDate,
    }));
  }, [paginationModel.page, paginationModel.pageSize, searchQuery, startDate, endDate, dispatch]);

  const handleClickOpen = (userId) => {
    setSelectedUserId(userId);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("User-admin-token");
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/admin/adminUser/${selectedUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete user");

      toast.success("User deleted successfully!");
      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = pagination?.totalDocs || 10000;
      }
      dispatch(fetchUsers({
        page: page + 1,
        limit: limit,
        search: searchQuery,
        startDate: startDate,
        endDate: endDate,
      }));
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return users?.map((user, index) => ({
      id: user._id,
      sono: paginationModel.page * pageSize + index + 1,
      name: user.fullName,
      phone: user.mobileNumber,
      email: user.email,
      role: user.role?.roleName || "N/A",
      createdAt: user.createdAt ? new Date(user.createdAt) : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
    })) || [];
  }, [users, paginationModel]);

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
            to={`/user-role-edit/${row?.id}`}
            title="Edit User"
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
            onClick={() => handleClickOpen(row?.id)}
            title="Delete User"
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
    { field: "name", headerName: "Name", width: 200 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "role", headerName: "Role", width: 150 },
    { field: "createdAt", headerName: "Created At", width: 200, type: 'dateTime' },
    { field: "updatedAt", headerName: "Updated At", width: 200, type: 'dateTime' },
  ];

  return (
    <div className="body d-flex">
      <Toaster />
      <div className="container-xxl">
        <PageHeader1
          righttitle="Add User Role"
          link="/user-role-add"
          routebutton={true}
          pagetitle="User Role List"
        />

        {/* Toolbar with Filters */}
        <div className="card mb-3" style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: 'none'
        }}>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPaginationModel((prev) => ({ ...prev, page: 0 }));
                }}
                sx={{
                  minWidth: '200px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                placeholder="Search users..."
              />

              {/* <TextField
                label="Start Date"
                type="date"
                variant="outlined"
                size="small"
                value={startDate || ''}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPaginationModel((prev) => ({ ...prev, page: 0 }));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: '180px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    paddingRight: '10px',
                  }
                }}
              />

              <TextField
                label="End Date"
                type="date"
                variant="outlined"
                size="small"
                value={endDate || ''}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPaginationModel((prev) => ({ ...prev, page: 0 }));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: '180px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    paddingRight: '10px',
                  }
                }}
              /> */}

              <Button
                variant="outlined"
                onClick={handleResetFilter}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
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
                    loading={loading}
                    columns={columns}
                    rows={rows}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    hideFooterPagination
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={setColumnVisibilityModel}
                    disableSelectionOnClick
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
                  count={pagination?.totalDocs || 0}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserRole;
