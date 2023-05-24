import { createTheme, responsiveFontSizes } from "@mui/material";

let theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#eeeeee",
    },
    dark: {
      main: "#212529",
    },
  },
  typography: {
    h1: {
      fontFamily: "Cubano",
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
      fontFamily: "Cubano",
    },
    p: {
      fontFamily: "Poppins",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Cubano",
          fontSize: "1.25rem",
          "&:hover": {
            color: "white",
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
