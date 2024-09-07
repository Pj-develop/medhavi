import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Grid,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useSound from "use-sound"; // You can use a package like use-sound for mic animations

const theme = createTheme();

function Dashboard() {
  const [inputText, setInputText] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);

  const [playOn] = useSound("/sounds/mic-on.mp3"); // Sound when mic starts
  const [playOff] = useSound("/sounds/mic-off.mp3"); // Sound when mic stops

  async function queryImage(data) {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          headers: {
            Authorization: "Bearer hf_huggingface",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImage(url);
      handleTextToSpeech(url); // Speak the information when image is generated
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    queryImage({ inputs: inputText });
  };

  const handleVoiceInput = () => {
    setIsMicActive(true);
    playOn();
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      queryImage({ inputs: transcript });
      setIsMicActive(false);
      playOff();
    };
    recognition.start();
  };

  const handleTextToSpeech = (url) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = `Here is the image based on your description: ${inputText}`;
    window.speechSynthesis.speak(speech);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <form onSubmit={handleFormSubmit}>
            <TextField
              fullWidth
              label="Enter a description"
              variant="outlined"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Describe the image you want..."
            />
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
              >
                Generate Image
              </Button>
              <IconButton
                color={isMicActive ? "secondary" : "default"}
                onClick={handleVoiceInput}
                sx={{ ml: 2, transition: "color 0.3s ease" }}
              >
                {isMicActive ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Box>
          </form>
        </Grid>

        {isLoading && (
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        )}

        {image && (
          <Grid item xs={12} md={8}>
            <img src={image} alt="Generated" style={{ width: "100%" }} />
            <Button
              variant="outlined"
              onClick={handleTextToSpeech}
              sx={{ mt: 2 }}
            >
              Describe Image
            </Button>
          </Grid>
        )}
      </Grid>
      <Button variant="contained" color="primary" href=" http://127.0.0.1:5000">
        Community Support
      </Button>
      <br />
      <br />
      <Button
        variant="contained"
        color="secondary"
        href="https://cdn.botpress.cloud/webchat/v2/shareable.html?botId=a13cd395-f45e-4c22-9df5-3424fe0d11ab"
      >
        Medical Sanjeevni
      </Button>
      <br />
      <br />
      <Button variant="contained" color="secondary" href="/img">
        ML MRI Image Analyser
      </Button>
      <br />
      <Button
        variant="contained"
        color="primary"
        href="https://documentintelligence.ai.azure.com/studio/read"
      >
        Report Analysis
      </Button>
    </ThemeProvider>
  );
}

export default Dashboard;
