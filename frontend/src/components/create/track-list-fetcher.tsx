"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { getPresignedUrls } from "~/actions/generation";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import TrackList from "./track-list";

const TrackListFetcher = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const songs = await db.song.findMany({
    where: {
      id: session?.user?.id,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const songWithThumbnails = await Promise.all(
    songs.map(async (song) => {
      const thumbnailUrl = song.thumbnailS3Key
        ? await getPresignedUrls(song.thumbnailS3Key)
        : null;

      return {
        id: song.id,
        title: song.title,
        createdAt: song.createdAt,
        instrumental: song.instrumental,
        prompt: song.prompt,
        lyrics: song.lyrics,
        describedLyrics: song.describedLyrics,
        fullDescribedSong: song.fullDescribedSong,
        thumbnailUrl,
        playUrl: null,
        status: song.status,
        createdByUserName: song.user?.name,
        published: song.published,
      };
    }),
  );

  return <TrackList tracks={songWithThumbnails} />;
};

export default TrackListFetcher;
