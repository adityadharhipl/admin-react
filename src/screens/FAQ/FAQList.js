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
import { fetchCourseFAQs } from '../../Redux/Reducers/FAQReducer';

function FAQList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const pagination = useSelector((state) => state?.FAQReducer?.paginationCourse);
    const faq = useSelector((state) => state?.FAQReducer?.courseFAQs || []);
    const status = useSelector((state) => state?.FAQReducer?.status || 'idle');

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });

    useEffect(() => {
        const { page, pageSize } = paginationModel;
        dispatch(fetchCourseFAQs({ page: page + 1, limit: pageSize }));
    }, [paginationModel, dispatch]);

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        if (selectedUserId) {
            try {
                const token = localStorage.getItem("User-admin-token");
                await axios.delete(`${process.env.REACT_APP_BASEURL}/admin/faq/${selectedUserId}`, {
                    headers: {
                        Authorization: ` ${token}`,
                    },
                });
                toast.success("FAQ deleted successfully!");
                dispatch(fetchCourseFAQs());
                setOpen(false);
            } catch (error) {
                console.error("Error deleting FAQ:", error);
                toast.error("Failed to delete FAQ!");
            }
        }
    };


    const columns = [
        { field: 'serialNo', headerName: 'S.No', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            renderCell: ({ row }) => (
                <div>
                    <IconButton component={Link} to={`/faq-edit/${row?.parentId}`}>
                        <i className="icofont-edit text-danger"></i>
                    </IconButton>
                    <IconButton component="button" onClick={() => handleClickOpen(row?.parentId)}>
                        <i className="icofont-ui-delete text-danger"></i>
                    </IconButton>
                </div>
            ),
        },
        { field: 'courseName', headerName: 'Course Name', width: 200 },
        { field: 'question', headerName: 'Question', width: 300 },
        { field: 'answer', headerName: 'Answer', width: 300 },
        { field: 'createdAt', headerName: 'Created At', width: 200 },
        { field: 'updatedAt', headerName: 'Updated At', width: 200 },

    ];
    const rows = Array.isArray(faq)
        ? faq.flatMap((entry, entryIndex) =>
            (entry.faqEntries || []).map((faqItem, index) => ({
                serialNo: paginationModel.page * paginationModel.pageSize + entryIndex + index + 1,
                courseName: entry?.courseId?.title || 'N/A',
                question: faqItem?.question,
                answer: faqItem?.answer,
                id: faqItem?._id,
                parentId: entry?._id,
                createdAt: entry?.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : "",
                updatedAt: entry?.updatedAt
                    ? new Date(entry.updatedAt).toLocaleString()
                    : "",
            }))
        )
        : [];



    return (
        <>
            <Toaster />
            <div className="body d-flex">
                <div className="container-xxl">
                    <PageHeader1 pagetitle="FAQ List" righttitle="Add FAQ" link="/faq-add" routebutton={true} />
                    <div className="row g-0 mb-3">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <Box sx={{ width: 1 }}>
                                        <Box sx={{ height: 500 }}>
                                            <DataGrid
                                                rows={rows}
                                                columns={columns}
                                                loading={status === 'loading'}
                                                slots={{ toolbar: GridToolbar }}
                                                filterModel={filterModel}
                                                onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                                slotProps={{ toolbar: { showQuickFilter: true } }}
                                                columnVisibilityModel={columnVisibilityModel}
                                                onColumnVisibilityModelChange={(newModel) =>
                                                    setColumnVisibilityModel(newModel)
                                                }
                                                disableSelectionOnClick
                                                paginationMode="server"
                                                rowCount={pagination?.totalDocs || 0}
                                                pageSizeOptions={[10, 25, 50]}
                                                paginationModel={paginationModel}
                                                onPaginationModelChange={setPaginationModel}
                                                getRowId={(row) => row.id}
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

export default FAQList;
