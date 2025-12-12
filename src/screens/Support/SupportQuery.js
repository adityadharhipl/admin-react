import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, } from "@mui/material";
import axios from "axios";
import { Button } from "react-bootstrap";
import { fetchCustomerSupport } from "../../Redux/Reducers/SupportQueryReducer";

function SupportQuery() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const Query = useSelector((state) => state?.SupportQueryReducer?.queries);
  const loading = useSelector((state => state?.QueryReducer?.loading));

  const [filterModel, setFilterModel] = useState({
    items: [],
    quickFilterExcludeHiddenColumns: true,
    quickFilterValues: [""],
  });

  useEffect(() => {
    dispatch(fetchCustomerSupport())
  }, [dispatch]);

  const rows = Array.isArray(Query.data) ? Query.data?.map((item, index) => {
    return {
      sono: index + 1,
      name: item?.name ?? '-',
      mobile: item?.mobile ?? '-',
      email: item?.email ?? '-',
      description: item?.description ?? '-',
      _id: item?._id
    };
  }) : [];

  function deleteCategory(id) {
    const token = localStorage.getItem("User-admin-token");

    axios.delete(`${process.env.REACT_APP_BASEURL}/admin/customerSupport/${id}`, {
      headers: {
        Authorization: token,
      }
    })
      .then(response => {
        if (response.data.statusCode) {
          dispatch(fetchCustomerSupport());
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  const handleClickOpen = (id) => {
    setSelectedUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    if (selectedUserId) {
      const userToDelete = Query?.data?.find(row => row._id === selectedUserId);
      if (userToDelete && userToDelete._id) {
        deleteCategory(userToDelete._id);
      }
    }
    setOpen(false);
  };

  const columns = [
    { field: "sono", headerName: "S.No", width: 100 },
    { field: "name", headerName: "Name", width: 160 },
    { field: "mobile", headerName: "Mobile No.", width: 160 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "description", headerName: "Description", width: 160 },
    // { field: "tutorsName", headerName: "Tutors Name", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <div>
          <IconButton component={Link} to={process.env.PUBLIC_URL + `/supportqueryview/${row?._id}`}>
            <i className="icofont-eye text-danger"></i>
          </IconButton>
          <IconButton component={Link} onClick={() => handleClickOpen(row?._id)}>
            <i className="icofont-ui-delete text-danger"></i>
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <div className="row g-0 mb-3">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <div
                  id="myDataTable_wrapper"
                  className="dataTables_wrapper dt-bootstrap5 no-footer"
                >
                  <div className="row">
                    <div className="col-sm-12">
                      <Box sx={{ width: 1 }}>
                        <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loading ? (
                            <CircularProgress />
                          ) : (
                            <DataGrid
                              columns={columns}
                              rows={rows}
                              getRowId={(row) => row._id}
                              disableColumnFilter
                              disableDensitySelector
                              slots={{ toolbar: GridToolbar }}
                              filterModel={filterModel}
                              onFilterModelChange={(newModel) =>
                                setFilterModel(newModel)
                              }
                              slotProps={{ toolbar: { showQuickFilter: true } }}
                              columnVisibilityModel={columnVisibilityModel}
                              onColumnVisibilityModelChange={(newModel) =>
                                setColumnVisibilityModel(newModel)
                              }
                            />
                          )}
                        </Box>
                      </Box>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{"Delete Confirmation"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this  record?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={() => {
              handleDelete();
            }} color="primary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default SupportQuery;