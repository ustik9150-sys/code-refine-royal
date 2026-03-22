import React, { useState, useEffect } from "react";
import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const navItems = [
  { to: "/admin/analytics", icon: BarChart3, label: "الإحصائيات" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/products", icon: Package, label: "المنتجات" },
  { to: "/admin/cod-form", icon: FileText, label: "نموذج الطلب", badge: "PRO" },
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 flex flex-col transition-all duration-300 ease-out ${
          collapsed ? "w-[72px]" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
        style={{
          background: "linear-gradient(180deg, hsl(228 24% 12%) 0%, hsl(228 24% 8%) 100%)",
        }}
      >
        {/* Logo area */}
        <div className={`h-16 flex items-center border-b border-white/5 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
          {!collapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-base text-white/90"
            >
              لوحة التحكم
            </motion.h1>
          )}
          <button
            onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); else setCollapsed(!collapsed); }}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {window.innerWidth < 1024 ? (
              <X className="w-5 h-5 text-white/60" />
            ) : collapsed ? (
              <ChevronLeft className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                } ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "linear-gradient(135deg, hsl(250 80% 65% / 0.3), hsl(340 75% 55% / 0.2))",
                      boxShadow: "0 4px 12px hsl(250 80% 65% / 0.2), inset 0 0 0 1px hsl(250 80% 65% / 0.15)",
                    }
                  : {}
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
                      style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(340 75% 55%))" }}>
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-2 border-t border-white/5">
          {!collapsed && adminEmail && (
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] text-white/30 truncate">{adminEmail}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200 ${
              collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
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
