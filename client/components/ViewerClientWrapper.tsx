"use client"

import React from "react";
import ViewerClient from "./ViewerClient";

interface Props {
  url: string;
}

export default function ViewerClientWrapper({ url }: Props) {
  return <ViewerClient url={url} />;
}
