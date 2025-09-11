"use client";
import {
  Download,
  Loader2,
  MoreHorizontal,
  Music,
  Music3,
  Pencil,
  Play,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { getSongUrl } from "~/actions/generation";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { renameSong, setPublishedStatus } from "~/actions/song";
import { RenameDialog } from "./rename-dialog";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "~/stores/use-player-store";

export interface Tracks {
  id: string;
  title: string | null;
  createdAt: Date;
  instrumental: boolean;
  prompt: string | null;
  lyrics: string | null;
  describedLyrics: string | null;
  fullDescribedSong: string | null;
  thumbnailUrl: string | null;
  playUrl: string | null;
  status: string | null;
  createdByUserName: string | null;
  published: boolean;
}

const TrackList = ({ tracks }: { tracks: Tracks[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTrackID, setLoadingTrackID] = useState<string | null>(null);
  const [trackToRename, setTrackToRename] = useState<null | Tracks>(null);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const router = useRouter();

  const filteredTracks = tracks.filter(
    (track) =>
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      track.prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTrackSelect = async (track: Tracks) => {
    if (loadingTrackID) return;

    console.log("clicked");
    setLoadingTrackID(track.id);
    const playUrl = await getSongUrl(track.id);
    setLoadingTrackID(null);

    //console.log(playUrl);
    setTrack({
      id: track.id,
      title: track.title,
      url: playUrl,
      artwork: track.thumbnailUrl,
      prompt: track.prompt,
      createdByUserName: track.createdByUserName,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-scroll">
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              placeholder="Search..."
              className="pl-10 hover:border-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            disabled={isRefreshing}
            variant={"outline"}
            className="cursor-pointer"
            onClick={handleRefresh}
          >
            {isRefreshing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCcw className="mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Track List */}

        <div className="space-y-2">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((filteredTrack) => {
              switch (filteredTrack.status) {
                case "failed":
                  return (
                    <div
                      key={filteredTrack.id}
                      className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3"
                    >
                      <div className="bg-destructive/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md">
                        <XCircle className="text-destructive h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-destructive truncate text-sm font-medium">
                          Generation failed
                        </h3>
                        <p className="text-muted-foreground truncate text-xs">
                          Please try creating the song again.
                        </p>
                      </div>
                    </div>
                  );
                case "no credits":
                  return (
                    <div
                      key={filteredTrack.id}
                      className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3"
                    >
                      <div className="bg-destructive/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md">
                        <XCircle className="text-destructive h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-destructive truncate text-sm font-medium">
                          Not Enough Credits
                        </h3>
                        <p className="text-muted-foreground truncate text-xs">
                          Please Purchas Credits before Creating New Songs.
                        </p>
                      </div>
                    </div>
                  );
                case "queued":
                case "processing":
                  return (
                    <div
                      key={filteredTrack.id}
                      className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3"
                    >
                      <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-muted-foreground truncate text-sm font-medium">
                          Processing song...
                        </h3>
                        <p className="text-muted-foreground truncate text-xs">
                          Refresh to check the status.
                        </p>
                      </div>
                    </div>
                  );

                default:
                  return (
                    <div
                      key={filteredTrack.id}
                      onClick={() => handleTrackSelect(filteredTrack)}
                      className="hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors"
                    >
                      <div className="group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        {filteredTrack.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                          <img
                            className="h-full w-full object-cover"
                            src={filteredTrack.thumbnailUrl}
                          ></img>
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <Music3 className="text-muted-foreground h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          {loadingTrackID === filteredTrack.id ? (
                            <Loader2 className="animate-spin text-white" />
                          ) : (
                            <Play className="fill-white text-white" />
                          )}
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="trucate text-sm font-medium">
                            {filteredTrack.title}
                          </h3>
                          {filteredTrack.instrumental && (
                            <Badge variant="outline">Instrumental</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {filteredTrack.prompt}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={async (e) => {
                            e.stopPropagation();
                            //console.log("Published Click");
                            await setPublishedStatus(
                              filteredTrack.id,
                              !filteredTrack.published,
                            );
                          }}
                          variant="outline"
                          size="sm"
                          className={`cursor-pointer ${filteredTrack.published ? "border-red-200" : ""}`}
                        >
                          {filteredTrack.published ? "Unpublish" : "Publish"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={async (e) => {
                                e.stopPropagation();
                                const playUrl = await getSongUrl(
                                  filteredTrack.id,
                                );
                                window.open(playUrl, "_blank");
                                /* try {
                                  const playUrl = await getSongUrl(
                                    filteredTrack.id,
                                  );
                                  const response = await fetch(playUrl);

                                  if (!response.ok) {
                                    throw new Error(
                                      `HTTP error! Status: ${response.status}`,
                                    );
                                  }
                                  alert("Got Url");
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `${filteredTrack.title ?? "song"}.mp3`; // Set the filename
                                  document.body.appendChild(a);
                                  a.click();
                                  alert("Clicked Download");
                                  window.URL.revokeObjectURL(url); // Clean up
                                  document.body.removeChild(a); // Clean up
                                } catch (error) {
                                  console.error("Download failed:", error);
                                  // Handle the error (e.g., show a toast)
                                } */
                              }}
                            >
                              <Download className="mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async (e) => {
                                e.stopPropagation();
                                setTrackToRename(filteredTrack);
                              }}
                            >
                              <Pencil className="mr-2" /> Rename
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
              }
            })
          ) : (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <Music className="text-muted-foreground h-10 w-10" />
              <h2 className="mt-4 text-lg font-semibold">No Music Yet</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchQuery
                  ? "No tracks match your search."
                  : "Create your first song to get started."}
              </p>
            </div>
          )}
        </div>
      </div>
      {trackToRename && (
        <RenameDialog
          track={trackToRename}
          onClose={() => setTrackToRename(null)}
          onRename={(trackId, newTitle) => renameSong(trackId, newTitle)}
        />
      )}
    </div>
  );
};

export default TrackList;
