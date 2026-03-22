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
} from "lucide-react";

const navItems = [
  { to: "/admin/analytics", icon: BarChart3, label: "الإحصائيات" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/products", icon: Package, label: "المنتجات" },
  { to: "/admin/cod-form", icon: Zap, label: "CodForm", badge: "PRO", customLabel: true },
  { to: "/admin/google-sheets", icon: Table2, label: "Google Sheets" },
  { to: "/admin/pages", icon: FileText, label: "الصفحات" },
  { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: "linear-gradient(135deg, hsl(228 24% 10%) 0%, hsl(250 30% 18%) 50%, hsl(340 30% 15%) 100%)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 p-8 w-full max-w-sm space-y-6"
        style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.4)" }}
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto admin-icon-box">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground mt-4">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            {resetMode ? "أدخل بريدك لإعادة تعيين كلمة المرور" : "سجل دخولك للمتابعة"}
          </p>
        </div>

        {resetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input type="email" placeholder="البريد الإلكتروني" value={email}
              onChange={(e) => setEmail(e.target.value)} dir="ltr" className="admin-input text-center" />
            <button type="submit" className="admin-gradient-btn w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </button>
            <button type="button" onClick={() => setResetMode(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              العودة لتسجيل الدخول
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="البريد الإلكتروني" value={email}
              onChange={(e) => setEmail(e.target.value)} dir="ltr" className="admin-input text-center" />
            <Input type="password" placeholder="كلمة المرور" value={password}
              onChange={(e) => setPassword(e.target.value)} dir="ltr" className="admin-input text-center" />
            <button type="submit" className="admin-gradient-btn w-full" disabled={loading}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
            <button type="button" onClick={() => setResetMode(true)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              نسيت كلمة المرور؟
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAdmin, loading, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminEmail(data.user?.email || "");
    });
  }, [isAuthenticated]);

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
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(250 80% 60%), hsl(280 70% 55%))",
                    boxShadow: "0 2px 12px hsl(250 80% 60% / 0.35)",
                  }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[15px] text-foreground tracking-tight">لوحة التحكم</span>
              </motion.div>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(250 80% 60%), hsl(280 70% 55%))",
                  boxShadow: "0 2px 12px hsl(250 80% 60% / 0.35)",
                }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            <button
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); else setCollapsed(!collapsed); }}
              className="p-1.5 rounded-[10px] hover:bg-white/[0.06] transition-all duration-200 group"
            >
              {window.innerWidth < 1024 ? (
                <X className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
              ) : collapsed ? (
                <ChevronLeft className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
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
                        {(item as any).customLabel ? <CodFormLogo size="sm" variant="light" /> : item.label}
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
          <div className="relative z-10 p-2.5 border-t border-white/[0.06]">
            {!collapsed && adminEmail && (
              <div className="px-3 py-2 mb-1 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(250 60% 50% / 0.2), hsl(340 60% 50% / 0.15))",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <User className="w-3.5 h-3.5 text-white/50" />
                </div>
                <p className="text-[10px] text-white/50 truncate">{adminEmail}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`group flex items-center gap-3 rounded-[14px] text-[13px] font-medium text-red-400/70 hover:text-red-400 w-full transition-all duration-300 hover:bg-red-500/[0.1] ${
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
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>

          {/* Admin avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(250 80% 65% / 0.15), hsl(340 75% 55% / 0.1))",
                color: "hsl(250 80% 65%)",
              }}>
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
