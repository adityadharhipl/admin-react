import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader1 from '../../components/common/PageHeader1';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommission } from '../../Redux/Reducers/CommissionReducer';

function CommissionList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchCommission(localData._id));
    }, [dispatch]);

    useEffect(() => {
        if (commission?.success) {
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [commission]);

    function deleteTeamMember(id) {
        axios.delete(`${process.env.REACT_APP_BASEURL}/commission`, {
            params: { id }
        })
            .then(response => {
                if (response.status === 200) {
                    dispatch(fetchCommission(localData._id));
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
            const userToDelete = commission?.find(row => row.id === selectedUserId);
            if (userToDelete && userToDelete._id) {
                deleteTeamMember(userToDelete._id);
            }
        }
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'categoryId', headerName: 'Category', width: 300 },
        { field: 'subCategoryId', headerName: 'Sub Category', width: 300 },
        { field: 'commission', headerName: 'Commission', width: 300 },
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
                <PageHeader1 pagetitle='Commission List' righttitle='Add Commission' link='/commission-add' routebutton={true} />
                <div className="row g-0 mb-3">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <div id="myDataTable_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Box sx={{ width: 1 }}>
                                                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    {loading ? (
                                                        <CircularProgress />
                                                    ) : (
                                                        <DataGrid
                                                            columns={columns}
                                                            rows={Array.isArray(commission)
                                                                ? commission?.map((item, index) => ({
                                                                    ...item,
                                                                    categoryId: item?.categoryId?.categoryName,
                                                                    subCategoryId: item?.subCategoryId?.subCategoryName,
                                                                    id: index + 1
                                                                }))
                                                                : []}
                                                            disableColumnFilter
                                                            loading={loading}
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
                                                    )}
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
                aria-describedby="alert-dialog-description">
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

export default CommissionList;