import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchQuery } from "../../Redux/Reducers/UserFeedbackReducerList";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

function AstroSupportView() {
    const { id } = useParams(); 
    const dispatch = useDispatch();

    const feedbacks = useSelector((state) => state.UserFeedbackReducerList?.data || []);
    const feedback = feedbacks.find((item) => item._id === id);

    useEffect(() => {
        if (!feedback) {
            dispatch(fetchQuery()); 
        }
    }, [dispatch, feedback, id]);

    if (!feedback) {
        return <Typography>Loading...</Typography>;
    }

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
                    Astro Support View
                    </Typography>
                    <Typography><strong>User Name:</strong> {feedback?.name || 'N/A'}</Typography>
                    <Typography><strong>Email:</strong> {feedback?.email || 'N/A'}</Typography>
                    <Typography><strong>Phone Number:</strong> {feedback?.mobile || 'N/A'}</Typography>
                    <Typography><strong>Feedback:</strong> {feedback?.query || 'No feedback provided'}</Typography>

                    {/* <Box mt={3}>
                        <Button
                            component={Link}
                            to="/astro-support"
                            variant="contained"
                            color="gray"
                        >
                            Back 
                        </Button>
                    </Box> */}
                </CardContent>
            </Card>
        </Box>
     </>
    );
}

export default AstroSupportView;
