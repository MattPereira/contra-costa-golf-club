import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import {
  Container,
  Button,
  Typography,
  Paper,
  Box,
  TextField,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

import SiteHero from "../../components/SiteHero";

import CcgcApi from "../../api/api";

const StyledPaper = styled(Paper)({
  borderRadius: "30px",
  backgroundColor: "#eeeeee",
});

const StyledTextField = styled(TextField)({
  backgroundColor: "white",
  width: "100%",
});

/** Register form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * - calls register function prop
 * - redirects to "/" route
 *
 * NOTE: sing the register prop to conditionally render
 *
 * Used for paths "/register" and "/members/create" (which is admin only)
 */

export default function RegisterForm({ register }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isAdmin: false,
  });

  const [formErrors, setFormErrors] = useState([]);

  console.debug(
    "RegisterForm",
    "register=",
    typeof register,
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

    // if the register function is defined (passed in as prop) through the router
    // the register function will login the user and redirect to the homepage
    if (register) {
      //register function passes form data up to parent App component
      let result = await register(formData);
      if (result.success) {
        navigate("/");
      } else {
        setFormErrors(result.errors);
      }
    }
    // if the register function is not defined (passed in as prop) through the router
    // then an admin is creating a user and will be redirected to the dashboard
    else {
      let result = await CcgcApi.createMember(formData);
      console.log("RESULT", result);
      if (result.username) {
        navigate("/dashboard");
      }
    }
  };

  console.log("REGISTER FUNC", register);
  console.log("FORM DATA", formData);

  return (
    <Box>
      <SiteHero />
      <Container sx={{ py: 5 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <StyledPaper elevation={0}>
              <Box sx={{ p: 3 }}>
                <FormControl onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <form>
                    <Typography variant="h1" sx={{ mb: 5 }}>
                      {register ? "Register" : "Create User"}
                    </Typography>
                    {register ? (
                      <Box sx={{ textAlign: "center", my: 5 }}>
                        <Typography variant="p">
                          Already have an account?{" "}
                          <Link to="/login">Login here</Link>
                        </Typography>
                      </Box>
                    ) : null}

                    <Box sx={{ mb: 3 }}>
                      <StyledTextField
                        id="email"
                        name="email"
                        label="Email"
                        type="text"
                        variant="outlined"
                        onChange={handleChange}
                        autoComplete="disabled"
                        required
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <StyledTextField
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        variant="outlined"
                        onChange={handleChange}
                        autoComplete="disabled"
                        required
                        sx={{ width: "100%" }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <StyledTextField
                        id="firstName"
                        name="firstName"
                        type="text"
                        label="First Name"
                        variant="outlined"
                        onChange={handleChange}
                        required
                        sx={{ width: "100%" }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <StyledTextField
                        id="lastName"
                        name="lastName"
                        type="text"
                        label="Last Name"
                        variant="outlined"
                        onChange={handleChange}
                        required
                        sx={{ width: "100%" }}
                      />
                    </Box>
                    {!register && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormLabel sx={{ mr: 3 }} id="user-type">
                            Authorization
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby="user-type"
                            name="row-radio-buttons-group"
                            value={formData.isAdmin}
                            onChange={handleChange}
                            defaultValue={formData.isAdmin ? true : false}
                          >
                            <FormControlLabel
                              value={false}
                              name="isAdmin"
                              control={<Radio />}
                              label="Regular"
                            />
                            <FormControlLabel
                              value={true}
                              name="isAdmin"
                              control={<Radio />}
                              label="Admin"
                            />
                          </RadioGroup>
                        </Box>
                      </Box>
                    )}

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
                  </form>
                </FormControl>
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
