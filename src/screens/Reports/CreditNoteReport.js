// import React from "react";
// import {
//     Box,
//     Button,
//     IconButton,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
// } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import * as XLSX from "xlsx";
// // import { saveAs } from "file-saver";
// import PageHeader1 from "../../components/common/PageHeader1";

// const CreditReports = () => {
//     const [open, setOpen] = React.useState(false);
//     const [selectedId, setSelectedId] = React.useState(null);

//     const handleClickOpen = (id) => {
//         setSelectedId(id);
//         setOpen(true);
//     };

//     const handleClose = () => setOpen(false);
//     const handleDelete = () => {
//         setOpen(false);
//     };

//     const rows = [
//         {
//             id: 1,
//             creditNote: "CN001",
//             cancelledInvoice: "INV2001",
//             segment: "Online",
//             state: "Delhi",
//             basicAmount: 1500,
//             SGST: 135,
//             IGST: 0,
//             invoiceAmount: 1830,
//         },
//         {
//             id: 2,
//             creditNote: "CN002",
//             cancelledInvoice: "INV2002",
//             segment: "Offline",
//             state: "Maharashtra",
//             basicAmount: 1200,
//             SGST: 0,
//             IGST: 216,
//             invoiceAmount: 1416,
//         },
//         // Add more rows if needed
//     ];

//     const columns = [
//         { field: "sono", headerName: "S.No.", width: 80 },
//         { field: "creditNote", headerName: "Credit Note", width: 150 },
//         { field: "cancelledInvoice", headerName: "Cancelled Invoice", width: 170 },
//         { field: "segment", headerName: "Segment", width: 120 },
//         { field: "state", headerName: "State", width: 130 },
//         { field: "basicAmount", headerName: "Basic Amount", width: 130 },
//         { field: "SGST", headerName: "SGST", width: 100 },
//         { field: "IGST", headerName: "IGST", width: 100 },
//         { field: "invoiceAmount", headerName: "Invoice Amount", width: 150 },
      
//     ];

//     const exportToExcel = () => {
//         const exportData = rows.map((row, index) => ({
//             SNo: index + 1,
//             CreditNote: row.creditNote,
//             CancelledInvoice: row.cancelledInvoice,
//             Segment: row.segment,
//             State: row.state,
//             BasicAmount: row.basicAmount,
//             SGST: row.SGST,
//             IGST: row.IGST,
//             InvoiceAmount: row.invoiceAmount,
//         }));

//         const worksheet = XLSX.utils.json_to_sheet(exportData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "CreditReports");
//         const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//         const file = new Blob([excelBuffer], { type: "application/octet-stream" });
//         // saveAs(file, `Credit_Report_${new Date().toISOString()}.xlsx`);
//     };

//     return (
//         <div className="body d-flex">
//             <div className="container-xxl">
//                 <PageHeader1 pagetitle="Credit Reports" />
//                 <div className="row g-0 mb-3">
//                     <div className="col-md-12 mb-3 d-flex justify-content-end">
//                         <Button variant="outlined" onClick={exportToExcel}>
//                             Export to Excel
//                         </Button>
//                     </div>
//                     <div className="col-md-12">
//                         <div className="card">
//                             <div className="card-body">
//                                 <Box sx={{ width: "100%" }}>
//                                     <Box sx={{ height: 600 }}>
//                                         <DataGrid
//                                             columns={columns}
//                                             rows={rows}
//                                             disableSelectionOnClick
//                                             slots={{ toolbar: GridToolbar }}
//                                             slotProps={{ toolbar: { showQuickFilter: true } }}
//                                             getRowId={(row) => row.id}
//                                         />
//                                     </Box>
//                                 </Box>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Delete confirmation dialog */}
//             <Dialog open={open} onClose={handleClose}>
//                 <DialogTitle>Delete Confirmation</DialogTitle>
//                 <DialogContent>
//                     Are you sure you want to delete this credit report entry?
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose} color="primary">
//                         Cancel
//                     </Button>
//                     <Button onClick={handleDelete} color="secondary">
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// export default CreditReports;
