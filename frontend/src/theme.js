import { createTheme, responsiveFontSizes } from "@mui/material";

let theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    dark: {
      main: "#212529",
    },
  },
  typography: {
    h1: {
      fontFamily: "Cubano",
      marginBottom: "1rem",
      fontSize: "5rem",
      textAlign: "center",
    },
    h2: {
      fontFamily: "Cubano",
    },
    h3: {
      fontFamily: "Cubano",
    },
    h4: {
      fontFamily: "Cubano",
    },
    h5: {
      fontFamily: "Cubano",
    },
    h6: {
      fontFamily: "Itim",
      fontSize: "1.3rem",
    },
    p: {
      fontFamily: "Poppins",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "30px",
          fontFamily: "Cubano",
          fontSize: "1.2rem",
          "&:hover": { color: "white" },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
