import logo from "~/assets/logo.png";
import logoSm from "~/assets/logo-sm.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

declare module "react" {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: "high" | "low" | "auto";
  }
}

export const Header = () => {
  return (
    <header className="flex items-center justify-between gap-4 p-2 lg:p-4">
      <img
        src={logoSm}
        alt=""
        fetchpriority="high"
        className="block sm:hidden object-contain object-left w-min h-[36px]"
        height="36px"
      />
      <img
        src={logo}
        alt=""
        fetchpriority="high"
        className="hidden sm:block object-contain object-left w-min h-[53px]"
        height="53px"
      />

      <ConnectButton />
    </header>
  );
};
