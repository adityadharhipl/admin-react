import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupon } from '../../Redux/Reducers/CouponReducer';
import PageHeader1 from '../../components/common/PageHeader1';

function CouponsList() {
    const dispatch = useDispatch();
    const coupons = useSelector((state) => state?.CouponReducer?.coupon);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchCoupon(localData?._id));
    }, [dispatch]);

    const sellerCoupons = Array.isArray(coupons) ? coupons?.filter(item => item?.type === "seller") : []

    const rows = Array.isArray(sellerCoupons) ? sellerCoupons.map((item, index) => {
        return {
            id: index + 1,
            couponCodeName: item?.couponCodeName ?? "-",
            productName: item?.productsId?.map(item => item?.productName),
            categoryName: item?.categoryId?.categoryName ?? "-",
            subCategoryName: item?.subCategoryId?.subCategoryName ?? "-",
            discountValue: item?.discountValue ?? "-",
            startDate: item?.startDate ?? "-",
            endDate: item?.endDate ?? "-",
            minOrderVal: item?.minOrderVal ?? "-",
            status: true,
            _id: item?._id
        };
    }) : [];

    function deleteCoupon(id) {
        axios.delete(`${process.env.REACT_APP_BASEURL}/coupon`, {
            params: { id }
        })
            .then(response => {
                dispatch(fetchCoupon(localData?._id));
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
            const userToDelete = rows?.find(row => row.id === selectedUserId);
            if (userToDelete && userToDelete._id) {
                deleteCoupon(userToDelete._id);
            }
        }
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={process.env.PUBLIC_URL + `/coupons-edit/${row?._id}`}>
                        <i className="icofont-edit text-danger"></i>
                    </IconButton>
                    <IconButton component="button"
                        onClick={() => {
                            handleClickOpen(row.id);
                        }}>
                        <i className="icofont-ui-delete text-danger"></i>
                    </IconButton>
                </div>
            ),
        },
        { field: 'couponCodeName', headerName: 'Coupon Code', width: 150 },
        { field: 'productName', headerName: 'Product', width: 150 },
        { field: 'categoryName', headerName: 'Category', width: 150 },
        { field: 'subCategoryName', headerName: 'Sub Category', width: 150 },
        { field: 'discountValue', headerName: 'Discount', width: 150 },
        { field: 'startDate', headerName: 'Start Date', width: 150 },
        { field: 'endDate', headerName: 'End Date', width: 150 },
        { field: 'minOrderVal', headerName: 'Minimum order', width: 150 },

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
                <PageHeader1 pagetitle='Coupon Add' righttitle='Add Coupon' link='/coupons-add' routebutton={true} />
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
    );
}

export default CouponsList;