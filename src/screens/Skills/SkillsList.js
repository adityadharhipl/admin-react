import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';
import { fetchCategory } from '../../Redux/Reducers/CategoryReducer';
import { useDispatch, useSelector } from 'react-redux';

function SkillsList() {
    const dispatch = useDispatch();
    const { category, loading } = useSelector((state) => state?.CategoryReducer || {});

    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        dispatch(fetchCategory());
    }, [dispatch])

    async function deleteCategory(id) {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASEURL}/categories/${id}/`);
            if (response.status === 204) {
                dispatch(fetchCategory());
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        if (selectedUserId) {
            deleteCategory(selectedUserId);
        }
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 300 },
        { field: 'name', headerName: 'Category Name', width: 350 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={process.env.PUBLIC_URL + `/skills-edit/${row?._id}`}>
                        <i className="icofont-edit text-danger"></i>
                    </IconButton>
                    <IconButton component="button"
                        onClick={() => {
                            handleClickOpen(row._id)
                        }}>
                        <i className="icofont-ui-delete text-danger"></i>
                    </IconButton>
                </div >
            ),
        },
    ];

    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1 righttitle='Add Skills' link='/skills-add' routebutton={true} />
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <div id="myDataTable_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Box sx={{ width: 1 }}>
                                                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    {/* {loading ? (
                                                        <CircularProgress />
                                                    ) : ( */}
                                                    <DataGrid
                                                        columns={columns}
                                                        rows={category?.results?.map((item, index) => ({
                                                            id: index + 1,
                                                            name: item?.name,
                                                            _id: item?._id
                                                        })) || []}
                                                        disableColumnFilter
                                                        disableDensitySelector
                                                        slots={{ toolbar: GridToolbar }}
                                                        filterModel={filterModel}
                                                        onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                                        slotProps={{ toolbar: { showQuickFilter: true } }}
                                                        columnVisibilityModel={columnVisibilityModel}
                                                        onColumnVisibilityModelChange={(newModel) =>
                                                            setColumnVisibilityModel(newModel)
                                                        }
                                                    />
                                                    {/* )} */}
                                                </Box>
                                            </Box>
                                        </div>
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
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Delete Confirmation"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this user?
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
    );
}

export default SkillsList;