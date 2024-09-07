import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

const Summarizer = ({ data }) => {
  // Ensure data is valid
  if (!data || typeof data !== "object") {
    return (
      <Typography variant="h6" color="error">
        No data available to summarize.
      </Typography>
    );
  }

  // Generate styles for hover effects and colors
  const generateStyles = (index) => {
    const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800"];
    const hoverColors = ["#e57373", "#64b5f6", "#81c784", "#ffb74d"];
    const colorIndex = index % colors.length;

    return {
      paper: {
        padding: "16px",
        backgroundColor: colors[colorIndex],
        "&:hover": {
          backgroundColor: hoverColors[colorIndex],
        },
        marginBottom: "16px",
        color: "#fff",
      },
      key: {
        fontWeight: "bold",
        marginBottom: "8px",
      },
      value: {
        whiteSpace: "pre-wrap",
      },
    };
  };

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      {Object.entries(data).map(([key, value], index) => {
        const styles = generateStyles(index);
        return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper sx={styles.paper}>
              <Typography variant="h6" sx={styles.key}>
                {key}
              </Typography>
              <Typography variant="body1" sx={styles.value}>
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Summarizer;
