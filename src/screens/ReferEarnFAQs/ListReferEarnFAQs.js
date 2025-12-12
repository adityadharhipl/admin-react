import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Toaster, toast } from "react-hot-toast";
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferEarnFAQs } from '../../Redux/Reducers/ReferEarnFAQsReducer';

function ReferEarnFAQsList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedFAQId, setSelectedFAQId] = useState(null);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const faqData = useSelector((state) => state?.ReferEarnFAQsReducer?.referEarnFaqs || {});
    const pagination = useSelector((state) => state?.ReferEarnFAQsReducer?.pagination);
    const faqEntries = faqData?.data?.faqEntries || [];
    const parentId = faqData?.data?._id;



    useEffect(() => {
        const { page, pageSize } = paginationModel;
        dispatch(fetchReferEarnFAQs({ page: page + 1, limit: pageSize }));
    }, [paginationModel, dispatch]);

    const handleClickOpen = (faqId) => {
        setSelectedFAQId(faqId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

const handleDelete = async () => {
    if (selectedFAQId && parentId) {
        try {
            const token = localStorage.getItem("User-admin-token");

            const updatedFaqEntries = faqEntries
                .filter((entry) => entry._id !== selectedFAQId)
                .map(({ _id, ...rest }) => rest);

            const response = await axios.patch(
                `${process.env.REACT_APP_BASEURL}/admin/faq/${parentId}`,
                {
                    faqEntries: updatedFaqEntries
                },
                {
                    headers: {
                        Authorization: `${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );

            toast.success("FAQ deleted successfully!");
            const { page, pageSize } = paginationModel;
            dispatch(fetchReferEarnFAQs({ page: page + 1, limit: pageSize }));
            setOpen(false);
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            toast.error("Something went wrong!");
        }
    }
};

    const columns = [
        { field: 'serialNo', headerName: 'S.No', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={`/referadd/${row?.id}`}>
                        <i className="icofont-edit text-danger" style={{ fontSize: '20px' }}></i>
                    </IconButton>
                    <IconButton component="button" onClick={() => handleClickOpen(row?.id)}>
                        <i className="icofont-ui-delete text-danger" style={{ fontSize: '20px' }}></i>
                    </IconButton>
                </div>
            ),
        },
        { field: 'question', headerName: 'Question', width: 300 },
        { field: 'answer', headerName: 'Answer', width: 300 },
        { field: 'createdAt', headerName: 'Created At', width: 200 },
        { field: 'updatedAt', headerName: 'Updated At', width: 200 },
      
    ];

    const rows = Array.isArray(faqData)
    ? faqData
        .flatMap((item) =>
          (item.faqEntries || []).map((entry) => ({
            question: entry?.question,
            answer: entry?.answer,
            id: entry?._id,
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
          }))
        )
        .map((row, index) => ({
          ...row,
          serialNo: (paginationModel.page * paginationModel.pageSize) + index + 1,
        }))
    : [];
  




    return (
        <>
            <Toaster position="top-right" reverseOrder={true} />
            <div className="body d-flex py-1">
                <div className="container-xxl">
                    <PageHeader1 pagetitle="Refer and Earn FAQs" righttitle="Add FAQ" link="/referadd" routebutton={true} />
                    <div className="row g-0 mb-3">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <Box sx={{ width: 1 }}>
                                        <Box sx={{ height: 500 }}>
                                            <DataGrid
                                                rows={rows}
                                                columns={columns}
                                                pageSize={10}
                                                rowsPerPageOptions={[10, 20, 50]}
                                                slots={{ toolbar: GridToolbar }}
                                                filterModel={filterModel}
                                                onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                                slotProps={{ toolbar: { showQuickFilter: true } }}
                                                columnVisibilityModel={columnVisibilityModel}
                                                onColumnVisibilityModelChange={(newModel) =>
                                                    setColumnVisibilityModel(newModel)
                                                }
                                                paginationMode="server"
                                                rowCount={pagination?.totalDocs || 0}
                                                pageSizeOptions={[10, 25, 50, 100]}
                                                paginationModel={paginationModel}
                                                onPaginationModelChange={setPaginationModel}
                                                getRowId={(row) => row.id}
                                                disableSelectionOnClick
                                            />
                                        </Box>
                                    </Box>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Delete Confirmation Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Delete Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to delete this FAQ?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="secondary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default ReferEarnFAQsList;
