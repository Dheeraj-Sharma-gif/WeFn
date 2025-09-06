"use client";

import { Provider, useSelector } from "react-redux";
import { store } from "../redux/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Nav } from "./navbar/Nav";

const publicPaths = ["/", "/signin"];

export default function ClientWrapper({ children }) {
  return (
    <Provider store={store}>
      <AuthWrapper>
        <Nav>{children}</Nav>
      </AuthWrapper>
    </Provider>
  );
}

function AuthWrapper({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      router.push("/signin");
    }
  }, [isLoggedIn, pathname, router]);

  return children;
}
