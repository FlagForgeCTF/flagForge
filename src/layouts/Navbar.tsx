import logo from "@/assets/img/flagforge-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { authenticated, user } = useAuth();
  return (
    <>
      <div className="px-6 py-2 flex items-center justify-between bg-white shadow-md shadow-gray-100 max-sm:px-4 max-w-screen-2xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="FlagForge logo" className="w-[3.8rem]" />
          <p className="text-xl font-extrabold tracking-tight max-xs:hidden">
            FlagForge
          </p>
        </Link>
        {authenticated ? (
          <div className="flex gap-6 items-center">
            <Link to="/">Home</Link>
            <Link to="/problems">Problems</Link>
            <Link to="/leaderboard">Leaderboard</Link>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2">
                  {user?.image !== "" ? (
                    <img
                      src={user?.image}
                      alt={`${user?.name} avatar`}
                      className="w-7 rounded-full"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-200 rounded-full text-xs">
                      {user?.name.slice(0)[0]}
                    </p>
                  )}
                  <span>{user?.name.split(" ")[0]}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-3 min-w-44">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Dashboard</DropdownMenuItem>
                <DropdownMenuItem>
                  <button className="text-red-500 flex items-center gap-2">
                    <LogOut /> <p>Log out</p>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login">
              <Button className="font-bold" variant={"outline"}>
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="font-bold">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
