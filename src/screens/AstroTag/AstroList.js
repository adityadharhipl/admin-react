import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader1 from "../../components/common/PageHeader1";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Button } from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";

function AstroTagList() {
  const [tags, setTags] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalTags, setTotalTags] = useState(0);

  const [open, setOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const [filterModel, setFilterModel] = useState({
    items: [],
    quickFilterExcludeHiddenColumns: true,
    quickFilterValues: [""],
  });

  const token = localStorage.getItem("User-admin-token");

  const fetchTags = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/tag`,
        {
          headers: { Authorization: token },
        }
      );
      const data = response?.data?.data || [];
      setTags(data);
      setTotalTags(data.length);
    } catch (err) {
      toast.error("Failed to fetch tags");
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASEURL}/admin/tag/${selectedTagId}`,
        {
          headers: { Authorization: token },
        }
      );
      toast.success("Tag deleted successfully");
      fetchTags(); // Refresh list
    } catch (error) {
      toast.error("Failed to delete tag");
    }
    setOpen(false);
  };

  const handleClickOpen = (id) => {
    setSelectedTagId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const paginatedRows = tags
    .slice(
      paginationModel.page * paginationModel.pageSize,
      (paginationModel.page + 1) * paginationModel.pageSize
    )
    .map((item, index) => ({
      id: paginationModel.page * paginationModel.pageSize + index + 1,
      tagName: item?.tagName || "-",
      createdAt: item?.createdAt
        ? new Date(item?.createdAt).toLocaleString()
        : "",
      updatedAt: item?.updatedAt
        ? new Date(item?.updatedAt).toLocaleString()
        : "",
      _id: item?._id,
    }));

  const columns = [
    { field: "id", headerName: "S.No", width: 70 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <div>
          <IconButton
            style={{ fontSize: '1.2rem' }}
            component={Link}
            to={`/tag-edit/${row._id}`}
            title="Edit"
          >
            <i className="icofont-edit text-danger"></i>
          </IconButton>
          <IconButton style={{ fontSize: '1.2rem' }} onClick={() => handleClickOpen(row._id)} title="Delete">
            <i className="icofont-ui-delete text-danger"></i>
          </IconButton>
        </div>
      ),
    },
    { field: "tagName", headerName: "Tag Name", width: 200 },
    { field: "createdAt", headerName: "Created At", width: 200 },
    { field: "updatedAt", headerName: "Updated At", width: 200 },

  ];

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1
          pagetitle="Astro Tag List"
          righttitle="Add Astro Tag"
          link="/tag-add"
          routebutton={true}
        />
        <div className="row g-0 mb-3 mt-1">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    columns={columns}
                    rows={paginatedRows}
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
                    paginationMode="server"
                    rowCount={totalTags}
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                  />
                </Box>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this tag?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="danger" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default AstroTagList;
