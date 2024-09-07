import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";

const SummarizeReport = () => {
  const [formUrl, setFormUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post("http://localhost:5150/summarize", {
        form_url: formUrl,
      });
      console.log(response.data); // Log the data to inspect it
      setResult(response.data);
    } catch (err) {
      setError("An error occurred while processing the document.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;

    // Format the JSON content to make it readable
    return (
      <Box
        sx={{
          backgroundColor: "#f0f0f0",
          padding: 2,
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >
        {JSON.stringify(content, null, 2)}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Summarize Report & Get Educational Content
      </Typography>
      <TextField
        label="Document URL"
        variant="outlined"
        fullWidth
        value={formUrl}
        onChange={(e) => setFormUrl(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Submit"}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {result && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Document Content:
          </Typography>
          {renderContent(result.document_content.split("\n"))}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Educational Content:
            </Typography>
            {renderContent(result.educational_content.split("\n"))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SummarizeReport;
