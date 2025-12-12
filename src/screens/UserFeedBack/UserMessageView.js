import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchCustomerSupport } from "../../Redux/Reducers/UserFeedBacksupportReducer";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

function UserMessageView() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [paginationModel, setPaginationModel] = useState({
                page: 0,
                pageSize: 10,
            });

    const messages = useSelector((state) => state.UserFeedBacksupport?.queries || []);
    const messagesData = useSelector((state) => state|| []);
    const message = messages.find((item) => item._id === id);

    useEffect(() => {
        if (!message) {
            const { page, pageSize } = paginationModel;
            dispatch(fetchCustomerSupport({ page: page + 1, limit: pageSize }));
        }
    }, [paginationModel, dispatch]);



    return (
        <>
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
                    position: "relative",
                    padding: "10px 20px",
                }}
            >
                <span style={{ marginRight: "8px" }}>&lt;</span>
                <span style={{ position: "relative", display: "inline-block" }}>
                    Back
                    <span
                        style={{
                            content: "''",
                            position: "absolute",
                            left: 0,
                            bottom: -2,
                            width: "100%",
                            height: "1px",
                            borderBottom: "2px solid #007bff",
                        }}
                    ></span>
                </span>
            </button>
            <Box sx={{ p: 3 }}>
                <Card>
                    <CardContent>


                        <Typography variant="h5" gutterBottom>
                            User Message View
                        </Typography>
                        <Typography>
                            <strong>User Name:</strong>{" "}
                            {message?.name || "N/A"}
                        </Typography>
                        <Typography>
                            <strong>Email:</strong>{" "}
                            {message?.email || "N/A"}
                        </Typography>
                        <Typography>
                            <strong>Mobile Number:</strong>{" "}
                            {message?.mobile || "N/A"}
                        </Typography>
                        <Typography>
                            <strong>Message:</strong>{" "}
                            {message?.description || "No message provided"}
                        </Typography>
                        <Typography>
                            <strong>Subject:</strong>{" "}
                            {message?.subject || "No message provided"}
                        </Typography>


                    </CardContent>
                </Card>
            </Box>
        </>

    );
}

export default UserMessageView;
