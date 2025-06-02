import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[450px] w-full items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    </div>
  );
}
