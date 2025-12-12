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
import { fetchGenericFAQs } from '../../Redux/Reducers/FAQReducer';

function GenericFAQList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [tabValue, setTabValue] = useState("user");

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const pagination = useSelector((state) => state?.FAQReducer?.paginationGeneric);
    const allFaqs = useSelector((state) => state?.FAQReducer?.genericFAQs || []);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [filterModel, setFilterModel] = useState({
        items: [],
        quickFilterExcludeHiddenColumns: true,
        quickFilterValues: [''],
    });

    // Fetch data when pagination or tab changes
    useEffect(() => {
        const { page, pageSize } = paginationModel;
        dispatch(fetchGenericFAQs({ page: page + 1, limit: pageSize, forValue: tabValue }));
    }, [paginationModel, dispatch, tabValue]);

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
                    headers: { Authorization: `${token}` },
                });
                toast.success("FAQ deleted successfully!");
                const { page, pageSize } = paginationModel;
                dispatch(fetchGenericFAQs({ page: page + 1, limit: pageSize, forValue: tabValue }));
                setOpen(false);
            } catch (error) {
                console.error("Error deleting FAQ:", error);
                toast.error("Failed to delete FAQ!");
            }
        }
    };

    const handleTabChange = (newValue) => {
        setTabValue(newValue);
        setPaginationModel({ page: 0, pageSize: 10 }); // Reset page
    };

    const columns = [
        {
            field: 'serialNo',
            headerName: 'S.No',
            width: 80,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/faqger-edit/${row?.parentId}`}
                        title="Edit FAQ"
                        sx={{
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                        }}
                    >
                        <i className="icofont-edit" style={{ fontSize: '18px' }}></i>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleClickOpen(row?.parentId)}
                        title="Delete FAQ"
                        sx={{
                            color: '#d32f2f',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            },
                        }}
                    >
                        <i className="icofont-ui-delete" style={{ fontSize: '18px' }}></i>
                    </IconButton>
                </Box>
            ),
        },
        {
            field: 'question',
            headerName: 'Question',
            width: 300,
            renderCell: (params) => (
                <Box
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                    title={params.value}
                >
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: 'answer',
            headerName: 'Answer',
            width: 350,
            renderCell: (params) => (
                <Box
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                    }}
                    title={params.value}
                >
                    {params.value || '-'}
                </Box>
            ),
        },
        { field: 'createdAt', headerName: 'Created At', width: 200, type: 'dateTime' },
        { field: 'updatedAt', headerName: 'Updated At', width: 200, type: 'dateTime' },
    ];

    const rows = allFaqs.flatMap((item, index) =>
        item?.faqEntries?.map((entry, entryIndex) => ({
            serialNo: paginationModel.page * paginationModel.pageSize + (index * (item?.faqEntries?.length || 0)) + entryIndex + 1,
            question: entry?.question,
            answer: entry?.answer,
            id: entry?._id,
            parentId: item?._id,
            createdAt: item.createdAt ? new Date(item.createdAt) : null,
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
        }))
    ) || [];

    return (
        <>
            <Toaster />
            <div className="body d-flex">
                <div className="container-xxl">
                    <PageHeader1 pagetitle="Generic FAQ List" righttitle="Add FAQ" link="/generic-add" routebutton={true} />

                    {/* Buttons Card */}
                    <div className="card mb-3" style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <div className="card-body" style={{ padding: '16px 20px' }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Button
                                    variant={tabValue === "user" ? "contained" : "outlined"}
                                    onClick={() => handleTabChange("user")}
                                    sx={{
                                        fontSize: '14px',
                                        minHeight: 30,
                                        padding: '4px 16px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                        backgroundColor: tabValue === "user"
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'transparent',
                                        color: tabValue === "user"
                                            ? '#ffffff'
                                            : 'rgba(0, 0, 0, 0.6)',
                                        borderColor: tabValue === "user"
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'rgba(0, 0, 0, 0.23)',
                                        '&:hover': {
                                            backgroundColor: tabValue === "user"
                                                ? 'var(--primary-color, #E7B242)'
                                                : 'rgba(0, 0, 0, 0.04)',
                                            color: tabValue === "user"
                                                ? '#ffffff'
                                                : 'var(--primary-color, #E7B242)',
                                            borderColor: tabValue === "user"
                                                ? 'var(--primary-color, #E7B242)'
                                                : 'var(--primary-color, #E7B242)',
                                        },
                                        boxShadow: tabValue === "user" ? 'none' : 'none',
                                    }}
                                >
                                    USER
                                </Button>
                                <Button
                                    variant={tabValue === "astro" ? "contained" : "outlined"}
                                    onClick={() => handleTabChange("astro")}
                                    sx={{
                                        fontSize: '14px',
                                        minHeight: 30,
                                        padding: '4px 16px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                        backgroundColor: tabValue === "astro"
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'transparent',
                                        color: tabValue === "astro"
                                            ? '#ffffff'
                                            : 'rgba(0, 0, 0, 0.6)',
                                        borderColor: tabValue === "astro"
                                            ? 'var(--primary-color, #E7B242)'
                                            : 'rgba(0, 0, 0, 0.23)',
                                        '&:hover': {
                                            backgroundColor: tabValue === "astro"
                                                ? 'var(--primary-color, #E7B242)'
                                                : 'rgba(0, 0, 0, 0.04)',
                                            color: tabValue === "astro"
                                                ? '#ffffff'
                                                : 'var(--primary-color, #E7B242)',
                                            borderColor: tabValue === "astro"
                                                ? 'var(--primary-color, #E7B242)'
                                                : 'var(--primary-color, #E7B242)',
                                        },
                                        boxShadow: tabValue === "astro" ? 'none' : 'none',
                                    }}
                                >
                                    ASTRO
                                </Button>
                            </Box>
                        </div>
                    </div>

                    <div className="row g-0 mb-3">
                        <div className="col-md-12">
                            <div className="card" style={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: 'none',
                                overflow: 'hidden'
                            }}>
                                <div className="card-body" style={{ padding: 0 }}>
                                    <Box sx={{
                                        height: 600,
                                        width: '100%',
                                        '& .MuiDataGrid-root': {
                                            border: 'none',
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f0f0f0',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f8f9fa',
                                            borderBottom: '2px solid #e9ecef',
                                            fontWeight: 600,
                                        },
                                        '& .MuiDataGrid-toolbarContainer': {
                                            padding: '16px 20px',
                                            borderBottom: '1px solid #e9ecef',
                                            backgroundColor: '#fafafa',
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            borderTop: '1px solid #e9ecef',
                                        },
                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: '#f8f9fa',
                                        },
                                    }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            slots={{ toolbar: GridToolbar }}
                                            filterModel={filterModel}
                                            onFilterModelChange={(newModel) => setFilterModel(newModel)}
                                            slotProps={{
                                                toolbar: {
                                                    showQuickFilter: true,
                                                    sx: {
                                                        '& .MuiInputBase-root': {
                                                            borderRadius: '8px',
                                                        }
                                                    }
                                                }
                                            }}
                                            columnVisibilityModel={columnVisibilityModel}
                                            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                                            paginationMode="server"
                                            rowCount={pagination?.totalDocs || 0}
                                            pageSizeOptions={[10, 25, 50, 100]}
                                            paginationModel={paginationModel}
                                            onPaginationModelChange={setPaginationModel}
                                            getRowId={(row) => row.id}
                                            disableSelectionOnClick
                                            sx={{
                                                '& .MuiDataGrid-cell:focus': {
                                                    outline: 'none',
                                                },
                                                '& .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                },
                                            }}
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
                        <DialogContentText>
                            Are you sure you want to delete this FAQ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default GenericFAQList;
