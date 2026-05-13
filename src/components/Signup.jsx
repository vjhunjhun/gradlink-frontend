import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { setAuthUser } from "@/redux/authSlice";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const Signup = () => {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    department: "",
    batch: "",
  });

  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(5, strength);
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { text: "", color: "" };
    if (strength <= 2) return { text: "Weak", color: "text-red-500" };
    if (strength <= 3) return { text: "Fair", color: "text-yellow-500" };
    if (strength <= 4) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const trimmedValue = value?.trim() || "";

    switch (name) {
      case "name":
        if (trimmedValue.length === 0) {
          newErrors.name = "Name is required";
        } else if (trimmedValue.length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (trimmedValue.length > 50) {
          newErrors.name = "Name must not exceed 50 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (trimmedValue.length === 0) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(trimmedValue)) {
          newErrors.email = "Invalid email format";
        } else if (!trimmedValue.endsWith("@pcampus.edu.np")) {
          newErrors.email = "Only @pcampus.edu.np emails allowed";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (trimmedValue.length === 0) {
          newErrors.password = "Password is required";
        } else if (trimmedValue.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (trimmedValue.length > 50) {
          newErrors.password = "Password must not exceed 50 characters";
        } else {
          delete newErrors.password;
        }
        setPasswordStrength(calculatePasswordStrength(trimmedValue));
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
    validateField(name, value);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setShowGoogleForm(true);
      setGoogleData(credentialResponse.credential);
      toast.success("Google email verified! Now fill in your details.");
    } catch (error) {
      console.log(error);
      toast.error("Google verification failed");
    }
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault();
    
    if (!googleData) {
      toast.error("Please verify with Google first");
      return;
    }

    // Validate name and optional fields
    const name = input.name?.trim();
    if (!name || name.length < 2) {
      toast.error("Please enter a valid name (at least 2 characters)");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/v1/user/google-signup`,
        {
          token: googleData,
          name,
          department: input.department || undefined,
          batch: input.batch || undefined,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setShowGoogleForm(false);
        setGoogleData(null);
        setInput({
          name: "",
          email: "",
          password: "",
          gender: "",
          department: "",
          batch: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    
    // Frontend validation - required fields
    const name = input.name?.trim();
    const email = input.email?.trim();
    const password = input.password?.trim();
    const gender = input.gender?.trim();
    const department = input.department?.trim();
    const batch = input.batch?.trim();

    // Validate name
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }
    if (name.length > 50) {
      toast.error("Name must not exceed 50 characters");
      return;
    }

    // Validate email
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!email.endsWith("@pcampus.edu.np")) {
      toast.error("Only @pcampus.edu.np emails are allowed");
      return;
    }

    // Validate password
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password.length > 50) {
      toast.error("Password must not exceed 50 characters");
      return;
    }

    // Validate optional gender if provided
    if (gender && !["male", "female"].includes(gender)) {
      toast.error("Please select a valid gender");
      return;
    }

    // Build submission object with only non-empty fields
    const submitData = {
      name,
      email,
      password,
    };
    
    if (gender) submitData.gender = gender;
    if (department) submitData.department = department;
    if (batch) submitData.batch = batch;

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/v1/user/register`,
        submitData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          name: "",
          email: "",
          password: "",
          gender: "",
          department: "",
          batch: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <form
        onSubmit={signupHandler}
        className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left side: Logo & Welcome */}
        <div className="flex flex-col items-center justify-center md:col-span-2">
          <img src="/logo_gradlink.png" alt="Logo" className="h-16 mb-3" />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GradLink
          </h1>
          <p className="text-sm text-muted-foreground">
            Join to connect with your peers and grow your network.
          </p>
        </div>

        {!showGoogleForm ? (
          <>
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-semibold text-sm">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                className={`bg-secondary rounded-lg ${errors.name ? "border-red-500 border-2" : "border-border focus-visible:ring-primary"}`}
                placeholder="Your name"
                onChange={changeEventHandler}
                value={input.name}
                required
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {input.name.length}/50 characters
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-semibold text-sm">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                className={`bg-secondary rounded-lg ${errors.email ? "border-red-500 border-2" : "border-border focus-visible:ring-primary"}`}
                placeholder="your@pcampus.edu.np"
                onChange={changeEventHandler}
                value={input.email}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="font-semibold text-sm">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                className={`bg-secondary rounded-lg ${errors.password ? "border-red-500 border-2" : "border-border focus-visible:ring-primary"}`}
                placeholder="••••••••"
                onChange={changeEventHandler}
                value={input.password}
                required
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {input.password.length}/50 characters (min. 8)
              </p>
              {input.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${getPasswordStrengthLabel(passwordStrength).color}`}
                  >
                    Strength: {getPasswordStrengthLabel(passwordStrength).text}
                  </p>
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender" className="font-semibold text-sm">
                Gender (Optional)
              </Label>
              <select
                id="gender"
                name="gender"
                className="bg-secondary border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                onChange={changeEventHandler}
                value={input.gender}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="department" className="font-semibold text-sm">
                Department (Optional)
              </Label>
              <select
                id="department"
                name="department"
                className="bg-secondary border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                onChange={changeEventHandler}
                value={input.department}
              >
                <option value="">Select department</option>
                <option value="BCT">BCT</option>
                <option value="BEL">BEL</option>
                <option value="BEX">BEX</option>
                <option value="BME">BME</option>
                <option value="BCE">BCE</option>
              </select>
            </div>

            {/* Batch */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="batch" className="font-semibold text-sm">
                Batch (Optional)
              </Label>
              <select
                id="batch"
                name="batch"
                className="bg-secondary border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                onChange={changeEventHandler}
                value={input.batch}
              >
                <option value="">Select batch</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
                <option value="VII">VII</option>
                <option value="VIII">VIII</option>
              </select>
            </div>

            {/* Submit button */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {loading ? (
                <Button
                  disabled
                  className="flex items-center justify-center bg-primary/50"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    Object.keys(errors).length > 0 ||
                    !input.name ||
                    !input.email ||
                    !input.password
                  }
                  className="bg-primary hover:bg-primary/90 font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Signup
                </Button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Google Sign-Up */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google sign up failed")}
                  text="signup_with"
                />
              </div>

              <span className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Login
                </Link>
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Google Form - Additional Details */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <h2 className="text-xl font-semibold">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground">
                Your @pcampus.edu.np email is verified. Please fill in your
                details:
              </p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-semibold text-sm">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                className="bg-secondary rounded-lg border-border focus-visible:ring-primary"
                placeholder="Your name"
                onChange={changeEventHandler}
                value={input.name}
                required
              />
              <p className="text-xs text-muted-foreground">
                {input.name.length}/50 characters
              </p>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="department" className="font-semibold text-sm">
                Department (Optional)
              </Label>
              <select
                id="department"
                name="department"
                className="bg-secondary border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                onChange={changeEventHandler}
                value={input.department}
              >
                <option value="">Select department</option>
                <option value="BCT">BCT</option>
                <option value="BEL">BEL</option>
                <option value="BEX">BEX</option>
                <option value="BME">BME</option>
                <option value="BCE">BCE</option>
              </select>
            </div>

            {/* Batch */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="batch" className="font-semibold text-sm">
                Batch (Optional)
              </Label>
              <select
                id="batch"
                name="batch"
                className="bg-secondary border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                onChange={changeEventHandler}
                value={input.batch}
              >
                <option value="">Select batch</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
                <option value="VII">VII</option>
                <option value="VIII">VIII</option>
              </select>
            </div>

            {/* Submit button */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {loading ? (
                <Button
                  disabled
                  className="flex items-center justify-center bg-primary/50"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleGoogleSignup}
                    className="bg-primary hover:bg-primary/90 font-semibold w-full"
                  >
                    Create Account with Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowGoogleForm(false);
                      setGoogleData(null);
                      setInput({
                        name: "",
                        email: "",
                        password: "",
                        gender: "",
                        department: "",
                        batch: "",
                      });
                    }}
                    className="w-full"
                  >
                    Back
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default Signup;
