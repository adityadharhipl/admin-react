import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteCoupon } from '../../Redux/Reducers/CoupansReducer';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Switch } from '@mui/material';
import PageHeader1 from '../../components/common/PageHeader1';
// import { Switch } from '@mui/material';


function GooglePayCoupon() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [coupons, setCoupons] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });

    const token = localStorage.getItem("User-admin-token");

    useEffect(() => {
        if (!token) {
            setError("Authentication token not found.");
            setStatus("error");
            return;
        }
        fetchCoupons();
    }, []);

    const fetchCoupons = () => {
        setStatus("loading");
        fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon`, {
            method: 'GET',
            headers: { 'Authorization': `${token}` },
        })
            .then(response => response.json())
            .then(data => {
                setCoupons(data.data || []);
                setStatus('success');
                if (data?.data?.length > 0) {
                    const firstCouponCategory = data.data[0].category;
                    setTabValue(
                        firstCouponCategory === 'flat_extra_percentage' || firstCouponCategory === 'flat_extra_rupees' ? 1 : 0
                    );
                }
            })
            .catch(err => {
                setError(err.message);
                setStatus('error');
            });
    };

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        dispatch(deleteCoupon(selectedUserId)).then(() => {
            fetchCoupons();
            setOpen(false);
        });
    };

    // New toggle handler
    const handleToggle = (couponId, currentStatus) => {
        const updatedStatus = !currentStatus;

        fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon/${couponId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isActive: updatedStatus })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to toggle status");
                return response.json();
            })
            .then(() => {
                fetchCoupons();
            })
            .catch(error => {
                console.error("Toggle error:", error);
            });
    };


    const filteredCoupons = coupons.filter(item =>
        (tabValue === 0 && (item.category === 'flat_off_percentage' || item.category === 'flat_off_rupees')) ||
        (tabValue === 1 && (item.category === 'flat_extra_percentage' || item.category === 'flat_extra_rupees'))
    );


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const columns = [
        { field: 'id', headerName: 'S.No.', width: 80 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'discountValue', headerName: 'Discount', width: 150 },
        { field: 'validFrom', headerName: 'Valid From', width: 150 },
        { field: 'validTo', headerName: 'Valid To', width: 150 },
        { field: 'minCartValue', headerName: 'Minimum Order', width: 150 },
        {
            field: 'isActive',
            headerName: 'Active',
            width: 150,
            renderCell: ({ row }) => (
                <Switch
                    checked={row.isActive}
                    onChange={() => handleToggle(row._id, row.isActive)}
                />

            ),
        },

        { field: 'createdAt', headerName: 'Created At', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={process.env.PUBLIC_URL + `/google-view/${row?._id}`}>
                        <i className="icofont-eye text-danger"></i>
                    </IconButton>
                    <IconButton onClick={() => handleClickOpen(row?._id)}>
                        <i className="icofont-ui-delete text-danger"></i>
                    </IconButton>
                </div>
            ),
        },
    ];


    const rows = filteredCoupons.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        category: item?.category || "N/A",
        discountValue: item?.discountValue || 0,
        isActive: item.isActive || false,
        validTo: item?.validTo

            ? new Date(item.validTo).toLocaleString("en-GB", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            : "N/A",
        validFrom: item?.validFrom
            ? new Date(item?.validFrom).toLocaleDateString("en-GB")
            : "N/A",
        minCartValue: item?.minCartValue || 0,
        discountType: item.discountType || "N/A",
        createdAt: item?.createdAt
            ? new Date(item?.createdAt).toLocaleString()
            : "",


    }));


    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Google Pay Coupon List' righttitle='Add Coupon' link='/googlepaycoupon-add' routebutton={true} />
                <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="coupon tabs">

                        <Tab label="Consultation" />
                    </Tabs>
                </Box>
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                {status === "loading" ? (
                                    <p>Loading coupons...</p>
                                ) : status === "error" ? (
                                    <p className="text-danger">Error: {error}</p>
                                ) : rows.length === 0 ? (
                                    <p>No coupons available.</p>
                                ) : (
                                    <Box sx={{ width: 1 }}>
                                        <Box sx={{ height: 400 }}>
                                            <DataGrid
                                                columns={columns}
                                                rows={rows}
                                                disableColumnFilter
                                                disableDensitySelector
                                                slots={{ toolbar: GridToolbar }}
                                                rowsPerPageOptions={[10, 20, 50]}
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
                                )}
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
                    <Button onClick={handleDelete} color="primary" autoFocus>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default GooglePayCoupon;

