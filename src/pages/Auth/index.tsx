import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import googleIcon from "@/assets/img/Logo-google-icon-PNG.png";

export default function Auth() {
  return (
    <>
      <div className="max-w-lg border border-gray-300 w-full mx-auto mt-8 rounded-xl max-sm:border-0">
        <div className="px-8 py-8 flex flex-col gap-8 max-sm:px-4">
          <p className="text-center text-xl font-bold tracking-tight">
            Fly into FlagForge Where Challenges Take Wings!🪽
          </p>
          <form className="flex flex-col gap-3">
            <label htmlFor="email" className="flex flex-col gap-1">
              <p className="font-medium text-sm">Email address</p>
              <input
                type="text"
                name="email"
                id="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
              />
            </label>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="flex flex-col gap-1">
                <p className="font-medium text-sm">Password</p>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
                />
              </label>
              <Link
                to="/forgot-password"
                className="w-full text-sm font-bold text-primary text-end"
              >
                Forgot Password?
              </Link>
            </div>
            <Button className="font-bold">Log in</Button>
          </form>
          <div className="flex items-center w-full gap-4">
            <hr className="w-full" />
            <p className="text-sm text-gray-400 text-nowrap">
              Or Continue with
            </p>
            <hr className="w-full" />
          </div>

          <div>
            <Link to="/" className="w-full">
              <Button variant={"outline"} className="w-full">
                <img src={googleIcon} alt="Google icon" className="w-4" />
                <p>Continue with Google</p>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
