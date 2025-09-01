import { db } from "~/server/db";
import { inngest } from "./client";
import { env } from "~/env";

export const generateSong = inngest.createFunction(
  {
    id: "generate-song",
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFailure: async ({ event, error }) => {
      await db.song.update({
        where: {
          id: (event?.data?.event?.data as { songId: string }).songId,
        },
        data: {
          status: "failed",
        },
      });
    },
  },
  { event: "generate-song-event" },
  async ({ event, step }) => {
    const { songId } = event.data as {
      songId: string;
      userId: string;
    };

    const { userId, credits, endpoint, body } = await step.run(
      "check-credits",
      async () => {
        const song = await db.song.findUniqueOrThrow({
          where: {
            id: songId,
          },
          select: {
            user: {
              select: {
                id: true,
                credits: true,
              },
            },
            prompt: true,
            lyrics: true,
            fullDescribedSong: true,
            describedLyrics: true,
            instrumental: true,
            audioDuration: true,
            guidanceScale: true,
            inferStep: true,
            seed: true,
          },
        });

        type RequestBody = {
          guidance_scale?: number;
          infer_step?: number;
          instrumental?: boolean;
          audio_duration?: number;
          seed?: number;
          prompt?: string;
          lyrics?: string;
          full_described_song?: string;
          described_lyrics?: string;
        };

        let body: RequestBody = {};
        let endpoint = "";

        const commonParams = {
          guidance_scale: song.guidanceScale ?? undefined,
          infer_step: song.inferStep ?? undefined,
          instrumental: song.instrumental ?? undefined,
          audio_duration: song.audioDuration ?? undefined,
          seed: song.seed ?? undefined,
        };

        // Description
        if (song.fullDescribedSong) {
          endpoint = env.GENERATE_FROM_DESCRIPTION;
          body = {
            ...commonParams,
            full_described_song: song.fullDescribedSong,
          };
        }

        // Custom Mode :Custom Lyrics + prompt
        else if (song.prompt && song.lyrics) {
          endpoint = env.GENERATE_WITH_LYRICS;
          body = {
            ...commonParams,
            prompt: song.prompt,
            lyrics: song.lyrics,
          };
        }

        // Custom Mode : Described Lyrics + Prompt
        else if (song.describedLyrics && song.prompt) {
          endpoint = env.GENERATE_WITH_DESCRIBED_LYRICS;
          body = {
            ...commonParams,
            prompt: song.prompt,
            described_lyrics: song.describedLyrics,
          };
        }

        return {
          userId: song.user.id,
          credits: song.user.credits,
          endpoint: endpoint,
          body: body,
        };
      },
    );

    if (credits > 0) {
      // Generate the song
      await step.run("set-status-processing", async () => {
        return await db.song.update({
          where: {
            id: songId,
          },
          data: {
            status: "processing",
          },
        });
      });

      const response = await step.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Modal-Key": env.MODAL_KEY,
          "Modal-Secret": env.MODAL_SECRET,
        },
      });

      await step.run("update-song-results", async () => {
        const responseData = response.ok
          ? ((await response.json()) as {
              s3_key: string;
              cover_image_s3_key: string;
              categories: string[];
            })
          : null;

        await db.song.update({
          where: {
            id: songId,
          },
          data: {
            s3Key: responseData?.s3_key,
            thumbnailS3Key: responseData?.cover_image_s3_key,
            status: response.ok ? "processed" : "failed",
          },
        });

        if (responseData && responseData?.categories.length > 0) {
          await db.song.update({
            where: {
              id: songId,
            },
            data: {
              categories: {
                connectOrCreate: responseData.categories.map(
                  (categoryName) => ({
                    where: {
                      name: categoryName,
                    },
                    create: {
                      name: categoryName,
                    },
                  }),
                ),
              },
            },
          });
        }
      });

      return await step.run("deduct-credist", async () => {
        if (!response.ok) return;

        return await db.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: {
              //decrement: 20,
              decrement : 1,
            },
          },
        });
      });
    } else {
      // Set status as "Not enough Credits"
      await step.run("set-status-no-credit", async () => {
        return await db.song.update({
          where: {
            id: songId,
          },
          data: {
            status: "no credits",
          },
        });
      });
    }
  },
);
