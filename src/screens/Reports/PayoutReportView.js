import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";

const PayoutListData = () => {
  const { id } = useParams();
  const token = localStorage.getItem("User-admin-token");
  const [payoutDataList, setPayoutDataList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/admin/payoutSummary/${id}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch payout data");
        const data = await response.json();
        setPayoutDataList(data?.data || []);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load payout details");
      }
    };

    fetchData();
  }, [id, token]);

  const rows = payoutDataList.map((item, index) => {
    const amountAfterTds = Number(item.amountAfterTds) || 0;
    const disbursedAmount = Number(item.disbursedAmount) || 0;

    return {
      ...item,
      id: item.astrologerId || index,
      sono: index + 1,
      pendingAmount: amountAfterTds - disbursedAmount, 
      createdAt: item?.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "",
    };
  });

  const columns = [
    { field: "sono", headerName: "S.no", flex: 0.5 },
    { field: "astroTotalAmount", headerName: "Astro Total Amount", flex: 1 },
    { field: "tdsAmount", headerName: "TDS Amount", flex: 1 },
    { field: "amountAfterTds", headerName: "Astro Amount After TDS", flex: 1 },
    { field: "disbursedAmount", headerName: "Disbursed Amount", flex: 1 },
    { field: "pendingAmount", headerName: "Pending Disbursal", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
  ];

  return (
    <Box p={3}>
      <Toaster />

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: "10px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#007bff",
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <span style={{ marginRight: "8px" }}></span>
        <span style={{ position: "relative" }}>
          Back
          <span
            style={{
              position: "absolute",
              left: 0,
              bottom: -2,
              width: "100%",
              height: "1px",
              borderBottom: "2px solid #007bff",
            }}
          />
        </span>
      </button>

      <Typography variant="h5" gutterBottom>
        Payout Details
      </Typography>

      <Box height={500}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default PayoutListData;