"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLanguages } from "../../Redux/Reducers/LanguageReducer";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import PageHeader1 from "../../components/common/PageHeader1";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function LanguageList() {
  const dispatch = useDispatch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const languageData = useSelector((state) => state?.LanguageReducer?.languages);
  const pagination = useSelector((state) => state?.LanguageReducer?.pagination);
  const languageLoading = useSelector((state) => state?.LanguageReducer?.loading);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});


  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = pagination?.totalDocs || 10000;
    }
    dispatch(fetchLanguages({ page: page + 1, limit: limit }));
  }, [paginationModel.page, paginationModel.pageSize, dispatch]);

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

  const handleDelete = async () => {
    setLoading(true);
    const token = localStorage.getItem("User-admin-token");

    try {
      await axios.delete(`${process.env.REACT_APP_BASEURL}/admin/language/${selectedUserId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      toast.success("Language deleted successfully!");

      const { page, pageSize } = paginationModel;
      let limit = Number(pageSize);
      if (isNaN(limit)) {
        limit = pagination?.totalDocs || 10000;
      }
      dispatch(fetchLanguages({ page: page + 1, limit: limit }));
    } catch (error) {
      toast.error("Failed to delete language. Please try again.");
    } finally {
      setLoading(false);
      handleClose();
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
            to={`/language-edit/${row?.id}`}
            title="Edit Language"
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
            title="Delete Language"
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
    { field: "name", headerName: "Language Name", width: 250 },
    { field: "createdAt", headerName: "Created At", width: 200, type: 'dateTime' },
    { field: "updatedAt", headerName: "Updated At", width: 200, type: 'dateTime' },
  ];

  const rows = languageData?.map((language, index) => {
    const pageSize = paginationModel.pageSize;
    return {
      sono: paginationModel.page * pageSize + index + 1,
      id: language._id,
      name: language.languageName,
      createdAt: language?.createdAt ? new Date(language?.createdAt) : null,
      updatedAt: language?.updatedAt ? new Date(language?.updatedAt) : null,
    };
  }) || [];

  return (
    <div className="body d-flex">
      <Toaster />
      <div className="container-xxl">
        <PageHeader1 righttitle="Add Language" link="/language-add" routebutton={true} pagetitle='Language List' />
        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div className="card-body" style={{ padding: 0, position: 'relative' }}>
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
                    columns={columns}
                    rows={rows}
                    loading={languageLoading}
                    disableSelectionOnClick
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) =>
                      setColumnVisibilityModel(newModel)
                    }
                    paginationMode="server"
                    hideFooterPagination
                    getRowId={(row) => row.id}
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this language?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LanguageList;
