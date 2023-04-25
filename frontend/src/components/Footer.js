import React from "react";
import { ReactComponent as MPLogo } from "../assets/MP_CIRCLE.svg";
import { Box, Grid, Typography } from "@mui/material";

import { SvgIcon } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

function Footer() {
  let date = new Date();
  let year = date.getFullYear();
  return (
    <Box
      sx={{
        bgcolor: "black",
        borderRadius: "30px",
        py: 2,
        mb: 1,
        mx: 1,
      }}
    >
      <Grid container justifyContent="center" sx={{ textAlign: "center" }}>
        <Grid
          item
          md={4}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="p" sx={{ color: "white" }}>
            Developed by &nbsp;
            <a
              href="https://matt-pereira.vercel.app/"
              style={{
                color: "white",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Matt Pereira
            </a>
          </Typography>
        </Grid>
        <Grid item md={4} className="footer-body">
          <Grid container justifyContent="center" spacing={3}>
            <Grid item>
              <a href="https://matt-pereira.surge.sh">
                <SvgIcon sx={{ fontSize: "32px" }}>
                  <MPLogo />
                </SvgIcon>
              </a>
            </Grid>
            <Grid item>
              <a
                href="https://www.linkedin.com/in/-matt-pereira-/"
                style={{ color: "white" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon fontSize="large" />
              </a>
            </Grid>
            <Grid item>
              <a
                href="https://github.com/MattPereira"
                style={{ color: "white" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon sx={{ fontSize: "33px" }} />
              </a>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          md={4}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="p" sx={{ color: "white" }}>
            Copyright © {year}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Footer;
