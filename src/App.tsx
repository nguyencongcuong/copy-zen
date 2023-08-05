import { Clipboards, Settings } from "./components";
import { Box, Container, Stack } from "@mui/material";

function App() {
  return (
    <Container>
      <Stack
        direction={"column"}
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{ height: "90vh" }}
      >
        <Box sx={{ width: "100%", height: "70vh", overflow: "auto" }}>
          <Clipboards />
        </Box>
        <Settings />
      </Stack>
    </Container>
  );
}

export default App;
