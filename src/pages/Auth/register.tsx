import { Button } from "@/components/ui/button";
import googleIcon from "@/assets/img/Logo-google-icon-PNG.png";
import { useAuth } from "@/context";
import PageTitle from "@/components/PageTitle";
import { ChangeEvent, FormEvent, useState } from "react";
import { RegisterFormData } from "@/types/register";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { ErrorResponseI } from "@/types/context";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const handleGoogleLogin = async () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsPending(true);
    e.preventDefault();
    try {
      const payload: RegisterFormData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      };
      await register(payload);
      toast({
        title: "Registered successfully",
        variant: "success",
      });
      navigate("/problems");
    } catch (error: unknown) {
      const apiError = error as AxiosError<ErrorResponseI>;
      const validationErrors = apiError.response?.data?.errors;

      if (validationErrors && typeof validationErrors === "object") {
        Object.entries(validationErrors).forEach(([, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach((errorMessage) => {
              toast({
                title: `${errorMessage}`,
                variant: "destructive",
              });
            });
          }
        });
      } else {
        toast({
          title: apiError.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <PageTitle title="Register Now" />
      <div className="max-w-lg border border-gray-300 w-full mx-auto mt-8 rounded-xl max-sm:border-0">
        <div className="px-8 py-8 flex flex-col gap-8 max-sm:px-4">
          <p className="text-center text-xl font-bold tracking-tight">
            Fly into FlagForge Where Challenges Take Wings!🪽
          </p>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
            method="post"
          >
            <div className="flex gap-3 w-full">
              <label htmlFor="firstName" className="flex flex-col gap-1 w-full">
                <p className="font-medium text-sm">First Name</p>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  onChange={handleChange}
                  value={formData.firstName}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
                  required
                />
              </label>
              <label htmlFor="lastName" className="flex flex-col gap-1 w-full">
                <p className="font-medium text-sm">Last Name</p>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  onChange={handleChange}
                  value={formData.lastName}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
                  required
                />
              </label>
            </div>
            <label htmlFor="email" className="flex flex-col gap-1">
              <p className="font-medium text-sm">Email address</p>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleChange}
                value={formData.email}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
                required
              />
            </label>
            <div className="flex flex-col gap-4">
              <label htmlFor="password" className="flex flex-col gap-1">
                <p className="font-medium text-sm">Password</p>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-0 focus-within:outline-offset-4 focus-within:outline-primary"
                  required
                />
              </label>
            </div>
            <Button className="font-bold" disabled={isPending}>
              {isPending ? "Registering..." : "Register Now"}
            </Button>
          </form>
          <div className="flex items-center w-full gap-4">
            <hr className="w-full" />
            <p className="text-sm text-gray-400 text-nowrap">
              Or Continue with
            </p>
            <hr className="w-full" />
          </div>

          <div>
            <Button
              variant={"outline"}
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <img src={googleIcon} alt="Google icon" className="w-4" />
              <p>Continue with Google</p>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
