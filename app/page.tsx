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
  Paper
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function HomePage() {
  return (
    <Box>
      <Navbar />
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "start",
          height: "90vh",
          textAlign: "center",
          pt: 4,
        }}
      >
        {/* Month Navigation */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2}
        >
          <IconButton aria-label="previous month">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            February, 2025
          </Typography>
          <IconButton aria-label="next month">
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Calendar Design (Spreadsheet Style) */}
        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  
                </TableCell>
                {[...Array(28)].map((_, i) => (
                  <TableCell
                    key={i}
                    sx={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    {i + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Example row for design */}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Excercise
                </TableCell>
                {[...Array(28)].map((_, i) => (
                  <TableCell key={i} sx={{ textAlign: "center" }} />
                ))}
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
