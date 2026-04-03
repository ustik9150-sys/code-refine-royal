import React, { useState, useEffect } from "react";
import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import CodFormLogo from "@/components/CodFormLogo";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Lock,
  FileText,
  Bell,
  User,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Zap,
  Table2,
  Truck,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const navItems = [
  { to: "/admin/analytics", icon: BarChart3, label: "الإحصائيات" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/products", icon: Package, label: "المنتجات" },
  { to: "/admin/cod-form", icon: Zap, label: "CodForm", badge: "PRO", customLabel: true },
  { to: "/admin/cod-network", icon: Truck, label: "CodNetwork" },
  { to: "/admin/google-sheets", icon: Table2, label: "Google Sheets" },
  { to: "/admin/pages", icon: FileText, label: "الصفحات" },
  { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    if (error) {
      toast({ title: "خطأ", description: "البريد أو كلمة المرور غير صحيحة", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl"
      style={{ background: "linear-gradient(145deg, hsl(228 30% 8%) 0%, hsl(250 35% 14%) 40%, hsl(280 25% 12%) 70%, hsl(228 30% 8%) 100%)" }}>
      
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(250 80% 65% / 0.3), transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(340 75% 55% / 0.2), transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(220 60% 50% / 0.15), transparent 70%)" }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        {/* Card */}
        <div className="relative rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(170deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 120px -40px hsl(250 80% 65% / 0.1)",
            backdropFilter: "blur(40px)",
          }}>
          
          {/* Top accent line */}
          <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, hsl(250 80% 65%), hsl(340 75% 55%), transparent)" }} />
          
          <div className="p-8 pt-10 pb-10">
            {/* Logo / Icon */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(135deg, hsl(250 80% 65% / 0.2), hsl(340 75% 55% / 0.15))",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px hsl(250 80% 65% / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}>
                  <Lock className="w-8 h-8 text-white/80" />
                </div>
                {/* Glow behind icon */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-40 rounded-full"
                  style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(340 75% 55%))" }} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-[22px] font-bold text-white mb-2 tracking-tight">لوحة التحكم</h1>
              <p className="text-[13px] text-white/40 leading-relaxed">
                {resetMode ? "أدخل بريدك لإعادة تعيين كلمة المرور" : "سجل دخولك للمتابعة"}
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {resetMode ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider px-1">البريد الإلكتروني</label>
                    <div className="relative">
                      <input type="email" placeholder="your@email.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} dir="ltr"
                        className="w-full h-12 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "hsl(250 80% 65% / 0.5)"; e.target.style.boxShadow = "0 0 0 3px hsl(250 80% 65% / 0.1), inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl font-semibold text-[14px] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, hsl(250 80% 60%), hsl(280 70% 55%), hsl(340 75% 55%))",
                      boxShadow: "0 8px 24px -4px hsl(250 80% 60% / 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}>
                    <span className="relative z-10">{loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(280 70% 60%), hsl(340 75% 60%))" }} />
                  </button>
                  <button type="button" onClick={() => setResetMode(false)}
                    className="w-full text-[13px] text-white/35 hover:text-white/60 transition-colors py-2">
                    العودة لتسجيل الدخول
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider px-1">البريد الإلكتروني</label>
                    <input type="email" placeholder="your@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} dir="ltr"
                      className="w-full h-12 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "hsl(250 80% 65% / 0.5)"; e.target.style.boxShadow = "0 0 0 3px hsl(250 80% 65% / 0.1), inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider px-1">كلمة المرور</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={(e) => setPassword(e.target.value)} dir="ltr"
                        className="w-full h-12 rounded-xl px-4 pl-12 text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "hsl(250 80% 65% / 0.5)"; e.target.style.boxShadow = "0 0 0 3px hsl(250 80% 65% / 0.1), inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03)"; }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Forgot password link */}
                  <div className="flex justify-start">
                    <button type="button" onClick={() => setResetMode(true)}
                      className="text-[12px] text-white/30 hover:text-white/55 transition-colors">
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl font-semibold text-[14px] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, hsl(250 80% 60%), hsl(280 70% 55%), hsl(340 75% 55%))",
                      boxShadow: "0 8px 24px -4px hsl(250 80% 60% / 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          جاري الدخول...
                        </>
                      ) : "تسجيل الدخول"}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(280 70% 60%), hsl(340 75% 60%))" }} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom subtle branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-white/15 mt-6"
        >
          Powered by CodForm
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAdmin, loading, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState("");
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminEmail(data.user?.email || "");
    });
  }, [isAuthenticated]);

  // Fetch recent orders for notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchRecent = async () => {
      const since = new Date();
      since.setHours(since.getHours() - 24);
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, created_at, status")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setRecentOrders(data);
        setUnreadCount(data.filter((o: any) => o.status === "pending").length);
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, hsl(228 24% 10%) 0%, hsl(250 30% 18%) 50%, hsl(340 30% 15%) 100%)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
        style={{ background: "linear-gradient(135deg, hsl(228 24% 10%) 0%, hsl(250 30% 18%) 50%, hsl(340 30% 15%) 100%)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 p-8 text-center space-y-4 max-w-sm"
          style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.4)" }}
        >
          <Lock className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-lg font-bold text-foreground">غير مصرح</h2>
          <p className="text-sm text-muted-foreground">ليس لديك صلاحية الوصول للوحة التحكم</p>
          <Button variant="outline" onClick={() => { supabase.auth.signOut(); }}>تسجيل الخروج</Button>
        </motion.div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted/50" dir="rtl">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Premium iOS-style Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collapsed ? "w-[78px]" : "w-[272px]"
        } ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        {/* Floating glass container */}
        <div className="flex flex-col h-full m-2.5 rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(165deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.45) 100%)",
            backdropFilter: "blur(50px) saturate(180%)",
            WebkitBackdropFilter: "blur(50px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
          }}
        >
          {/* Glass light reflection */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-full h-1/3 opacity-[0.06]"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)" }} />
          </div>

          {/* Logo area */}
          <div className={`relative z-10 flex items-center h-[68px] border-b border-black/[0.06] ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-bold text-[15px] text-foreground tracking-tight">لوحة التحكم</span>
              </motion.div>
            )}
            {collapsed && (
              <span className="font-bold text-[13px] text-foreground">⚡</span>
            )}
            <button
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); else setCollapsed(!collapsed); }}
              className="p-1.5 rounded-[10px] hover:bg-black/[0.05] transition-all duration-200 group"
            >
              {window.innerWidth < 1024 ? (
                <X className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
              ) : collapsed ? (
                <ChevronLeft className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
              )}
            </button>
          </div>

          {/* Nav items */}
          <nav className="relative z-10 flex-1 py-3 space-y-0.5 px-2.5 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-[14px] text-[13px] font-medium transition-all duration-300 ease-out ${
                    collapsed ? "justify-center px-2 py-3" : "px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-foreground/55 hover:text-foreground/80 hover:bg-black/[0.04]"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02))",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)",
                      }
                    : {}
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {/* Active indicator dot */}
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="sidebar-active-dot"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                        style={{ background: "linear-gradient(180deg, hsl(250 80% 65%), hsl(340 75% 55%))" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`flex-shrink-0 ${isActive ? "drop-shadow-[0_0_4px_rgba(100,80,200,0.3)]" : ""}`}
                    >
                      <item.icon className={`w-[18px] h-[18px] transition-all duration-300 ${isActive ? "text-foreground" : "text-foreground/50 group-hover:text-foreground/75"}`} />
                    </motion.div>

                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        className="flex items-center gap-2"
                      >
                        {(item as any).customLabel ? <CodFormLogo size="sm" variant="dark" /> : item.label}
                        {(item as any).badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "linear-gradient(135deg, hsl(250 80% 60% / 0.2), hsl(340 75% 55% / 0.15))",
                              color: "hsl(250 80% 80%)",
                              border: "1px solid hsl(250 80% 60% / 0.2)",
                            }}>
                            {(item as any).badge}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User / Logout */}
          <div className="relative z-10 p-2.5 border-t border-black/[0.06]">
            {!collapsed && adminEmail && (
              <div className="px-3 py-2 mb-1 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(250 60% 50% / 0.1), hsl(340 60% 50% / 0.08))",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}>
                  <User className="w-3.5 h-3.5 text-foreground/40" />
                </div>
                <p className="text-[10px] text-foreground/40 truncate">{adminEmail}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`group flex items-center gap-3 rounded-[14px] text-[13px] font-medium text-red-500/60 hover:text-red-500 w-full transition-all duration-300 hover:bg-red-500/[0.06] ${
                collapsed ? "justify-center px-2 py-3" : "px-3.5 py-2.5"
              }`}
            >
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              </motion.div>
              {!collapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 admin-glass-nav sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden"
                  dir="rtl"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">الإشعارات</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {recentOrders.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        لا توجد إشعارات
                      </div>
                    ) : (
                      recentOrders.map((order: any) => {
                        const time = new Date(order.created_at);
                        const ago = Math.round((Date.now() - time.getTime()) / 60000);
                        const agoText = ago < 60 ? `منذ ${ago} د` : ago < 1440 ? `منذ ${Math.round(ago / 60)} س` : "أمس";
                        return (
                          <button
                            key={order.id}
                            onClick={() => { navigate("/admin/orders"); setShowNotifications(false); }}
                            className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-right ${order.status === "pending" ? "bg-primary/[0.03]" : ""}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${order.status === "pending" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                طلب جديد #{order.order_number}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {order.customer_name} — {order.total} ر.س
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{agoText}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <button
                    onClick={() => { navigate("/admin/orders"); setShowNotifications(false); }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-center border-t border-border hover:bg-muted/50 transition-colors"
                    style={{ color: "hsl(250 80% 60%)" }}
                  >
                    عرض كل الطلبات
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin avatar / Profile */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(250 80% 65% / 0.15), hsl(340 75% 55% / 0.1))",
                  color: "hsl(250 80% 65%)",
                }}>
                <User className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden"
                  dir="rtl"
                >
                  <div className="px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, hsl(250 80% 65% / 0.15), hsl(340 75% 55% / 0.1))",
                          color: "hsl(250 80% 65%)",
                        }}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">المسؤول</p>
                        <p className="text-[11px] text-muted-foreground truncate" dir="ltr">{adminEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate("/admin/settings"); setShowProfile(false); }}
                      className="w-full px-4 py-2.5 text-sm text-right flex items-center gap-3 hover:bg-muted/50 transition-colors text-foreground"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      الإعدادات
                    </button>
                    <button
                      onClick={() => { handleLogout(); setShowProfile(false); }}
                      className="w-full px-4 py-2.5 text-sm text-right flex items-center gap-3 hover:bg-muted/50 transition-colors text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
