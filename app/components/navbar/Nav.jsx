"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar.jsx";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconLogin,
} from "@tabler/icons-react";
import { cn } from "../../lib/utils.js";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/authslice";  

 export const LogoIcon = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white">
    <span className="text-xs font-bold text-white dark:text-black">W</span>
  </div>
);

export function Nav({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
   useEffect(() => setMounted(true), []);

  const authedLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      isButton: true,  
    },
  ];

  const guestLinks = [
    {
      label: "Login",
      href: "/signin",
      icon: <IconLogin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];

  const links = mounted ? (isLoggedIn ? authedLinks : guestLinks) : guestLinks;

  const sidebarLinks = [
    { label: "WeFin", href: "/", icon: <LogoIcon /> },
    ...links,
  ];

  return (
    <div className={cn("flex w-full h-full min-h-screen flex-row bg-gray-100 dark:bg-neutral-800")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto mt-4">
            {sidebarLinks.map((link, idx) =>
              link.isButton ? (
                <button
                  key={idx}
                  onClick={() => dispatch(logoutUser())}
                  className="flex items-center justify-start gap-2 py-2 text-neutral-700 dark:text-neutral-200 text-sm hover:underline"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ) : (
                <SidebarLink
                  key={idx}
                  link={link}
                  open={mounted || link.label === "WeFin"}
                />
              )
            )}
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 w-full overflow-y-auto">{children}</div>
    </div>
  );
}
