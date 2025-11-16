import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Link,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { BASE_URLS } from "./config";

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isRegister, setIsRegister] = React.useState(false);
  const [message, setMessage] = React.useState(null); // ✅ success/error message
  const [severity, setSeverity] = React.useState("info"); // "success" | "error" | "info"
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // clear previous message

    const form = new FormData(e.currentTarget);
    const username = form.get("username");
    const password = form.get("password");

    const endpoint = isRegister ? BASE_URLS.REGISTER : BASE_URLS.LOGIN;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          // ✅ Registration success → switch to login mode
          setIsRegister(false);
          setSeverity("success");
          setMessage("✅ Sign up successful! Login to get started.");
        } else {
          // ✅ Login success
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
          }
          navigate("/");
        }
      } else {
        // ❌ Backend error (e.g., invalid credentials)
        setSeverity("error");
        setMessage(data.error || data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setSeverity("error");
      setMessage("⚠️ Error connecting to server");
    }
  };

  return (
    <Box
      maxWidth="2xl"
      mx="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ height: "80vh" }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          color="text.primary"
          mt={2}
          mb={3}
        >
          {isRegister ? "Create a New Account" : "Login to Your Account"}
        </Typography>

        {/* ✅ Info / Error Banner */}
        {message && (
          <Alert
            severity={severity}
            sx={{
              mb: 2,
              fontWeight: 500,
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label={isRegister ? "New Username" : "Username"}
            name="username"
            required
            fullWidth
            variant="outlined"
          />

          <Box sx={{ position: "relative" }}>
            <TextField
              label={isRegister ? "New Password" : "Password"}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              variant="outlined"
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              sx={{ position: "absolute", right: 8, top: "25%" }}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {isRegister ? "Register" : "Log In"}
          </Button>
        </Box>

        <Typography align="center" mt={3}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                component="button"
                onClick={() => {
                  setIsRegister(false);
                  setMessage(null);
                }}
                underline="hover"
              >
                Log in here
              </Link>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <Link
                component="button"
                onClick={() => {
                  setIsRegister(true);
                  setMessage(null);
                }}
                underline="hover"
              >
                Register now
              </Link>
            </>
          )}
        </Typography>
      </Paper>
    </Box>
  );
}
