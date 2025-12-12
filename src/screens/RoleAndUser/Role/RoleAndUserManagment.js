import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  TablePagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "../../../Redux/Reducers/RoleReducer";
import PageHeader1 from "../../../components/common/PageHeader1";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// =========================================================================
// THE FIX: Import `allRoutes` to map child routes back to parent categories for display.
// IMPORTANT: Adjust the import path `../../MainIndex` based on your project's folder structure.
// =========================================================================
import { allRoutes } from "../../MainIndex";

// This map provides the display names for the parent categories
const privilegeLabelMap = {
  "/dashboard": "Dashboard",
  "/app-management": "App Management",
  "/astrologer-management": "Astrologer Management",
  "/astrologer-support-operations": "Astrologer Support & Operations",
  "/user-support-operations": "User Support & Operations",
  "/product-management": "Product Management",
  "/admin": "Admin",
  "/cms": "CMS",
  "/reports": "Reports",
};

function RolePrivilegeList() {
  const dispatch = useDispatch();
  const { roles = [], loading, pagination } = useSelector((state) => state?.RoleReducer || {});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const token = localStorage.getItem('User-admin-token');

  // This map is used for the data grid display logic.
  const childToParentMap = useMemo(() => {
    const map = {};
    allRoutes.forEach(route => {
      map[route.path] = route.category;
    });
    return map;
  }, []);

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = pagination?.totalDocs || 10000;
    }
    dispatch(fetchRoles({
      page: page + 1,
      limit: limit,
      search: searchQuery,
      startDate: startDate,
      endDate: endDate,
    }));
  }, [paginationModel.page, paginationModel.pageSize, searchQuery, startDate, endDate, dispatch]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASEURL}/admin/role/${selectedId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Role deleted successfully");
      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = pagination?.totalDocs || 10000;
      }
      dispatch(fetchRoles({
        page: page + 1,
        limit: limit,
        search: searchQuery,
        startDate: startDate,
        endDate: endDate,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete role");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedId(null);
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

  const columns = [
    {
      field: "sno",
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
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton
            size="small"
            component={Link}
            to={`/useree/${row?.id}`} // Correct link to the edit page
            title="Edit Role"
            sx={{
              color: '#1976d2',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
            }}
          >
            <i className="icofont-edit" style={{ fontSize: '18px' }}></i>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(row?.id)}
            title="Delete Role"
            sx={{
              color: '#d32f2f',
              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
            }}
          >
            <i className="icofont-ui-delete" style={{ fontSize: '18px' }}></i>
          </IconButton>
        </Box>
      ),
    },
    { field: "roleName", headerName: "Role Name", width: 250 },
    {
      field: "privileges",
      headerName: "Privileges",
      flex: 1,
      minWidth: 300,
      // This logic now shows clean parent category names in the list
      renderCell: (params) => {
        const parentPrivileges = new Set();
        if (params.row.privileges && Array.isArray(params.row.privileges)) {
          params.row.privileges.forEach(childRoute => {
            if (childToParentMap[childRoute]) {
              parentPrivileges.add(childToParentMap[childRoute]);
            }
          });
        }
        const privilegesToShow = Array.from(parentPrivileges);

        return (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", py: 1 }}>
            {privilegesToShow.slice(0, 3).map((priv, idx) => (
              <Chip
                key={idx}
                label={privilegeLabelMap[priv] || priv}
                size="small"
                color="primary"
                sx={{ fontSize: '12px', height: '24px' }}
              />
            ))}
            {privilegesToShow.length > 3 && (
              <Chip
                label={`+${privilegesToShow.length - 3} more`}
                size="small"
                color="default"
                sx={{ fontSize: '12px', height: '24px' }}
              />
            )}
          </Box>
        )
      },
    },
  ];

  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return roles.map((role, index) => ({
      id: role._id,
      sno: paginationModel.page * pageSize + index + 1,
      roleName: role.roleName,
      privileges: role.privileges || [],
    }));
  }, [roles, paginationModel]);

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1
          righttitle="Add Role"
          link="/addrole"
          routebutton={true}
          pagetitle="Role Privileges"
          classNamembg="mb-3"
        />

        {/* Toolbar with Filters */}
        {/* <div className="card mb-3" style={{
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
                placeholder="Search roles..."
              />

              <TextField
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
              />

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
        </div> */}

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
                  '& .MuiDataGrid-root': { border: 'none' },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef', fontWeight: 600 },
                  '& .MuiDataGrid-footerContainer': { display: 'none' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: '#f8f9fa' },
                }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    hideFooterPagination
                    loading={loading}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                      '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this role?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RolePrivilegeList;