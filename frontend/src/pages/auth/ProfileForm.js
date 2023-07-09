import React, { useState, useContext } from "react";
import UserContext from "../../lib/UserContext";
import CcgcApi from "../../api/api";
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

export default function ProfileForm({ memberData }) {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    firstName: memberData ? memberData.firstName : currentUser.firstName,
    lastName: memberData ? memberData.lastName : currentUser.lastName,
    email: memberData ? memberData.email : currentUser.email,
    password: "",
  });

  const [formErrors, setFormErrors] = useState([]);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);

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
      email: formData.email.toLowerCase(),
      password: formData.password,
      username: memberData ? memberData.username : currentUser.username,
    };

    let updatedUser;

    // if memberData is null, then this is a profile update for current user
    if (!memberData) {
      try {
        updatedUser = await CcgcApi.updateProfile(
          currentUser.username,
          profileData
        );
      } catch (errors) {
        setFormErrors(errors);
        return;
      }

      //trigger reloading of user information throughout the site
      setCurrentUser(updatedUser);
    } else {
      // if memberData is not null, then this is an admin updating a member's profile
      try {
        await CcgcApi.updateProfile(memberData.username, profileData);
      } catch (errors) {
        setFormErrors(errors);
        return;
      }
    }

    setFormData((fData) => ({ ...fData, password: "" }));
    setFormErrors([]);
    setUpdateConfirmed(true);
  };

  return (
    <Box>
      <SiteHero />
      <Container sx={{ py: 5 }}>
        <Typography variant="h3" align="center" sx={{ mb: 5 }}>
          Update Profile
        </Typography>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={0}>
              <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
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
                  {/* <Box sx={{ mb: 3 }}>
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
                  </Box> */}

                  <Box sx={{ textAlign: "end" }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ borderRadius: "10px", px: 3, py: 1 }}
                    >
                      Submit
                    </Button>
                  </Box>
                </form>
              </Box>
            </StyledPaper>
            {formErrors.length
              ? formErrors.map((err) => (
                  <Alert severity="error" key={err} sx={{ mt: 3 }}>
                    {err}
                  </Alert>
                ))
              : null}
            {updateConfirmed ? (
              <Alert severity="success" sx={{ mt: 3, borderRadius: "20px" }}>
                Profile information updated for{" "}
                {memberData ? memberData.username : currentUser.username}!
              </Alert>
            ) : null}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
