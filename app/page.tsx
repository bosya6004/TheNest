"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";
import { saveHabit } from "@/lib/saveHabit";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [habits, setHabits] = useState<{ name: string; goal: number }[]>([]);
  const [habitData, setHabitData] = useState<{ [habit: string]: { [day: string]: boolean } }>({});
  const [newHabitDialogOpen, setNewHabitDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitGoal, setNewHabitGoal] = useState("");

  const monthName = currentDate.format("MMMM");
  const year = currentDate.year();
  const monthKey = currentDate.format("YYYY-MM");
  const daysInMonth = currentDate.daysInMonth();
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const startDay = currentDate.startOf("month").day();

  const changeMonth = (direction: number) => {
    setCurrentDate((prevDate) => prevDate.add(direction, "month"));
  };

  const handleCheck = async (habit: string, day: string) => {
    const current = habitData?.[habit]?.[day] || false;
    const updatedValue = !current;

    setHabitData((prev) => ({
      ...prev,
      [habit]: {
        ...prev[habit],
        [day]: updatedValue,
      },
    }));

    try {
      await saveHabit({
        habitId: habit,
        month: monthKey,
        day,
        value: updatedValue,
      });
    } catch (err) {
      console.error("Failed to save habit:", err);
    }
  };


  const createHabit = async (habitId: string, goal: number) => {
    try {
      const res = await fetch("/api/create-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, goal }),
      });
  
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create habit");
  
      return true;
    } catch (err) {
      console.error("Error creating habit:", err);
      return false;
    }
  };
  useEffect(() => {
    const loadAllData = async () => {
      if (!isSignedIn) return;
      await loadHabitsFromFirestore(); // wait for habits to load
    };
  
    loadAllData();
  }, [isSignedIn, monthKey]);

  const loadHabitsFromFirestore = async () => {
    try {
      const res = await fetch("/api/get-habits");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load habits");
  
      setHabits(data.habits);
      
      const response = await fetch("/api/load-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: data.habits.map((h: any) => h.name), month: monthKey }),
      });
  
      const habitData = await response.json();
      if (habitData.success) {
        setHabitData(habitData.habitData);
      } else {
        console.error("Error loading habitData:", habitData.error);
      }
    } catch (err) {
      console.error("Error loading habits:", err);
    }
  };

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

        {/* Calendar */}
        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table sx={{ border: "1px solid lightgray" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ textAlign: "center", fontSize: "0.8rem", color: "blue" }}>
                  Habits
                </TableCell>
                {[...Array(daysInMonth)].map((_, i) => (
                  <TableCell
                    key={i}
                    sx={{ textAlign: "center", fontSize: "0.7rem", color: "gray", width: "18px" }}
                  >
                    {dayNames[(startDay + i) % 7]}
                  </TableCell>
                ))}
                <TableCell sx={{ textAlign: "center", fontSize: "0.8rem", color: "blue" }}>
                  Achieved
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "0.8rem", color: "blue" }}>
                  Goal
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell />
                {[...Array(daysInMonth)].map((_, i) => (
                  <TableCell key={i} sx={{ textAlign: "center", fontSize: "0.7rem" }}>
                    {i + 1}
                  </TableCell>
                ))}
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
                {habits.map(({ name, goal }, index) => {
                  const achieved = Object.values(habitData?.[name] || {}).filter(Boolean).length;

                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: "center", fontSize: "0.8rem" }}>{name}</TableCell>
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = (i + 1).toString();
                        const checked = habitData?.[name]?.[day] || false;

                        return (
                          <TableCell key={i} sx={{ textAlign: "center", width: "18px", height: "18px" }}>
                            <Checkbox
                              size="small"
                              sx={{ p: 0 }}
                              checked={checked}
                              onChange={() => handleCheck(name, day)}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ textAlign: "center", fontSize: "0.8rem" }}>{achieved}</TableCell>
                      <TableCell sx={{ textAlign: "center", fontSize: "0.8rem" }}>{goal}</TableCell>
                    </TableRow>
                  );
                  })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Habit Button */}
        <Box mt={2}>
          <button
            style={{
              padding: "5px 10px",
              fontSize: "0.8rem",
              border: "1px solid lightgray",
              background: "white",
              cursor: "pointer",
            }}
            onClick={() => setNewHabitDialogOpen(true)}
          >
            + New Habit
          </button>
        </Box>
        <Dialog open={newHabitDialogOpen} onClose={() => setNewHabitDialogOpen(false)}>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Habit Name"
              fullWidth
              variant="standard"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Monthly Goal"
              fullWidth
              variant="standard"
              type="number"
              value={newHabitGoal}
              onChange={(e) => setNewHabitGoal(e.target.value)}
            />
          </DialogContent>
            <DialogActions>
              <Button onClick={() => setNewHabitDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!newHabitName) return;

                  const saved = await createHabit(newHabitName, parseInt(newHabitGoal || "0"));
                  if (saved) {
                    setHabitData((prev) => ({
                      ...prev,
                      [newHabitName]: {},
                    }));
                    setHabits((prev) => [...prev, { name: newHabitName, goal: parseInt(newHabitGoal || "0") }]);
                    setNewHabitName("");
                    setNewHabitGoal("");
                    setNewHabitDialogOpen(false);
                  } else {
                    alert("Failed to save habit to Firestore.");
                  }
                }}
              >
                Save
            </Button>
            </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
