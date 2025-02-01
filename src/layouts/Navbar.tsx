import logo from "@/assets/img/flagforge-logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <>
      <div className="px-6 py-2 flex items-center justify-between bg-white shadow-md shadow-gray-100 max-sm:px-4 max-w-screen-2xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="FlagForge logo" className="w-[3.8rem]" />
          <p className="text-xl font-extrabold tracking-tight max-xs:hidden">
            FlagForge
          </p>
        </Link>
        <div>
          <Link to="/signin">
            <Button className="font-bold">Sign in</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
