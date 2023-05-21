import { Paper, Typography, Box } from "@mui/material";

export default function PageHero({ title, backgroundImage }) {
  return (
    <Box>
      <Paper
        sx={{
          height: { xs: "175px", sm: "275px" },
          display: "flex",
          borderRadius: "0px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: backgroundImage
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage}) center / cover no-repeat`
            : "black",
        }}
      >
        <Typography variant="h1" sx={{ color: "white" }}>
          {title}
        </Typography>
      </Paper>
    </Box>
  );
}
