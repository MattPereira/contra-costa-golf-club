import React, { useState, useContext } from "react";
import UserContext from "../../lib/UserContext";
import CcgcApi from "../../api/api";
import { Form } from "react-bootstrap";
import {
  Button,
  Box,
  TextField,
  Grid,
  Paper,
  Container,
  Typography,
  InputLabel,
  Alert,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import SiteHero from "../../components/SiteHero";

/** Form to edit user profile
 *
 * Displays profile form and handles changes to local form state.
 * Submission of form calls the API to save, and triggers user
 * reloading throughout the site.
 *
 * Confirmation of a successful save is a simple bootsrap <Alert>.
 *
 * Routed as /profile
 * Routes -> ProfileForm -> Alert
 */

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "30px",
  backgroundColor: "#eeeeee",
}));

const StyledTextField = styled(TextField)({
  backgroundColor: "white",
  width: "100%",
});

export default function ProfileForm() {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    password: "",
  });

  const [formErrors, setFormErrors] = useState([]);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);

  console.debug(
    "ProfileForm",
    "currentUser=",
    currentUser,
    "formData=",
    formData,
    "formErrors=",
    formErrors,
    "updateConfirmed=",
    updateConfirmed
  );

  //update state of formData onChange of any form input field
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
    setFormErrors([]);
  };

  /**on form submission:
   * -attempt save to backend & report any errors
   * -if successful
   *  -clear previous error messages and password
   *  - show update-confirmed alert
   *  - set current user info throughout the site
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    let profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      username: currentUser.username,
    };

    let updatedUser;

    try {
      updatedUser = await CcgcApi.updateProfile(
        currentUser.username,
        profileData
      );
    } catch (errors) {
      debugger;
      setFormErrors(errors);
      return;
    }

    setFormData((fData) => ({ ...fData, password: "" }));
    setFormErrors([]);
    setUpdateConfirmed(true);

    //trigger reloading of user information throughout the site
    setCurrentUser(updatedUser);
  };

  return (
    <Box>
      <SiteHero />
      <Container sx={{ py: 5 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={0}>
              <Box sx={{ p: 3 }}>
                <Form onSubmit={handleSubmit}>
                  <Typography variant="h2" sx={{ mb: 5 }} textAlign="center">
                    User Profile
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="p">
                      Password is not currently being used so enter anything.
                      All other fields should update appropriately on submit.
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <InputLabel sx={{ mb: 1 }} htmlFor="firstName">
                      First Name
                    </InputLabel>
                    <StyledTextField
                      id="firstName"
                      name="firstName"
                      type="text"
                      variant="outlined"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel sx={{ mb: 1 }} htmlFor="lastName">
                      Last Name
                    </InputLabel>
                    <StyledTextField
                      id="lastName"
                      name="lastName"
                      type="text"
                      variant="outlined"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel sx={{ mb: 1 }} htmlFor="email">
                      Email
                    </InputLabel>

                    <StyledTextField
                      id="email"
                      name="email"
                      value={formData.email}
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                      required
                      sx={{ width: "100%", bgcolor: "white" }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel sx={{ mb: 1 }} htmlFor="password">
                      Password
                    </InputLabel>

                    <StyledTextField
                      id="password"
                      name="password"
                      type="password"
                      variant="outlined"
                      onChange={handleChange}
                      required
                      sx={{ width: "100%" }}
                    />
                  </Box>

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
            {updateConfirmed ? (
              <Alert severity="success" sx={{ mt: 3, borderRadius: "20px" }}>
                Profile information updated!
              </Alert>
            ) : null}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
