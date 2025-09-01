"use client";

import { Button } from "../ui/button";
import { CloudLightning } from "lucide-react";

export function Upgrade() {
  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className="ml-2 flex cursor-pointer items-center justify-center gap-2 text-orange-500"
    >
      <CloudLightning /> Upgrade
    </Button>
  );
}
