import { Slider, Stack, Tooltip } from "@mui/material";
import { ClearAllTwoTone } from "@mui/icons-material";
import { useBearStore } from "../../store.ts";
import { shallow } from "zustand/shallow";

export function Settings() {
  const [maxClips, setMaxClips, resetClips] = useBearStore(
    (state) => [state.maxClips, state.setMaxClips, state.resetClips],
    shallow,
  );

  return (
    <Stack sx={{ width: "100%" }}>
      <Tooltip title={"Clear All"}>
        <ClearAllTwoTone onClick={resetClips} />
      </Tooltip>

      <Tooltip title={"Max Clips"}>
        <Slider
          aria-label="Temperature"
          defaultValue={10}
          valueLabelDisplay="auto"
          step={5}
          marks
          min={10}
          max={100}
          value={maxClips}
          onChange={(e: any) => {
            setMaxClips(e.target.value);
          }}
        />
      </Tooltip>
    </Stack>
  );
}
