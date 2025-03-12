"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs"; // Clerk authentication
import Navbar from "@/app/components/Navbar";
import {
  Box,
  Container,
  IconButton,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";

export default function HomePage() {
  const { isSignedIn } = useUser(); // Check if user is logged in
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [habits] = useState(["Workout", "Read"]);

  // Function to change the month
  const changeMonth = (direction: number) => {
    setCurrentDate((prevDate) => prevDate.add(direction, "month"));
  };

  // Get month, year, and days in month
  const monthName = currentDate.format("MMMM");
  const year = currentDate.year();
  const daysInMonth = currentDate.daysInMonth();

  // Weekday initials and first day of the month
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const startDay = currentDate.startOf("month").day();

  // If user is not signed in, show login message
  if (!isSignedIn) {
    return (
      <Box>
        <Navbar />
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontSize: "1.2rem", color: "gray" }}>
            Please Log in to Use The Nest Habit Tracker
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "start",
          height: "90vh",
          textAlign: "center",
          pt: 3,
        }}
      >
        {/* Month Navigation */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <IconButton aria-label="previous month" onClick={() => changeMonth(-1)} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 1, fontSize: "0.9rem", fontWeight: "bold" }}>
            {monthName}, {year}
          </Typography>
          <IconButton aria-label="next month" onClick={() => changeMonth(1)} size="small">
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Calendar Design (Spreadsheet Style) */}
        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table sx={{ border: "1px solid lightgray" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    textAlign: "center",
                    border: "1px solid lightgray",
                    fontSize: "0.8rem",
                    color: "blue",
                  }}
                >
                  Habits
                </TableCell>
                {[...Array(daysInMonth)].map((_, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      textAlign: "center",
                      border: "1px solid lightgray",
                      fontSize: "0.7rem",
                      width: "18px", // Making cells smaller
                      color: "gray", // Light grey color for day initials
                    }}
                  >
                    {dayNames[(startDay + i) % 7]}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    textAlign: "center",
                    border: "1px solid lightgray",
                    fontSize: "0.8rem",
                    color: "blue",
                  }}
                >
                  Goal
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ textAlign: "center", border: "1px solid lightgray" }}></TableCell>
                {[...Array(daysInMonth)].map((_, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      textAlign: "center",
                      border: "1px solid lightgray",
                      fontSize: "0.7rem",
                      width: "18px",
                    }}
                  >
                    {i + 1}
                  </TableCell>
                ))}
                <TableCell sx={{ textAlign: "center", border: "1px solid lightgray" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {habits.map((habit, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid lightgray", fontSize: "0.8rem" }}
                  >
                    {habit}
                  </TableCell>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        textAlign: "center",
                        border: "1px solid lightgray",
                        width: "18px",
                        height: "18px",
                      }}
                    />
                  ))}
                  <TableCell sx={{ textAlign: "center", border: "1px solid lightgray", fontSize: "0.8rem" }}>
                    {habit === "Workout" ? 10 : 6} {/* Example goal values */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add New Habit Button */}
        <Box mt={2}>
          <button
            style={{
              padding: "5px 10px",
              fontSize: "0.8rem",
              border: "1px solid lightgray",
              background: "white",
              cursor: "pointer",
            }}
          >
            + New Habit
          </button>
        </Box>
      </Container>
    </Box>
  );
}
