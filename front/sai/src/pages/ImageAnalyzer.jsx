import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { FileUpload } from "@mui/icons-material";

const ImageAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://127.0.0.1:5050/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        MRI Image Analyzer
      </Typography>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<FileUpload />}
          >
            Upload MRI Image
          </Button>
        </label>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          sx={{ marginLeft: 2 }}
        >
          Analyze
        </Button>
      </form>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {result && !loading && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Prediction Result</Typography>
          <Typography variant="body1">
            <strong>Predicted Class:</strong> {result.predicted_class}
          </Typography>
          <Typography variant="body1">
            <strong>Description:</strong> {result.description}
          </Typography>
        </Box>
      )}

      {error && !loading && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageAnalyzer;
