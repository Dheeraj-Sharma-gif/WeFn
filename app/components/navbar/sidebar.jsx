"use client";
import { cn } from "../../lib/utils.js";
import React, { useState,useEffect, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props)} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const [mounted, setMounted] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const { open: contextOpen, animate } = useSidebar();

  useEffect(() => setMounted(true), []);

   const open = hoverOpen || contextOpen;

  const childrenWithOpen = React.Children.map(children, (child) =>
    React.isValidElement(child) ? React.cloneElement(child, { open }) : child
  );

  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      {...props}
    >
      {/* Always render children; force labels open on SSR to avoid hydration errors */}
      {mounted
        ? childrenWithOpen
        : childrenWithOpen.map((c) =>
            React.isValidElement(c) ? React.cloneElement(c, { open: true }) : c
          )}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Menu button fixed at top */}
      <div className="fixed top-4 right-4 md:hidden z-30">
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200 w-6 h-6"
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Sliding panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white dark:bg-neutral-900 shadow-lg z-[200] p-6 flex flex-col",
              className
            )}
            {...props}
          >
            <div
              className="absolute right-6 top-6 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(false)}
            >
              <IconX className="w-6 h-6" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export const SidebarLink = ({ link, className, open: propOpen, ...props }) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

   const open = propOpen !== undefined ? propOpen : true;  

  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
       <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open && mounted ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
