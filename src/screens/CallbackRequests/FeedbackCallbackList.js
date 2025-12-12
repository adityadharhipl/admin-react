import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCallbackFeedbacks, deleteCallbackFeedback } from '../../Redux/Reducers/FeedbackCallbackReducer';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Toaster, toast } from "react-hot-toast";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

function FAQListCallback() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const pagination = useSelector((state) => state?.FeedbackCallbackReducer?.pagination) || {};
    const callbackfeedbackDta = useSelector((state) => state?.FeedbackCallbackReducer?.callbackfeedback || {});
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        dispatch(fetchCallbackFeedbacks({ page: page + 1, limit: pageSize }));
    }, [paginationModel, dispatch]);

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        if (selectedUserId) {
            dispatch(deleteCallbackFeedback({
                id: selectedUserId, callback: (error) => {
                    if (error) {
                        toast.error("Failed to delete Callback Feedback!");
                    } else {
                        toast.success("Callback Feedback deleted successfully!");
                        setOpen(false);
                    }
                }
            }));
        }
    };

    const columns = [
        { field: 'serialNo', headerName: 'S.No', width: 100 },
        { field: 'fullName', headerName: 'User Name', width: 200 },
        { field: 'mobileNumber', headerName: 'Mobile No.', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'createdAt', headerName: 'Created At', width: 200 },
    ];

    const rows = (callbackfeedbackDta).map((item, index) => ({
        _id: item?._id,
        serialNo: paginationModel.page * paginationModel.pageSize + index + 1,
        fullName: item?.userId?.fullName || 'Deleted User',
        mobileNumber: item?.userId?.mobileNumber || 'Deleted User',
        email: item?.userId?.email || 'Deleted User',
        createdAt: item?.createdAt ? new Date(item?.createdAt).toLocaleString() : '',
    }));





    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="body d-flex">
                <div className="container-xxl">
                    <PageHeader1 pagetitle="Callback Feedback List " />
                    <div className="row g-0 mb-3">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <Box sx={{ width: 1 }}>
                                        <Box sx={{ height: 500 }}>
                                            <DataGrid
                                                rows={rows}
                                                columns={columns}
                                                slots={{ toolbar: GridToolbar }}
                                                filterModel={filterModel}
                                                onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                                slotProps={{ toolbar: { showQuickFilter: true } }}
                                                columnVisibilityModel={columnVisibilityModel}
                                                onColumnVisibilityModelChange={(newModel) =>
                                                    setColumnVisibilityModel(newModel)
                                                }
                                                disableSelectionOnClick
                                                initialState={{
                                                    sorting: {
                                                        sortModel: [{ field: 'serialNo', sort: 'asc' }], // Force sorting by serialNo
                                                    },
                                                }}

                                                paginationMode="server"
                                                rowCount={pagination?.totalDocs || 0}
                                                pageSizeOptions={[10, 25, 50, 100]}
                                                paginationModel={paginationModel}
                                                onPaginationModelChange={setPaginationModel}
                                                autoHeight
                                                getRowId={(row) => row._id}
                                            />

                                        </Box>
                                    </Box>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Delete Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to delete this Callback Feedback?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                        <Button onClick={handleDelete} color="secondary">Confirm</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default FAQListCallback;
