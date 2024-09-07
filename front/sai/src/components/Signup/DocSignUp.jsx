import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other"];

// Access the environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DocSignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    experience: "",
    institute: "",
    location: "",
    organization: "",
    speciality: "",
    address: "",
    mobile: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: "https://localhost/login",
      },
    });

    if (error) {
      setSnackbarMessage("Error signing up: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    //const userId = data.user.id; // Get the user's ID from the response
    const additionalData = {
      //user_id: userId,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      experience: formData.experience,
      institute: formData.institute,
      location: formData.location,
      organization: formData.location,
      speciality: formData.occupation,
      address: formData.address,
      mobile: formData.mobile,
    };

    const { error: insertError } = await supabase
      .from("doctor")
      .insert([additionalData]);

    if (insertError) {
      setSnackbarMessage(
        "Error saving additional data: " + insertError.message
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } else {
      setSnackbarMessage("User signed up successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirect after 3 seconds
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh" }}
    >
      <Paper
        elevation={6}
        style={{
          padding: "30px",
          maxWidth: "500px",
          transform: "scale(1.05)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Medical Specialist Sign-Up
        </Typography>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            margin="normal"
            required
          >
            {genders.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Experience (years)"
            name="experience"
            type="numbers"
            value={formData.age}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="text"
            label="Institute"
            name="institute"
            value={formData.institute}
            onChange={handleChange}
            margin="normal"
            required
          ></TextField>
          <TextField
            fullWidth
            label="Location (City)"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Organization"
            name="organization"
            type="text"
            value={formData.organization}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Speciality"
            name="speciality"
            value={formData.speciality}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Mobile No."
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Sign Up
          </Button>
        </form>
        <Grid container justifyContent="center" style={{ marginTop: "15px" }}>
          <Grid item>
            <Link href="/login" variant="body2">
              {"Already have an account? Log In"}
            </Link>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default DocSignUp;
