import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Avatar,
  Alert,
  Container,
  Paper,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import Tesseract from "tesseract.js";
import { HfInference } from "@huggingface/inference";

// Environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const inference = new HfInference("hf_ur hugging face API");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Chatbot() {
  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

  const handleTextChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
    setUploadError(null);

    try {
      setIsLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const client = new S3Client({
        forcePathStyle: true,
        region: "ap-south-1",
        endpoint: "your_endpoint",
        credentials: {
          accessKeyId: process.env.REACT_APP_ACCESS_ID,
          secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
        },
      });

      const uploadParams = {
        Bucket: "medha_bucket",
        Key: `public/${file.name}`,
        Body: file,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await client.send(command);

      const { data } = await supabase.storage
        .from("medha_bucket")
        .getPublicUrl(`public/${file.name}`);

      setUploadedFileUrl(data.publicUrl);
      console.log(data.publicUrl);
    } catch (error) {
      setUploadError("Error uploading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!uploadedFileUrl) {
      alert("Please upload a file first.");
      return;
    }

    setIsLoading(true);

    try {
      let ocrText = "";

      // Perform OCR if a file is uploaded
      if (uploadedFile) {
        ocrText = await performOCR(uploadedFile);
      }

      // Combine OCR text with user input
      const combinedText = ocrText ? `${ocrText} ${inputText}` : inputText;

      // Query the Hugging Face model
      const response = await queryHuggingFaceModel(combinedText);
      setResponseText(response);
      speakText(response);
    } catch (error) {
      console.error("Error sending message:", error.message);
      setUploadError("Error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const performOCR = async (file) => {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  };

  const queryHuggingFaceModel = async (inputText) => {
    let responseText = "";

    for await (const chunk of inference.chatCompletionStream({
      model: "microsoft/Phi-3-mini-4k-instruct",
      messages: [{ role: "user", content: inputText }],
      max_tokens: 500,
    })) {
      responseText += chunk.choices[0]?.delta?.content || "";
    }

    return responseText || "No response";
  };

  //   const convertImageToBase64 = async (url) => {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const reader = new FileReader();

  //     return new Promise((resolve, reject) => {
  //       reader.onloadend = () => {
  //         resolve(reader.result.split(",")[1]); // Extract base64 string
  //       };
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });
  //   };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech synthesis.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      window.speechRecognition.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = "en-US";

    speechRecognition.onstart = () => {
      setIsListening(true);
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    speechRecognition.onend = () => {
      setIsListening(false);
    };

    speechRecognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    speechRecognition.start();
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Gamified Chatbot
        </Typography>
        <TextField
          fullWidth
          label="Type your message"
          value={inputText}
          onChange={handleTextChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
          Upload Image
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>

        {uploadedFile && (
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              variant="square"
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded Image"
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Typography>{uploadedFile.name}</Typography>
          </Box>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton color="primary" onClick={handleVoiceInput}>
            <MicIcon />
          </IconButton>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            endIcon={<SendIcon />}
            disabled={isLoading}
          >
            Send Message
          </Button>
        </Box>

        {isLoading && <CircularProgress sx={{ mt: 2 }} />}

        {responseText && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {responseText}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Chatbot;
