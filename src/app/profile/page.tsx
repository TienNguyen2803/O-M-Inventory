"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  BadgeCheck,
  ArrowLeft,
  Hash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Get initials from user name
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const infoSections = [
    {
      title: "Thông tin cơ bản",
      icon: User,
      items: [
        { label: "Mã nhân viên", value: user.employeeCode, icon: Hash },
        { label: "Phòng ban", value: user.department, icon: Building2 },
        { label: "Vai trò", value: user.role, icon: Shield },
      ],
    },
    {
      title: "Thông tin liên hệ",
      icon: Mail,
      items: [
        { label: "Email", value: user.email, icon: Mail },
        { label: "Số điện thoại", value: user.phone || "Chưa cập nhật", icon: Phone },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-2 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 md:p-8 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-white/20 blur"></div>
              <Avatar className="relative h-24 w-24 border-4 border-white/30 shadow-xl md:h-28 md:w-28">
                <AvatarFallback className="bg-white text-2xl font-bold text-indigo-600 md:text-3xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {user.name}
              </h1>
              <p className="mt-1 text-lg text-white/80">{user.role}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                    user.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "bg-red-500/20 text-red-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.status === "Active" ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {user.status === "Active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
                {/* Department Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                  <Building2 className="h-3.5 w-3.5" />
                  {user.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {infoSections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Activity Card */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Hoạt động</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Đăng nhập gần nhất</p>
                <p className="font-medium">
                  {new Date().toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User ID (subtle) */}
        <p className="text-center text-xs text-muted-foreground">
          ID: {user.id}
        </p>
      </div>
    </div>
  );
}
