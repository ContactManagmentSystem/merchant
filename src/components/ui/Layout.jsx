/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  IconArrowLeft,
  IconCalendarTime,
  IconDatabase,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "./SideBar";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import useUserStore from "../../store/userStore";

export function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { userData, clearUserData } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserData();
    localStorage.clear();
    navigate("/login");
  };

  const links = [
    {
      label: "Landing Management",
      href: "/dashboard/landing-manage",
      icon: (
        <IconUser className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Order Manage",
      href: "/dashboard/order-manage",
      icon: (
        <IconCalendarTime className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Product Manage",
      href: "/dashboard/product-manage",
      icon: (
        <IconPackage className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: handleLogout, // ✅ Hook in logout here
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-full min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-4 md:gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 md:mt-8 flex flex-col gap-1 md:gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  onClick={(e) => {
                    if (link.onClick) {
                      e.preventDefault(); // Prevent page reload
                      link.onClick();
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <SidebarLink
              link={{
                label: `${userData?.email || "User"}`,
                href: "#",
                icon: (
                  <img
                    src="https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
                    className="h-5 w-5 md:h-7 md:w-7 bg-white flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 w-full min-w-0">
        <div className="p-2 sm:p-4 md:p-6 lg:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full min-h-screen overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-1 md:space-x-2 items-center text-xs sm:text-sm py-1 relative z-20"
    >
      <IconDatabase className="h-4 w-5 md:h-5 md:w-6 text-gray-600 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre text-xs sm:text-sm break-words"
      >
        Landing Management
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-1 md:space-x-2 items-center text-xs sm:text-sm text-black py-1 relative z-20"
    >
      <div className="h-4 w-5 md:h-5 md:w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
