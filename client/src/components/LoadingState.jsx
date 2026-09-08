import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
      <Loader2 size={24} className="animate-spin mb-2" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
