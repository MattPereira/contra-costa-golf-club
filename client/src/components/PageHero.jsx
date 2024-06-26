import { Paper, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function PageHero({ title, backgroundImage, position, date }) {
  console.log("date", date);
  const isoDate = new Date(date);
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  };
  const compactDate = isoDate.toLocaleDateString("en-US", options);
  return (
    <Box>
      <Paper
        sx={{
          height: { xs: "150px", sm: "275px" },
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
        <h2 className="font-cubano text-4xl md:text-5xl xl:text-6xl text-white mb-3">
          {title}
        </h2>
        {date && (
          <Link
            to={`/tournaments/${date}`}
            className="border-2 hover:bg-whit border-white text-white px-3 py-[5px] rounded-md"
          >
            <p className="font-cubano text-xl">{compactDate}</p>
          </Link>
        )}
      </Paper>
    </Box>
  );
}
