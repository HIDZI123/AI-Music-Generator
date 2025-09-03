"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, Music, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { generateSong, type GenerateRequest } from "~/actions/generation";

const inspirationTags = [
  "80s synth-pop",
  "Acoustic ballad",
  "Epic movie score",
  "Lo-fi hip hop",
  "Driving rock anthem",
  "Summer beach vibe",
];

const styleTags = [
  "Industrial rave",
  "Heavy bass",
  "Orchestral",
  "Electronic beats",
  "Funky guitar",
  "Soulful vocals",
  "Ambient pads",
];

const CustomButton = ({
  text,
  modeVal,
  paraVal,
  setMode,
}: {
  text: string;
  modeVal: "simple" | "custom";
  paraVal: string;
  setMode: React.Dispatch<React.SetStateAction<"simple" | "custom">>;
}) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="mr-2 cursor-pointer"
            size={"sm"}
            variant={"outline"}
            onClick={() => setMode(modeVal)}
          >
            <Plus />
            {text}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{paraVal}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

const SongPanel = () => {
  const [mode, setMode] = useState<"simple" | "custom">("simple");
  const [description, setDescription] = useState("");
  const [instrumental, setInstrumental] = useState(false);
  const [lyricsMode, setLyricsMode] = useState<"write" | "auto">("write");
  const [lyrics, setLyrics] = useState("");
  const [styleInput, setStyleInput] = useState("");
  const [loading, setLoading] = useState(false);

  const InpirationTagHandleClick = (tag: string) => {
    const currentTags = description
      .split(", ")
      .map((s) => s.trim())
      .filter((s) => s);

    if (!currentTags.includes(tag)) {
      if (description.trim() === "") {
        setDescription(tag);
      } else {
        setDescription(description + ", " + tag);
      }
    }
  };

  const StyleTagHandleClick = (style: string) => {
    const currentStyles = styleInput
      .split(", ")
      .map((s) => s.trim())
      .filter((s) => s);

    if (!currentStyles.includes(style)) {
      if (styleInput.trim() === "") {
        setStyleInput(style);
      } else {
        setStyleInput(styleInput + ", " + style);
      }
    }
  };

  const handleCreate = async () => {
    if (mode === "simple" && !description.trim()) {
      toast.error("Please describe your song before creating.");
      return;
    }

    if (mode === "custom" && !styleInput.trim()) {
      toast.error("Please describe your song styles before creating.");
      return;
    }

    let requestBody: GenerateRequest;

    if (mode === "simple") {
      requestBody = {
        fullDescribedSong: description,
        instrumental: instrumental,
      };
    } else {
      const prompt = styleInput;
      if (lyricsMode === "auto") {
        requestBody = {
          prompt: prompt,
          describedLyrics: lyrics,
          instrumental: instrumental,
        };
      } else {
        requestBody = {
          prompt: prompt,
          lyrics: lyrics,
          instrumental: instrumental,
        };
      }
    }

    try {
      setLoading(true);
      await generateSong(requestBody);
      setDescription("");
      setLyrics("");
      setStyleInput("");
    } catch (e) {
      toast.error("Failed to Generate Song");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 flex w-full flex-col border-r lg:w-80">
      <div className="flex-1 overscroll-y-auto p-4">
        <Tabs
          value={mode}
          onValueChange={(val) => setMode(val as "simple" | "custom")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="simple" className="cursor-pointer">
              Simple
            </TabsTrigger>
            <TabsTrigger value="custom" className="cursor-pointer">
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">Describe your Song</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A dreamy lofi pop song perfect for studying or relaxing.."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Lyrics and Instrumental Button */}
            <div className="flex items-center justify-between">
              <CustomButton
                text="Lyrics"
                modeVal="custom"
                paraVal="To add Custom Lyrics"
                setMode={setMode}
              />
              <div className="flex items-center gap-2">
                <label
                  htmlFor="instrumental-switch"
                  className="text-sm font-medium"
                >
                  Instrumental
                </label>
                <Switch
                  className="cursor-pointer"
                  checked={instrumental}
                  onCheckedChange={setInstrumental}
                  id="instrumental-switch"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">Inspirations</label>
              <div className="w-full overflow-x-auto whitespace-nowrap lg:overflow-x-visible lg:whitespace-normal">
                <div className="flex gap-2 pb-2 lg:flex-wrap">
                  {inspirationTags.map((tag) => (
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      key={tag}
                      className="mb-2 h-7 flex-shrink-0 cursor-pointer bg-transparent text-xs"
                      onClick={() => InpirationTagHandleClick(tag)}
                    >
                      <Plus className="mr-1 h-2 w-2" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Lyrics</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={lyricsMode === "auto" ? "secondary" : "ghost"}
                    size={"sm"}
                    className="cursor-pointer"
                    onClick={() => {
                      setLyricsMode("auto");
                      setLyrics("");
                    }}
                  >
                    Auto
                  </Button>
                  <Button
                    variant={lyricsMode === "write" ? "secondary" : "ghost"}
                    size={"sm"}
                    className="cursor-pointer"
                    onClick={() => {
                      setLyricsMode("write");
                      setLyrics("");
                    }}
                  >
                    Write
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder={
                  lyricsMode === "auto"
                    ? "Describe your lyrics e.g, a Song about Lost Love.."
                    : "Add your own lyrics"
                }
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex justify-between gap-2">
              <label
                htmlFor="instrumental-switch"
                className="text-sm font-medium"
              >
                Instrumental
              </label>
              <Switch
                checked={instrumental}
                onCheckedChange={setInstrumental}
                id="instrumental-switch"
                className="cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                Describe your Song Style
              </label>
              <Textarea
                value={styleInput}
                onChange={(e) => setStyleInput(e.target.value)}
                placeholder="Enter Style Tags"
                className="min-h-[60px] resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">Styles</label>
              <div className="w-full overflow-x-auto whitespace-nowrap lg:overflow-x-visible lg:whitespace-normal">
                <div className="flex gap-2 pb-2 lg:flex-wrap">
                  {styleTags.map((style) => (
                    <Badge
                      variant={"secondary"}
                      key={style}
                      className="hover:bg-secondary/80 flex-shrink-0 cursor-pointer text-xs"
                      onClick={() => StyleTagHandleClick(style)}
                    >
                      <Plus className="mr-1 h-2 w-2" />
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t p-4">
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 font-medium text-white hover:from-orange-600 hover:to-pink-600"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Music />}
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default SongPanel;
