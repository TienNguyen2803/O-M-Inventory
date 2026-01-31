"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Warehouse,
  Package,
  BarChart3,
  Loader2,
  AlertCircle,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20"></div>
          <Loader2 className="relative h-10 w-10 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  // Don't render if already logged in (will redirect)
  if (user) {
    return null;
  }

  const features = [
    {
      icon: Package,
      title: "Quản lý vật tư thông minh",
      description: "Theo dõi tồn kho realtime với AI",
      color: "from-blue-500 to-cyan-400",
      iconColor: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Báo cáo & phân tích",
      description: "Dashboard trực quan, insights sâu sắc",
      color: "from-emerald-500 to-teal-400",
      iconColor: "text-emerald-400",
    },
    {
      icon: TrendingUp,
      title: "Tối ưu chuỗi cung ứng",
      description: "Dự báo nhu cầu, giảm chi phí lưu kho",
      color: "from-violet-500 to-purple-400",
      iconColor: "text-violet-400",
    },
    {
      icon: Shield,
      title: "Bảo mật & kiểm soát",
      description: "Phân quyền chi tiết, audit log đầy đủ",
      color: "from-amber-500 to-orange-400",
      iconColor: "text-amber-400",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "50K+", label: "Vật tư" },
    { value: "24/7", label: "Hỗ trợ" },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0a0f1a]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-blue-600/20 blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-indigo-600/20 blur-[100px]" style={{ animationDelay: "1s" }}></div>
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-600/10 blur-[80px]" style={{ animationDelay: "2s" }}></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Left Panel - Branding */}
      <div 
        className={`relative hidden lg:flex lg:w-[55%] flex-col justify-center px-12 xl:px-20 2xl:px-28 transition-all duration-1000 ${
          mounted ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          {/* Logo & Title */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 blur-lg opacity-50"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
                  <Warehouse className="h-9 w-9 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  PowerTrack
                </h1>
                <p className="mt-0.5 text-lg font-medium text-blue-400">Logistics</p>
              </div>
            </div>
            <p className="text-xl leading-relaxed text-slate-400">
              Hệ thống quản lý kho vận <span className="text-white font-medium">thế hệ mới</span>{" "}
              dành cho nhà máy nhiệt điện. Tối ưu vận hành, giảm chi phí, nâng cao hiệu suất.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-12 grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05] ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-2.5 shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div 
            className={`flex items-center gap-8 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted Badge */}
          <div 
            className={`mt-12 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Được tin dùng bởi các nhà máy nhiệt điện hàng đầu
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div 
        className={`relative flex w-full lg:w-[45%] items-center justify-center px-6 py-12 transition-all duration-1000 ${
          mounted ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-[120%] bg-gradient-to-l from-slate-900/80 via-slate-900/60 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 blur opacity-50"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                <Warehouse className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PowerTrack</h1>
              <p className="text-sm text-blue-400">Logistics</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {/* Card Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-white/10">
                <Mail className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Chào mừng trở lại</h2>
              <p className="mt-2 text-slate-400">
                Đăng nhập để tiếp tục làm việc
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email đăng nhập
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.vn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="h-13 rounded-xl border-white/10 bg-white/[0.05] pl-4 pr-4 text-white placeholder:text-slate-500 transition-all duration-200 focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
                    disabled={isSubmitting}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="relative h-13 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:shadow-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Help Text */}
            <div className="rounded-xl bg-slate-800/30 border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">Cần hỗ trợ?</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Liên hệ quản trị viên nếu bạn chưa có tài khoản hoặc gặp vấn đề đăng nhập
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              © 2026 PowerTrack Logistics. All rights reserved.
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-700">
              <Shield className="h-3 w-3" />
              <span>Bảo mật bởi SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
