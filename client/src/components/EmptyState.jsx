import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({ title = "No records found", subtitle = "Try adjusting your filters.", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
        <Icon size={22} className="text-slate-500" />
      </div>
      <p className="font-medium text-slate-300">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}
