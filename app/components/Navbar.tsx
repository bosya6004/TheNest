"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Box, Button} from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <AppBar
        position="static"
        sx={{
          backgroundColor: "#ffffff",
          padding: "0px 30px",
          boxShadow: 2,
          borderBottom: "none",
        }}
      >
        <Toolbar>
          {/* Logo / Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: "#000",
              fontSize: "1 rem",
              fontWeight: 300,
              cursor: "pointer",
            }}
          >
            <Link
            href="/"
            style={{ textDecoration: "none", color: "#000", fontWeight: 300 }}
          >
            The Nest
          </Link>
          </Typography>
          <SignedOut>
                <Button
                  color="inherit"
                  href="/sign-in"
                  sx={{ color: "#000", marginRight: "15px" }}
                >
                  Log In
                </Button>
                <Button
                  color="inherit"
                  href="/sign-up"
                  sx={{ color: "#000", marginRight: "15px" }}
                >
                  Sign Up
                </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>
  );
}
