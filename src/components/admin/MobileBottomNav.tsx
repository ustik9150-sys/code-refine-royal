import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  Plus,
  User,
  Home,
} from "lucide-react";

const navItems = [
  { to: "/admin/analytics", icon: BarChart3, label: "الرئيسية" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/products", icon: Home, label: "الإحصائيات", isCenter: true },
  { to: "/admin/settings", icon: User, label: "الحساب" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-2.5 left-2.5 right-2.5 z-[999] md:hidden"
      dir="rtl"
    >
      <div
        className="mobile-bottom-nav-glass relative flex items-center justify-around rounded-[22px] px-2 py-1.5"
        style={{
          backdropFilter: "blur(18px) saturate(180%)",
          WebkitBackdropFilter: "blur(18px) saturate(180%)",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.45) inset",
        }}
      >
        {/* Right two items */}
        <NavItem to="/admin/analytics" icon={BarChart3} label="الرئيسية" />
        <NavItem to="/admin/orders" icon={ShoppingCart} label="الطلبات" />

        {/* Center floating FAB */}
        <div className="relative flex flex-col items-center" style={{ width: 64 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/admin/products/new")}
            className="absolute -top-7 w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #00c853, #00e676)",
              boxShadow: "0 8px 24px rgba(0, 200, 83, 0.4)",
            }}
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.button>
          <span className="text-[10px] text-muted-foreground mt-6 font-medium">إضافة</span>
        </div>

        {/* Left two items */}
        <NavItem to="/admin/analytics" icon={BarChart3} label="الإحصائيات" isStats />
        <NavItem to="/admin/settings" icon={User} label="الحساب" />
      </div>

      {/* Dark mode override */}
      <style>{`
        @media (prefers-color-scheme: dark) {
          .mobile-bottom-nav-glass {
            background: rgba(20, 20, 25, 0.75) !important;
          }
        }
        .dark .mobile-bottom-nav-glass {
          background: rgba(20, 20, 25, 0.75) !important;
        }
      `}</style>
    </nav>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  isStats,
}: {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  isStats?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={isStats ? false : undefined}
      className="flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[52px]"
    >
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-0.5"
        >
          <Icon
            className={`w-[22px] h-[22px] transition-colors duration-200 ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            strokeWidth={isActive ? 2.2 : 1.6}
          />
          <span
            className={`text-[10px] font-medium transition-colors duration-200 ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="mobile-nav-dot"
              className="w-1 h-1 rounded-full bg-foreground"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  );
}
