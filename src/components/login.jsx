import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { GoogleLogin } from "@react-oauth/google";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setloading(true);
      const res = await axios.post(`${API_URL}/api/v1/user/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        // Admin redirect (also works for demo admin)
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setloading(false);
    }
  };

  const handleGoogleSignin = async (credentialResponse) => {
    try {
      setloading(true);
      const res = await axios.post(
        `${API_URL}/api/v1/user/google-signin`,
        { token: credentialResponse.credential },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        // Admin redirect
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Google sign in failed");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  },[]);
  return (
    <div className="flex items-center h-screen justify-center bg-background">
      <form
        onSubmit={loginHandler}
        className="shadow-2xl flex flex-col gap-6 p-8 rounded-2xl bg-card border border-border max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo_gradlink.png" alt="Logo" className="h-14" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GradLink</h1>
              <p className="text-xs text-muted-foreground">Login to Connect.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAdminMode((prev) => !prev)}
            className="text-sm text-primary hover:text-primary/80"
          >
            {isAdminMode ? "Switch to user login" : "Admin login"}
          </button>
        </div>
        {isAdminMode ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Admin demo login: <b>demo / demo</b></p>
            <Label htmlFor="username" className="font-semibold text-sm">Username</Label>
            <Input
              type="text"
              value={input.email}
              id="username"
              name="email"
              className="focus-visible:ring-primary bg-secondary border-border rounded-lg"
              placeholder="demo"
              onChange={changeEventHandler}
            />
            <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
            <Input
              type="password"
              id="password"
              value={input.password}
              name="password"
              className="focus-visible:ring-primary bg-secondary border-border rounded-lg"
              placeholder="demo"
              onChange={changeEventHandler}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
              <Input
                type="email"
                value={input.email}
                id="email"
                name="email"
                className="focus-visible:ring-primary bg-secondary border-border rounded-lg"
                placeholder="your@email.com"
                onChange={changeEventHandler}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
              <Input
                type="password"
                id="password"
                value={input.password}
                name="password"
                className="focus-visible:ring-primary bg-secondary border-border rounded-lg"
                placeholder="••••••••"
                onChange={changeEventHandler}
              />
            </div>
          </>
        )}
        {loading ? (
          <Button className="bg-primary hover:bg-primary/90 w-full rounded-lg">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" className="bg-primary hover:bg-primary/90 w-full rounded-lg font-semibold">Login</Button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Google Sign-In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSignin}
            onError={() => toast.error("Google sign in failed")}
          />
        </div>

        <span className="text-center text-sm">
          Don't have an account?{" "}
          <Link to={"/signup"} className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
