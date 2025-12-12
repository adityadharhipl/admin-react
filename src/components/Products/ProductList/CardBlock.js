import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, FormControlLabel, Switch } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../Redux/Reducers/ProductReducer';
import toast from 'react-hot-toast';

function CardBlock() {
    const dispatch = useDispatch();
    const products = useSelector((state) => state?.ProductReducer?.products);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchProducts(localData?._id));
    }, [dispatch]);

    const rows = Array.isArray(products) ? products.map((item, index) => {
        return {
            id: index + 1,
            productName: item?.productName,
            subCategoryName: item?.subCategoryId?.subCategoryName ?? "-",
            categoryName: item?.categoryId?.categoryName,
            productTagName: item?.productName,
            attribute: item?.productVariants?.map(item => item?.attributes?.map(e => e?.attribute?.label)),
            value: item?.productVariants?.map(item => item?.attributes?.map(e => e?.value?.map(val => val?.label))).join(', '),
            quantity: item?.productVariants?.map(e => e?.minOrderQuantity),
            retailPrice: item?.productVariants?.map(e => e?.retailPrice).join(', '),
            salePrice: item?.productVariants?.map(e => e?.salePrice).join(', '),
            inventory: item?.productVariants?.map(e => e?.inventory).join(', '),
            visibilityStatus: item?.visibilityStatus,
            status: true,
            _id: item?._id
        };
    }) : [];

    function deleteProduct(id) {
        axios.delete(`${process.env.REACT_APP_BASEURL}/product`, { params: { id } })
            .then(response => {
                if (response.data.status) {
                    dispatch(fetchProducts(localData?._id));
                }
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
                deleteProduct(userToDelete._id);
            }
        }
        setOpen(false);
    };

    function disableProduct(id) {
        axios.patch(`${process.env.REACT_APP_BASEURL}/product-disabled?id=${id}`)
            .then(response => {
                if (response.data.status) {
                    toast.success(response?.data?.message);
                    dispatch(fetchProducts(localData?._id));
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'productName', headerName: 'Product Name', width: 150 },
        { field: 'categoryName', headerName: 'Category Name', width: 150 },
        { field: 'subCategoryName', headerName: 'Sub Category Name', width: 150 },
        { field: 'attribute', headerName: 'Attribute', width: 150 },
        { field: 'productTagName', headerName: 'Product Tag Name', width: 150 },
        { field: 'value', headerName: 'Attribute Value', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 150 },
        { field: 'retailPrice', headerName: 'Retail Price', width: 150 },
        { field: 'salePrice', headerName: 'Sale Price', width: 150 },
        { field: 'inventory', headerName: 'Inventory', width: 150 },
        {
            field: "status",
            headerName: "Status",
            width: 100,
            renderCell: ({ row }) => (
                <div>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={row?.visibilityStatus}
                                onChange={() => disableProduct(row?._id)}
                                inputProps={{ "aria-label": "controlled" }}
                            />
                        }
                        label=""
                    />
                </div>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={process.env.PUBLIC_URL + `/product-edit/${row?._id}`}>
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