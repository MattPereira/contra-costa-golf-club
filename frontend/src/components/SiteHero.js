import { Box, Paper, Typography, Grid } from "@mui/material";

import ccgcLogo from "../assets/ccgc_logo_nav.png";

export default function SiteHero() {
  return (
    <Box sx={{ p: 1.5 }}>
      <Paper
        sx={{
          height: { xs: "150px", sm: "275px" },
          borderRadius: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
          padding: "0.5rem",
        }}
      >
        <Grid
          container
          sx={{ alignItems: "center", justifyContent: "center" }}
          spacing={2}
        >
          <Grid item sx={{ display: { xs: "none", lg: "flex" } }}>
            <Box
              component="img"
              src={ccgcLogo}
              alt="CCGC Logo"
              sx={{
                width: { xs: "100px", lg: "150px", xl: "200px" },
                height: "auto",
              }}
            />
          </Grid>
          <Grid item>
            <Typography
              variant="h1"
              sx={{
                color: "white",
                fontSize: "2.5rem",
                mb: 0,
                display: { xs: "none", lg: "block" },
              }}
            >
              Contra Costa Golf Club
            </Typography>
            <Typography
              variant="h1"
              sx={{
                color: "white",
                fontSize: "2.5rem",
                mb: 0,
                display: { xs: "block", lg: "none" },
              }}
            >
              Contra Costa <div>Golf Club</div>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
