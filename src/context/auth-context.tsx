import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
} from "react";
import { UserI } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContextType } from "@/types/context";
import LoadingScreen from "@/components/Loading";
import api, { endpoints } from "@/utils/api";
import { RegisterFormData } from "@/types/register";
import Cookies from "js-cookie";
// import { jwtDecode, JwtPayload } from "jwt-decode";

type Props = {
  children: React.ReactNode;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<UserI | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  // const [initialAuthCheckComplete, setInitialAuthCheckComplete] =
  //   useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const userFromURL = searchParams.get("currentUser");

    if (userFromURL) {
      try {
        const parsedUser = JSON.parse(userFromURL);
        setUser(parsedUser);
        localStorage.setItem("currentUser", JSON.stringify(parsedUser));
        toast({
          title: "Login Successful",
          variant: "success",
        });
        navigate("/problems", { replace: true });
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast({
          title: "Invalid user data",
          variant: "destructive",
        });
        navigate("/login");
      }
    }
  }, [navigate, searchParams, toast]);

  const logout = useCallback(
    async (req: boolean = true) => {
      if (req) {
        try {
          const res = await api.get(endpoints.auth.logout);
          toast({
            title: "Success",
            description: res.data.message,
            variant: "default",
          });
        } catch (err) {
          toast({
            title: "Error",
            // @ts-expect-error error has any type
            description: err.message,
            variant: "destructive",
          });
        }
      }
      setUser(null);
      localStorage.removeItem("currentUser");
      Cookies.remove("__accessToken_");
      Cookies.remove("__refreshToken_");
      navigate("/");
    },
    [navigate, toast]
  );

  const refreshAuthToken = useCallback(async () => {
    const refreshToken = Cookies.get("__refreshToken_");
    if (!refreshToken) return logout();

    try {
      await api.get("/auth/rotateToken", {
        withCredentials: true,
      });

      const accessToken = Cookies.get("__accessToken_");

      if (!accessToken) {
        throw new Error("Failed to fetch new access token.");
      }

      // localStorage.setItem("authToken", data.accessToken);
      api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
      return accessToken;
    } catch (err) {
      console.error("Failed to refresh token", err);
      logout();
    }
  }, [logout]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { data } = await api.get(endpoints.google.callback);
      const accessToken = Cookies.get("__accessToken_");

      setUser(data.user);
      api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      // navigate("/problems");
    } catch (err) {
      console.error(err);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post(
        endpoints.user.login,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const token = Cookies.get("__accessToken_");

      setUser(data.data);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      localStorage.setItem("currentUser", JSON.stringify(data.data));

      // navigate('/dashboard');
    },
    []
  );

  const register = useCallback(async (register: RegisterFormData) => {
    const { data } = await api.post(endpoints.user.register, register, {
      withCredentials: true,
    });
    // const token = data.token;
    const accessToken = Cookies.get("__accessToken_");

    setUser(data.data);
    api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;

    localStorage.setItem("currentUser", JSON.stringify(data.data));

    // navigate('/dashboard');
  }, []);

  const editProfile = useCallback(async (data: UserI) => {
    setUser(data);
    localStorage.setItem("currentUser", JSON.stringify(data));
  }, []);

  const memoizedValue = useMemo(
    () => ({
      user,
      loading,
      authenticated: !!user,
      unauthenticated: !user,
      login,
      loginWithGoogle,
      refreshAuthToken,
      editProfile,
      register,
      logout,
    }),
    [
      user,
      loading,
      login,
      register,
      editProfile,
      refreshAuthToken,
      loginWithGoogle,
      logout,
    ]
  );

  useEffect(() => {
    const refreshTokenExpiry = Cookies.get("__refreshExpiry_");
    if (refreshTokenExpiry) {
      const expiryTime = new Date(refreshTokenExpiry).getTime();
      const currentTime = Date.now();

      const timeout = setTimeout(() => {
        logout();
      }, expiryTime - currentTime);

      return () => clearTimeout(timeout);
    }
  }, [logout]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
