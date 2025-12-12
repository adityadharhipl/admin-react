import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchService } from '../../../Redux/Reducers/ServiceReducer';

function CardBlock() {
    const dispatch = useDispatch();
    const services = useSelector((state) => state?.ServiceReducer?.services);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchService(localData?._id));
    }, [dispatch]);

    const rows = Array.isArray(services?.result) ? services?.result?.map((item, index) => {
        return {
            id: index + 1,
            serviceName: item?.serviceName,
            categoryName: item?.categoryId?.categoryName,
            subCategoryName: item?.subCategoryId?.subCategoryName,
            attribute: item?.attributeId?.map(item => item?.attributeName),
            regularPrice: item?.regularPrice ?? "-",
            salesPrice: item?.salesPrice ?? "-",
            discount: item?.discount ?? "-",
            status: true,
            _id: item?._id
        };
    }) : [];

    function deleteService(id) {
        axios.delete(`${process.env.REACT_APP_BASEURL}/service`, {
            params: { id }
        })
            .then(response => {
                dispatch(fetchService(localData?._id));
            })
            .catch(error => {
                console.log(error);
            });
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
            const userToDelete = rows.find(row => row.id === selectedUserId);
            if (userToDelete && userToDelete._id) {
                deleteService(userToDelete._id);
            }
        }
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'serviceName', headerName: 'Service Name', width: 150 },
        { field: 'categoryName', headerName: 'Category Name', width: 150 },
        { field: 'subCategoryName', headerName: 'Sub Category Name', width: 150 },
        { field: 'attribute', headerName: 'Attribute', width: 150 },
        { field: 'regularPrice', headerName: 'Regular Price', width: 150 },
        { field: 'salesPrice', headerName: 'Sale Price', width: 150 },
        { field: 'discount', headerName: 'Discount', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={process.env.PUBLIC_URL + `/service-edit/${row?._id}`}>
                        <i className="icofont-edit text-danger"></i>
                    </IconButton>
                    <IconButton component="button"
                        onClick={() => {
                            handleClickOpen(row.id)
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
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <div id="myDataTable_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Box sx={{ width: 1 }}>
                                                <Box sx={{ height: 400 }}>
                                                    <DataGrid
                                                        columns={columns}
                                                        rows={rows}
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

export default CardBlock;