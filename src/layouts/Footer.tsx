import logo from "@/assets/img/flagforge-logo.png";
import { Link } from "react-router";

export default function Footer() {
  return (
    <div className="px-6 py-2 max-w-screen-2xl w-full mx-auto">
      <div className="py-2 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:flex-wrap max-sm:gap-6">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="FlagForge logo" className="w-[3.8rem]" />
          <p className="text-xl font-extrabold tracking-tight">FlagForge</p>
        </Link>
        <div>
          <ul className="flex items-center gap-5 text-sm text-gray-500 font-medium text-nowrap max-xs:flex-col max-sm:items-start max-sm:gap-2">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/licensing">Licensing</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="text-sm text-center py-4">&copy; Maintained by FlagForge</p>
    </div>
  );
}
