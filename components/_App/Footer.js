import React from "react";
import { Stack, Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <>
      <Stack
        sx={{
          backgroundColor: "#fff",
          p: "25px",
          borderRadius: "10px 10px 0 0",
          textAlign: "center",
          mt: "15px",
        }}
        className="footer"
      >
        <Box>
          <Typography>
            <strong>ApexFlow</strong> &copy; All Rights Reserved
          </Typography>
        </Box>
      </Stack>
    </>
  );
};

export default Footer;
