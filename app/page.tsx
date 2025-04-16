"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { CircularProgress } from "@mui/material";
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
import { ChevronLeft, ChevronRight, Edit, Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import { saveHabit } from "@/lib/saveHabit";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [habits, setHabits] = useState<{ name: string; goal: number }[]>([]);
  const [habitData, setHabitData] = useState<{ [habit: string]: { [day: string]: boolean } }>({});
  const [hoveredHabit, setHoveredHabit] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editHabitOriginalName, setEditHabitOriginalName] = useState("");
  const [editHabitName, setEditHabitName] = useState("");
  const [editHabitGoal, setEditHabitGoal] = useState("");

  const [newHabitDialogOpen, setNewHabitDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitGoal, setNewHabitGoal] = useState("");

  const monthKey = currentDate.format("YYYY-MM");
  const monthName = currentDate.format("MMMM");
  const year = currentDate.year();
  const daysInMonth = currentDate.daysInMonth();
  const startDay = currentDate.startOf("month").day();
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const [newHabitErrors, setNewHabitErrors] = useState({
    name: "",
    goal: "",
  });
  const [newHabitTouched, setNewHabitTouched] = useState(false);
  const [editHabitErrors, setEditHabitErrors] = useState({ name: "", goal: "" });
  const [editHabitTouched, setEditHabitTouched] = useState(false);
  const today = dayjs();
  const isThisMonth = today.format("YYYY-MM") === monthKey;
  const todayDate = today.date();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [habitLimitAlertOpen, setHabitLimitAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


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
      return data.success;
    } catch (err) {
      console.error("Error creating habit:", err);
      return false;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const res = await fetch("/api/delete-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });

      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.filter((h) => h.name !== habitId));
        setHabitData((prev) => {
          const newData = { ...prev };
          delete newData[habitId];
          return newData;
        });
      }
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  const updateHabit = async () => {
    if (!editHabitOriginalName || !editHabitName) return;
  
    try {
      // If the name changed, call rename API
      if (editHabitName !== editHabitOriginalName) {
        const renameRes = await fetch("/api/rename-habit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldName: editHabitOriginalName,
            newName: editHabitName,
          }),
        });
  
        const renameData = await renameRes.json();
        if (!renameData.success) throw new Error(renameData.error || "Rename failed");
      }
  
      // Update goal regardless of rename
      await fetch("/api/edit-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: editHabitName,
          goal: parseInt(editHabitGoal),
        }),
      });
  
      // Update local state
      setHabits((prev) =>
        prev.map((h) =>
          h.name === editHabitOriginalName
            ? { name: editHabitName, goal: parseInt(editHabitGoal) }
            : h
        )
      );
  
      // Move habitData to new name if name changed
      if (editHabitName !== editHabitOriginalName) {
        setHabitData((prev) => {
          const updated = { ...prev };
          updated[editHabitName] = updated[editHabitOriginalName];
          delete updated[editHabitOriginalName];
          return updated;
        });
      }
  
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update habit:", err);
      alert("Something went wrong while updating the habit.");
    }
  };

  const loadHabitsFromFirestore = async () => {
    try {
      setIsLoading(true);
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
      }
    } catch (err) {
      console.error("Error loading habits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) loadHabitsFromFirestore();
  }, [isSignedIn, monthKey]);

  if (isLoading) {
    return (
      <Box>
        <Navbar />
        <Container maxWidth="md" sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <Typography variant="h6" mb={2}>Loading your habits...</Typography>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }
  if (!isSignedIn) {
    return (
      <Box>
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: "100vh",
          pt: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontSize: "1.5rem", color: "gray", mb: 3, textAlign: "center" }}
        >
          Please log in to use The Nest Habit Tracker
        </Typography>

        {/* Autoplaying, silent demo video */}
        <Box
          component="video"
          src="/demo.mp4" // Make sure to place demo.mp4 in the /public folder
          autoPlay
          muted
          loop
          playsInline
          sx={{
            width: "100%",
            maxWidth: "900px",
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            objectFit: "cover",
          }}
        />
      </Container>
    </Box>
    );
    
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 3 }}>
        {/* Month Navigation */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <IconButton onClick={() => changeMonth(-1)} size="small"><ChevronLeft /></IconButton>
          <Typography variant="h6" sx={{ mx: 1 }}>{monthName}, {year}</Typography>
          <IconButton onClick={() => changeMonth(1)} size="small"><ChevronRight /></IconButton>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell
          sx={{
            textAlign: "center",
            fontSize: "1rem",
            padding: "10px",
            color: "blue",
            border: "1px solid lightgray",
            whiteSpace: "nowrap",
          }}
        >
          Habits
        </TableCell>
        {[...Array(daysInMonth)].map((_, i) => (
          <TableCell
          key={i}
          sx={{
            textAlign: "center",
            fontSize: "0.95rem",
            padding: "8px",
            width: "42px",
            minWidth: "42px",
            maxWidth: "42px",
            fontFamily: "monospace",
            border: "1px solid lightgray",
            whiteSpace: "nowrap",
            color:
              isThisMonth && todayDate === i + 1 ? "white" : "gray",
            backgroundColor:
              isThisMonth && todayDate === i + 1 ? "#595353" : "inherit", 
            fontWeight: isThisMonth && todayDate === i + 1 ? "bold" : "normal",
          }}
        >
          {dayNames[(startDay + i) % 7]}
        </TableCell>
        ))}
        <TableCell
          sx={{
            textAlign: "center",
            fontSize: "1rem",
            padding: "8px",
            color: "blue",
            border: "1px solid lightgray",
            width: "80px",
            whiteSpace: "nowrap",
          }}
        >
          Achieved
        </TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            fontSize: "1rem",
            padding: "8px",
            color: "blue",
            border: "1px solid lightgray",
            width: "80px",
            whiteSpace: "nowrap",
          }}
        >
          Goal
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ border: "1px solid lightgray", padding: "8px" }} />
        {[...Array(daysInMonth)].map((_, i) => (
          <TableCell
          key={i}
          sx={{
            textAlign: "center",
            fontSize: "0.95rem",
            padding: "8px",
            width: "42px",
            minWidth: "42px",
            maxWidth: "42px",
            fontFamily: "monospace",
            border: "1px solid lightgray",
            whiteSpace: "nowrap",
            color:
              isThisMonth && todayDate === i + 1 ? "white" : "inherit",
            backgroundColor:
              isThisMonth && todayDate === i + 1 ? "#595353" : "inherit", // light blue
            fontWeight: isThisMonth && todayDate === i + 1 ? "bold" : "normal",
          }}
        >
          {i + 1}
        </TableCell>
        ))}
        <TableCell sx={{ border: "1px solid lightgray", padding: "8px" }} />
        <TableCell sx={{ border: "1px solid lightgray", padding: "8px" }} />
      </TableRow>
    </TableHead>
    <TableBody>
      {habits.map(({ name, goal }, rowIndex) => {
        const achieved = Object.values(habitData?.[name] || {}).filter(Boolean).length;

        const getColors = (index: number) => {
          const colors = [
            { bg: "#e9f7ec", check: "#2e7d32" },
            { bg: "#e3f2fd", check: "#1565c0" },
            { bg: "#fffde7", check: "#f9a825" },
          ];
          return colors[index % colors.length];
        };

        const { bg, check } = getColors(rowIndex);
        const goalMet = achieved >= goal;

        return (
          <TableRow key={name}>
            <TableCell
              onMouseEnter={() => setHoveredHabit(name)}
              onMouseLeave={() => setHoveredHabit(null)}
              sx={{
                position: "relative",
                textAlign: "center",
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid lightgray",
                width: "180px", // wider for ~20 characters
              }}
            >
              {/* Habit Name */}
              <Box
                sx={{
                  visibility: hoveredHabit === name ? "hidden" : "visible",
                  transition: "visibility 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </Box>

              {/* Overlay Edit/Delete Buttons */}
              {hoveredHabit === name && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditHabitOriginalName(name);
                      setEditHabitName(name);
                      setEditHabitGoal(goal.toString());
                      setEditDialogOpen(true);
                    }}
                    sx={{ fontSize: "inherit" }}
                  >
                    <Edit fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setHabitToDelete(name);
                      setConfirmDeleteOpen(true);
                    }}
                    sx={{ fontSize: "inherit" }}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Box>
              )}
            </TableCell>
            {[...Array(daysInMonth)].map((_, i) => {
              const day = (i + 1).toString();
              const checked = habitData?.[name]?.[day] || false;

              return (
                <TableCell
                  key={i}
                  onClick={() => handleCheck(name, day)}
                  sx={{
                    borderLeft:
                      isThisMonth && todayDate === i + 1
                        ? "2px solid black"
                        : "1px solid lightgray",
                    borderRight:
                      isThisMonth && todayDate === i + 1
                        ? "2px solid black"
                        : "1px solid lightgray",
                    borderTop: "1px solid lightgray",
                    borderBottom: "1px solid lightgray",
                    backgroundColor: checked ? bg : "transparent",
                    cursor: "pointer",
                    padding: 0,
                    height: "42px",
                    width: "42px",
                    textAlign: "center",
                  }}
                >
                  {checked && (
                    <Box
                      sx={{
                        fontSize: "1.25rem",
                        color: check,
                        lineHeight: 1,
                      }}
                    >
                      ✓
                    </Box>
                  )}
                </TableCell>
              );
            })}
            <TableCell
              align="center"
              sx={{
                border: "1px solid lightgray",
                fontSize: "1rem",
                padding: "8px",
                backgroundColor: goalMet ? "#dcedc8" : "transparent",
                fontWeight: goalMet ? "bold" : "normal",
              }}
            >
              {achieved}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                border: "1px solid lightgray",
                fontSize: "1rem",
                padding: "8px",
                backgroundColor: goalMet ? "#dcedc8" : "transparent",
                fontWeight: goalMet ? "bold" : "normal",
              }}
            >
              {goal}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</TableContainer>


        {/* + New Habit Button */}
        <Box mt={2}>
          <Button variant="outlined" size="small" 
          onClick={() => {
            if (habits.length >= 10) {
              setHabitLimitAlertOpen(true);
            } else {
              setNewHabitDialogOpen(true);
            }
          }}
          >+ New Habit</Button>
        </Box>

        {/* Create Habit Dialog */}
        <Dialog open={newHabitDialogOpen} onClose={() => setNewHabitDialogOpen(false)}>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Habit Name"
              fullWidth
              value={newHabitName}
              onChange={(e) => {
                setNewHabitName(e.target.value);
                if (newHabitTouched) {
                  setNewHabitErrors((prev) => ({
                    ...prev,
                    name: e.target.value.length > 20 ? "Habit name must be less than 30 characters" : "",
                  }));
                }
              }}
              error={Boolean(newHabitErrors.name)}
              helperText={
                newHabitTouched
                  ? newHabitErrors.name || `${newHabitName.length}/20`
                  : `${newHabitName.length}/20`
              }
            />
            <TextField
              margin="dense"
              label="Monthly Goal"
              fullWidth
              type="number"
              value={newHabitGoal}
              onChange={(e) => {
                setNewHabitGoal(e.target.value);
                if (newHabitTouched) {
                  const val = Number(e.target.value);
                  setNewHabitErrors((prev) => ({
                    ...prev,
                    goal:
                      isNaN(val) || val < 1 || val > 31
                        ? "The goal has to be between 1 - 31"
                        : "",
                  }));
                }
              }}
              error={Boolean(newHabitErrors.goal)}
              helperText={newHabitTouched ? newHabitErrors.goal : ""}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setNewHabitDialogOpen(false);
                setNewHabitErrors({ name: "", goal: "" });
                setNewHabitTouched(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setNewHabitTouched(true);

                const errors = {
                  name:
                    newHabitName.length === 0
                      ? "Habit name is required"
                      : newHabitName.length > 30
                      ? "Habit name must be less than 30 characters"
                      : "",
                  goal:
                    isNaN(Number(newHabitGoal)) ||
                    Number(newHabitGoal) < 1 ||
                    Number(newHabitGoal) > 31
                      ? "The goal has to be between 1 - 31"
                      : "",
                };

                setNewHabitErrors(errors);

                const hasErrors = Object.values(errors).some((e) => e !== "");
                if (hasErrors) return;

                const saved = await createHabit(newHabitName, Number(newHabitGoal));
                if (saved) {
                  setHabits((prev) => [...prev, { name: newHabitName, goal: Number(newHabitGoal) }]);
                  setHabitData((prev) => ({ ...prev, [newHabitName]: {} }));
                  setNewHabitName("");
                  setNewHabitGoal("");
                  setNewHabitErrors({ name: "", goal: "" });
                  setNewHabitTouched(false);
                  setNewHabitDialogOpen(false);
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Habit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => {
          setEditDialogOpen(false);
          setEditHabitTouched(false);
          setEditHabitErrors({ name: "", goal: "" });
        }}>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Habit Name"
              fullWidth
              value={editHabitName}
              onChange={(e) => {
                setEditHabitName(e.target.value);
                if (editHabitTouched) {
                  setEditHabitErrors((prev) => ({
                    ...prev,
                    name: e.target.value.length > 30 ? "Habit name must be less than 30 characters" : "",
                  }));
                }
              }}
              error={Boolean(editHabitErrors.name)}
              helperText={
                editHabitTouched
                  ? editHabitErrors.name || `${editHabitName.length}/30`
                  : `${editHabitName.length}/30`
              }
            />
            <TextField
              margin="dense"
              label="Monthly Goal"
              type="number"
              fullWidth
              value={editHabitGoal}
              onChange={(e) => {
                setEditHabitGoal(e.target.value);
                if (editHabitTouched) {
                  const val = Number(e.target.value);
                  setEditHabitErrors((prev) => ({
                    ...prev,
                    goal:
                      isNaN(val) || val < 1 || val > 31
                        ? "The goal has to be between 1 - 31"
                        : "",
                  }));
                }
              }}
              error={Boolean(editHabitErrors.goal)}
              helperText={editHabitTouched ? editHabitErrors.goal : ""}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
                setEditHabitTouched(false);
                setEditHabitErrors({ name: "", goal: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setEditHabitTouched(true);

                const errors = {
                  name:
                    editHabitName.length === 0
                      ? "Habit name is required"
                      : editHabitName.length > 30
                      ? "Habit name must be less than 30 characters"
                      : "",
                  goal:
                    isNaN(Number(editHabitGoal)) ||
                    Number(editHabitGoal) < 1 ||
                    Number(editHabitGoal) > 31
                      ? "The goal has to be between 1 - 31"
                      : "",
                };

                setEditHabitErrors(errors);

                const hasErrors = Object.values(errors).some((e) => e !== "");
                if (hasErrors) return;

                await updateHabit();
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>Delete Habit</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete the habit "{habitToDelete}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)}>No</Button>
            <Button
              onClick={() => {
                if (habitToDelete) deleteHabit(habitToDelete);
                setConfirmDeleteOpen(false);
                setHabitToDelete(null);
              }}
              color="error"
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={habitLimitAlertOpen} onClose={() => setHabitLimitAlertOpen(false)}>
          <DialogTitle>Habit Limit Reached</DialogTitle>
          <DialogContent>
            <Typography>You can only create up to 10 habits.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHabitLimitAlertOpen(false)} autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
