import { Paper, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

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
        <h2 className="font-cubano text-4xl">{title}</h2>
        {date && (
          <Link
            to={`/tournaments/${date}`}
            style={{ textDecorationColor: "white", color: "white" }}
          >
            <p className="font-gothic text-2xl font-bold underline">{date}</p>
          </Link>
        )}
      </Paper>
    </Box>
  );
}
