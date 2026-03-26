"use client";

import ExcavationLoader from "@/components/ExcavationLoader";
import { useParams } from "next/navigation";

export default function Loading() {
  const params = useParams();
  const word = typeof params.word === "string" ? decodeURIComponent(params.word) : "word";
  return <ExcavationLoader word={word} />;
}
