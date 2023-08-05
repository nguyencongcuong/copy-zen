import { useBearStore } from "../../store.ts";
import { shallow } from "zustand/shallow";
import { colors, Stack, Typography } from "@mui/material";
import { CheckCircleTwoTone, CopyAllRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Clip, ClipboardProps } from "./clipboards.interface.ts";
import { CHANNEL } from "../../../electron/channel.ts";

export function Clipboard(props: ClipboardProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = (content: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].copyToClipboard(content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      gap={1}
      sx={{
        backgroundColor: colors.grey["100"],
        padding: "1rem",
        borderRadius: "5px",
      }}
    >
      <Typography>{props.clip.content}</Typography>
      {isCopied ? (
        <CheckCircleTwoTone color={"success"} />
      ) : (
        <CopyAllRounded
          className={"icon"}
          onClick={() => handleCopy(props.clip.content)}
        />
      )}
    </Stack>
  );
}

export function Clipboards() {
  const [clips, addClip, maxClips] = useBearStore(
    (state) => [state.clips, state.addClip, state.maxClips],
    shallow,
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(
      CHANNEL.CLIPBOARD_UPDATED,
      (_event: any, message: Clip) => {
        addClip(message, maxClips);
      },
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].initializeTray(clips);
  }, [clips]);

  return (
    <>
      <Stack direction={"column"} gap={1}>
        {clips.map((clip, index) => (
          <Clipboard key={index} clip={clip} />
        ))}
      </Stack>
    </>
  );
}
