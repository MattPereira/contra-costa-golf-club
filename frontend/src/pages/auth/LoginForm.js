import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import {
  Button,
  Typography,
  Paper,
  Container,
  Box,
  TextField,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import SiteHero from "../../components/SiteHero";
/** Login form.
 *
 * Shows form and manages updates to state on changes.
 * On submission:
 * - calls login function prop
 * - redirects to "/" route
 *
 * Router -> RegisterForm
 * Routed to "/login"
 */
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "30px",
  backgroundColor: "#eeeeee",
}));

const StyledTextField = styled(TextField)({
  backgroundColor: "white",
  width: "100%",
});

const LoginForm = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState([]);

  console.debug(
    "LoginForm",
    "login=",
    typeof login,
    "formData=",
    formData,
    "formErrors=",
    formErrors
  );

  //update state of formData onChange of any form input field
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.email = formData.email.toLowerCase();
    console.log(formData.email);

    try {
      let result = await login(formData);
      if (result.success) {
        navigate("/");
      } else {
        setFormErrors(result.errors);
      }
    } catch (e) {
      console.error("LoginForm handleSubmit error", e);
      setFormErrors(["Login failed for cloud reasons"]);
    }
  };

  return (
    <Box>
      <SiteHero />

      <Container sx={{ py: 5 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={0}>
              <Typography variant="h1" sx={{ pt: 3 }}>
                Login
              </Typography>

              <Box sx={{ pb: 3, px: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="p">
                    To join our club you must request access from an admin
                    member.
                  </Typography>
                </Box>
                <Form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <StyledTextField
                      id="email"
                      name="email"
                      label="Email"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  {/* <Box sx={{ mb: 3 }}>
                    <StyledTextField
                      id="password"
                      name="password"
                      type="password"
                      label="Password"
                      variant="outlined"
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      sx={{ width: "100%" }}
                    />
                  </Box> */}
                  {formErrors.length
                    ? formErrors.map((err) => (
                        <Alert variant="danger" key={err}>
                          {err}
                        </Alert>
                      ))
                    : null}

                  <Box sx={{ textAlign: "end" }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ borderRadius: "30px", px: 3, py: 1 }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Form>
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginForm;
