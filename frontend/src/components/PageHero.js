import { Paper, Typography, Box } from "@mui/material";

export default function PageHero({ title, backgroundImage, position, date }) {
  return (
    <Box>
      <Paper
        sx={{
          height: { xs: "175px", sm: "275px" },
          color: "white",
          display: "flex",
          borderRadius: "0px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: backgroundImage
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage}) ${
                position ? position : "center"
              } / cover no-repeat`
            : "black",
        }}
      >
        <Typography variant="h1" sx={{ mb: 0 }}>
          {title}
        </Typography>
        <Typography variant="h3">{date}</Typography>
      </Paper>
    </Box>
  );
}
