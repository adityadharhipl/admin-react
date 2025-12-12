"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import * as XLSX from "xlsx";
import axios from "axios";
import PageHeader1 from "../../components/common/PageHeader1";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffers, deleteOffer } from "../../Redux/Reducers/AddOfferReducer";

const ListOffer = () => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const dispatch = useDispatch();
  const { ListOffer, status, error } = useSelector((state) => state.AddOfferReducer.offers || []);
  const ListOffers = useSelector((state) => state.AddOfferReducer.offers || []);
  const pagination = useSelector((state) => state?.AddOfferReducer?.pagination || {});
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    let limit = Number(pageSize);
    if (isNaN(limit)) {
      limit = pagination?.totalDocs || 10000;
    }
    dispatch(fetchOffers({
      page: page + 1,
      limit: limit,
      search: searchQuery,
      startDate: startDate,
      endDate: endDate,
    }));
  }, [paginationModel.page, paginationModel.pageSize, searchQuery, startDate, endDate, dispatch]);


  const handleClickOpen = (offerId) => {
    setSelectedOfferId(offerId);
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
      const token = localStorage.getItem("User-admin-token");
      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const params = new URLSearchParams({
        page: '1',
        limit: '10000',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/offer?${params.toString()}`,
        { headers: { 'Authorization': token } }
      );

      const offersData = response.data?.data || [];

      if (offersData.length === 0) {
        return;
      }

      const exportData = offersData.map((item, index) => ({
        'S.No': index + 1,
        'Offer Title': item?.offerTitle || '',
        'Discount Type': item?.discountType || '',
        'Applicable Value': item?.applicableValue || '',
        'Created At': item?.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        'Updated At': item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Offers');

      const columnWidths = [
        { wch: 8 },
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 25 },
        { wch: 25 },
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.writeFile(workbook, 'offers_export.xlsx');
      toast.success('Offers exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export offers');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    setLoading(true);
    dispatch(deleteOffer(selectedOfferId))
      .unwrap()
      .then(() => {
        toast.success("Offer deleted successfully!");
        const { page, pageSize } = paginationModel;
        let limit = Number(pageSize);
        if (isNaN(limit)) {
          limit = pagination?.totalDocs || 10000;
        }
        dispatch(fetchOffers({
          page: page + 1,
          limit: limit,
          search: searchQuery,
          startDate: startDate,
          endDate: endDate,
        }));
      })
      .catch((err) => {
        toast.error(`Error: ${err}`);
      })
      .finally(() => {
        setLoading(false);
        handleClose();
      });
  };


  const rows = useMemo(() => {
    const pageSize = paginationModel.pageSize;
    return ListOffers?.map((offer, index) => ({
      sono: paginationModel.page * pageSize + index + 1,
      id: offer._id,
      offerTitle: offer.offerTitle,
      discountType: offer.discountType,
      applicableValue: offer.applicableValue,
      createdAt: offer?.createdAt ? new Date(offer?.createdAt) : null,
      updatedAt: offer?.updatedAt ? new Date(offer?.updatedAt) : null,
    })) || [];
  }, [ListOffers, paginationModel]);

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
            to={`/offer-edit/${row?.id}`}
            title="Edit Offer"
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
            title="Delete Offer"
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
    { field: "offerTitle", headerName: "Offer Name", width: 250 },
    { field: "discountType", headerName: "Discount Type", width: 150 },
    { field: "applicableValue", headerName: "Value", width: 150 },
    { field: "createdAt", headerName: "Created At", width: 200, type: 'dateTime' },
    { field: "updatedAt", headerName: "Updated At", width: 200, type: 'dateTime' },
  ];

  return (
    <div className="body d-flex">
      <Toaster />
      <div className="container-xxl">
        <PageHeader1 righttitle="Add Offer" link="/offer-add" routebutton={true} pagetitle='Offer List' />

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
                placeholder="Search offers..."
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

              <Button
                variant="contained"
                onClick={exportToExcel}
                disabled={isExporting}
                startIcon={isExporting ? <CircularProgress size={16} /> : null}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  ml: 'auto',
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
                    loading={status === "loading"}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    hideFooterPagination
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) =>
                      setColumnVisibilityModel(newModel)
                    }
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this offer?
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
};

export default ListOffer;


