import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import PageHeader1 from "../../components/common/PageHeader1";
import { useDispatch, useSelector } from "react-redux";
import { fetchSessionReport } from "../../Redux/Reducers/InvoiceReportReducer";

const CallAndChatReport = () => {
  const dispatch = useDispatch();

  const RechargeData = useSelector((state) => state?.InvoiceReportReducer || {});

  const { data: rowsData = [], paginationDetail = {}, status = "idle" } = RechargeData;

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleClickOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    setOpen(false);
  };

  useEffect(() => {
    const page = paginationModel.page + 1;
    const limit = paginationModel.pageSize;
    dispatch(fetchSessionReport({ page, limit }));
  }, [dispatch, paginationModel]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };



  const rows = rowsData?.map((item, index) => ({
    ...item,
    id: item._id || item.id || index,
    sono: paginationModel.page * paginationModel.pageSize + index + 1,
    mobileNumber: item?.mobileNumber,
    astrologerName: item?.astrologerName,
    createdAt: formatDateTime(item?.createdAt),
    updatedAt: formatDateTime(item?.updatedAt),
    walletBefore: item?.walletBefore?.toFixed(2),
    walletAfter: item?.walletAfter?.toFixed(2)

  }));

  const columns = [
    { field: "sono", headerName: "S.No.", width: 80 },
    { field: "userName", headerName: "User Name", width: 150 },
    { field: "mobileNumber", headerName: "Mobile No", width: 130 },
    { field: "astrologerName", headerName: "Astrologer Name", width: 170 },
    { field: "sessionType", headerName: "Conversation Type", width: 160 },
    { field: "session", headerName: "Session", width: 120 },
    { field: "duration", headerName: "Consult Time Duration", width: 180 },
    { field: "walletBefore", headerName: "Wallet Before", width: 140 },
    { field: "totalAmount", headerName: "Wallet During Consult", width: 180 },
    { field: "walletAfter", headerName: "Wallet After", width: 140 },
    { field: "astroShare", headerName: "Astro Share", width: 130 },
    { field: "createdAt", headerName: "Created At", width: 180 },
    { field: "updatedAt", headerName: "Updated At", width: 180 },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   width: 100,
    //   renderCell: ({ row }) => (
    //     <IconButton onClick={() => handleClickOpen(row.id)}>
    //       <i className="icofont-ui-delete text-danger"></i>
    //     </IconButton>
    //   ),
    // },
  ];

  const exportToExcel = () => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const exportData = rows.map((row) => ({
      SNo: row.sono,
      UserName: row.userName,
      MobileNumber: row.mobile,
      AstrologerName: row.astroName,
      ConversationType: row.conversationType,
      Session: row.session,
      Duration: row.duration,
      WalletBefore: row.walletBefore,
      WalletDuring: row.walletDuring,
      WalletAfter: row.walletAfter,
      AstroShare: row.astroShare,
      CreatedAt: row.createdAt,
      UpdatedAt: row.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CallAndChatReport");
    XLSX.writeFile(workbook, `Call_Chat_Report_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="body d-flex">
      <div className="container-xxl">
        <PageHeader1 pagetitle="Call & Chat Report" />
        <div className="row g-0 mb-3">
          <div className="col-md-12 mb-3 d-flex justify-content-end">
            <Button variant="outlined" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </div>
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <Box sx={{ width: "100%", height: 600 }}>
                  <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={status === 'loading'}
                    getRowId={(row) => row.id}
                    rowCount={paginationDetail?.totalRecords || 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50]}
                    paginationMode="server"
                    loading={status === "loading"}
                    disableSelectionOnClick
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
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
          Are you sure you want to delete this session record?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallAndChatReport;
