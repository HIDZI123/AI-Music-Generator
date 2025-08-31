import { inngest } from "./client";

export const generateSong = inngest.createFunction(
  { id: "generate-song" },
  { event: "generate-song-event" },
  async ({ event, step }) => {
    const { songId } = event.data as {
      songId: string;
      userId: string;
    };
  },
);
