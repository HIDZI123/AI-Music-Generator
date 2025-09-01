"use client";
import React from "react";
import { Button } from "./ui/button";
import { queueSong } from "~/actions/generation";

const CreateSong = () => {
  return <Button onClick={queueSong}>Generate Song</Button>;
};

export default CreateSong;
