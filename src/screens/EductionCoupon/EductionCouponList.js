import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteCoupon } from "../../Redux/Reducers/CoupansReducer";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import PageHeader1 from '../../components/common/PageHeader1';

function EductionCoupon() {
    const dispatch = useDispatch();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });


    const [coupons, setCoupons] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("User-admin-token");

        if (!token) {
            setError("Authentication token not found.");
            setStatus("error");
            return;
        }

        fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                setCoupons(data);
                setStatus('success');


                if (data && data.data && data.data.length > 0) {
                    const firstCouponCategory = data.data[0].category;
                    setTabValue(firstCouponCategory === 'flat_off_percentage' ? 1 : 0);
                }
            })
            .catch(err => {
                setError(err.message);
                setStatus('error');
            });
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleDelete = async () => {
        if (!selectedUserId) return;

        try {
            const token = localStorage.getItem("User-admin-token");

            // Dispatch delete action and wait for it to complete
            await dispatch(deleteCoupon(selectedUserId));

            // Fetch updated coupon list after deletion
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon`, {
                method: 'GET',
                headers: {
                    'Authorization': `${token}`,
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch coupons.");
            }

            const data = await response.json();
            setCoupons(data);
            setStatus('success');
        } catch (err) {
            console.error("Error in handleDelete:", err);
            setError(err.message || "Something went wrong");
            setStatus('error');
        } finally {
            setOpen(false);  // Close modal regardless of success/failure
        }
    };




    const filteredCoupons = coupons?.data?.filter(item => {
        if (tabValue === 0) {
            return item.category === 'flat_off_rupees';
        } else if (tabValue === 1) {
            return item.category === 'flat_off_percentage';
        }
        return false;
    });

    const rows = Array.isArray(filteredCoupons)
        ? filteredCoupons.map((item, index) => ({
            id: index + 1,
            _id: item._id,
            couponCode: item?.couponCode,
            category: item?.category,
            discountValue: item?.discountValue,
            validTo: item?.validTo ? new Date(item?.validTo).toLocaleDateString("en-GB")
                : "N/A",
            validFrom: item?.validFrom ? new Date(item?.validFrom).toLocaleDateString("en-GB")
                : "N/A",
            minCartValue: item?.minCartValue,
            discountType: item.discountType,
            createdAt: item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "",
            // updatedAt: item.updatedAt
            //     ? new Date(item.updatedAt).toLocaleString() : ""
        }))
        : [];

    const columns = [
        { field: 'id', headerName: 'S.No', width: 80 },
        { field: 'couponCode', headerName: 'Coupon Code', width: 150 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'discountValue', headerName: 'Discount', width: 150 },
        { field: 'validFrom', headerName: 'Start Date', width: 150 },
        { field: 'validTo', headerName: 'End Date', width: 150 },
        { field: 'minCartValue', headerName: 'Minimum Cart Value', width: 150 },
        { field: 'createdAt', headerName: 'Created At', width: 200 },
        // { field: 'updatedAt', headerName: 'Updated At', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: ({ row }) => (
                <div>
                    {/* <IconButton component={Link} to={`/coupons-edit/${row._id}`}>
                        <i className="icofont-edit text-danger"></i>
                    </IconButton> */}
                    <IconButton onClick={() => handleClickOpen(row._id)}>
                        <i className="icofont-ui-delete text-danger"></i>
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Education Coupon List' righttitle='Add Coupon' link='/educationcoupon-add' routebutton={true} />

                <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="coupon tabs">
                        <Tab label="Flat Rs Discount" />
                        <Tab label="Percent Discount" />
                    </Tabs>
                </Box>

                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                {status === 'loading' && <p>Loading...</p>}
                                {error && <p className="text-danger">Error: {error}</p>}

                                <Box sx={{ height: 400 }}>
                                    <DataGrid
                                        columns={columns}
                                        rows={rows}
                                        disableColumnFilter
                                        disableDensitySelector
                                        slots={{ toolbar: GridToolbar }}
                                        disableSelectionOnClick

                                        filterModel={filterModel}
                                        onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                        slotProps={{ toolbar: { showQuickFilter: true } }}
                                        columnVisibilityModel={columnVisibilityModel}
                                        onColumnVisibilityModelChange={(newModel) =>
                                            setColumnVisibilityModel(newModel)
                                        }
                                        autoHeight
                                        getRowId={(row) => row.id}
                                    />
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this coupon?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cancel</Button>
                    <Button onClick={handleDelete} color="primary" >Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default EductionCoupon;
