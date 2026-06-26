"use client";

import Link from "next/link";
import { Coffee, ListChecks, LineChart } from "lucide-react";
import { useState } from "react";
import { SessionProvider } from "@/components/SessionProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Home() {
  const [buyCoffeeOpen, setBuyCoffeeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#131313] text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-24 w-24 rounded-3xl bg-[#32a893] grid place-items-center shadow-2xl shadow-[#32a893]/40">
            <span className="text-4xl font-black text-white tracking-tight">RS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WinLo Forecast</h1>
          <p className="text-sm text-[#a1a1aa]">Results • Forecasts • Fast</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Link
            href="/chat"
            className="group flex items-center gap-4 w-full rounded-2xl bg-[#32a893] hover:bg-[#2a8a77] active:scale-[0.98] transition-all p-5 text-white shadow-lg shadow-[#32a893]/30"
          >
            <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center">
              <ListChecks className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Check Results</div>
              <div className="text-xs text-white/80">Latest draws by game & date</div>
            </div>
          </Link>

          <Link
            href="/chat"
            className="group flex items-center gap-4 w-full rounded-2xl bg-[#1a1a1a] hover:bg-[#262626] active:scale-[0.98] transition-all p-5 border border-white/5"
          >
            <div className="h-12 w-12 rounded-xl bg-[#32a893]/20 text-[#32a893] grid place-items-center">
              <LineChart className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Forecast</div>
              <div className="text-xs text-[#a1a1aa]">Hot, cold, due & picks</div>
            </div>
          </Link>

          <Dialog open={buyCoffeeOpen} onOpenChange={setBuyCoffeeOpen}>
            <DialogTrigger asChild>
              {/* <button className="group flex items-center gap-4 w-full rounded-2xl bg-[#1a1a1a] hover:bg-[#262626] active:scale-[0.98] transition-all p-5 border border-white/5 text-left">
                <div className="h-12 w-12 rounded-xl bg-[#ffa726]/20 text-[#ffa726] grid place-items-center">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Buy Me Coffee</div>
                  <div className="text-xs text-[#a1a1aa]">Support in Maintaining the App.</div>
                </div>
              </button> */}
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Buy Me a Coffee</DialogTitle>
                <DialogDescription>
                  Scan the QR code or send to the Opay number below.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="rounded-xl border border-white/10 bg-white p-3">
                  <img
                    src="/8109016165.png"
                    alt="Opay QR Code"
                    width={180}
                    height={180}
                    className="h-[180px] w-[180px] object-contain"
                  />
                </div>
                <div className="w-full rounded-xl bg-[#1a1a1a] border border-white/5 p-3 text-center">
                  <p className="text-xs text-[#a1a1aa] mb-1">Opay Account</p>
                  <p className="text-sm font-medium text-white">+234 8109016165</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-[11px] text-[#a1a1aa]/70 text-center">
          Not affiliated with any lottery operator. For entertainment.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  );
}