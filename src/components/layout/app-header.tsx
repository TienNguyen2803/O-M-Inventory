"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === "user-avatar");

  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-card sticky top-0 z-20">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          
          <Image
              src="https://solutions.viettel.vn/storage/logo3.png"
              alt="Viettel Solutions Logo"
              width={120}
              height={26}
              priority
          />
          
          <div className="hidden h-8 items-center gap-4 md:flex">
              <div className="h-full border-l border-border/70" />
              <div>
                  <h1 className="text-base font-semibold tracking-tight">Hệ Thống Quản Lý Kho Thông Minh</h1>
                  <p className="text-xs text-muted-foreground">PhuMyTPC - Phân hệ M&O</p>
              </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="font-semibold text-sm">Nguyễn Văn A</span>
            <span className="text-xs text-muted-foreground">
              Trưởng bộ phận Kho
            </span>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={userAvatar?.imageUrl}
              alt="User"
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>NV</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
