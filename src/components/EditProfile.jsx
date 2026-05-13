import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";
import { Loader, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const EditProfile = () => {
    const imageRef = useRef();
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((store) => store.auth);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio,
        gender:user?.gender
    });
    const [passwordInput, setPasswordInput] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, profilePhoto: file });
        }
    }
    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
    }

    const editProfileHandler = async () => {
        // Frontend validation - trim bio
        const bio = input.bio?.trim() || "";
        const gender = input.gender?.trim() || "";

        // Validate gender if provided
        if (gender && !["male", "female"].includes(gender)) {
            toast.error("Please select a valid gender");
            return;
        }

        const formData = new FormData();
        
        // Only append bio if it has content
        if (bio) {
            formData.append("bio", bio);
        }
        
        // Only append gender if it's selected
        if (gender) {
            formData.append("gender", gender);
        }
        
        // Only append profile picture if it's a file (not a string URL)
        if (input.profilePhoto instanceof File) {
            formData.append("profilePicture", input.profilePhoto);
        }

        try {
            setLoading(true);
            const res = await axios.post(
              `${API_URL}/api/v1/user/profile/edit`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
              },
            );
            if (res.data.success) {
                setLoading(false);
                const updatedUserData = {
                    ...user,
                    bio: res.data.user.bio || "",
                    gender: res.data.user.gender || null,
                    profilePicture: res.data.user.profilePicture,
                }
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
      } catch (error) {
          console.log(error);
          setLoading(false);
          toast.error(error.response?.data?.message || "Error updating profile");
      }
    }

    const handleChangePassword = async () => {
        // Validate inputs
        if (!passwordInput.currentPassword || !passwordInput.newPassword || !passwordInput.confirmPassword) {
            toast.error("Please fill all password fields");
            return;
        }

        if (passwordInput.newPassword !== passwordInput.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordInput.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setPasswordLoading(true);
            const res = await axios.post(
              `${API_URL}/api/v1/user/change-password`,
              {
                currentPassword: passwordInput.currentPassword,
                newPassword: passwordInput.newPassword,
                confirmPassword: passwordInput.confirmPassword,
              },
              { withCredentials: true },
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setPasswordInput({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setShowPasswordSection(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    }
    
  return (
    <div className="flex max-w-3xl mx-auto pl-16 bg-background min-h-screen py-8">
      <section className="flex flex-col gap-8 w-full">
        <h1 className="font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Edit Profile</h1>
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-primary/30">
              <AvatarImage src={user?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-base">{user?.name}</h1>
              <span className="text-muted-foreground text-sm">{user?.bio || "bio here"}</span>
            </div>
          </div>
          <input onChange={fileChangeHandler} ref={imageRef} type="file" className="hidden" />
          <Button
            onClick={() => imageRef?.current.click()}
            className="bg-primary hover:bg-primary/90 h-8 text-sm font-semibold rounded-lg"
          >
            Change image
          </Button>
        </div>
        <div className="space-y-3">
          <h1 className="font-bold text-xl">Bio</h1>
          <Textarea 
            value={input.bio} 
            onChange={(e)=>setInput({...input,bio:e.target.value})} 
            className="focus-visible:ring-primary bg-secondary border-border rounded-xl resize-none" 
            name="bio" 
            placeholder="Tell us about yourself..."
            rows={5}
          />
        </div>
        <div className="space-y-3">
          <h1 className="font-bold text-xl">Gender</h1>
          <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full bg-secondary border-border focus:ring-primary rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          {loading ? (
            <Button className="px-8 bg-primary hover:bg-primary/90 font-semibold rounded-lg">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </Button>
          ) : (
            <Button 
              onClick={editProfileHandler} 
              className="px-8 bg-primary hover:bg-primary/90 font-semibold rounded-lg"
            >
              Save Changes
            </Button>
          )}
        </div>

        <div className="border-t border-border pt-8 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-xl">Change Password</h1>
            <Button
              variant="outline"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-sm"
            >
              {showPasswordSection ? "Hide" : "Change Password"}
            </Button>
          </div>

          {showPasswordSection && (
            <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordInput.currentPassword}
                    onChange={(e) =>
                      setPasswordInput({
                        ...passwordInput,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground focus:ring-primary focus:ring-1 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordInput.newPassword}
                    onChange={(e) =>
                      setPasswordInput({
                        ...passwordInput,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground focus:ring-primary focus:ring-1 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordInput.confirmPassword}
                    onChange={(e) =>
                      setPasswordInput({
                        ...passwordInput,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground focus:ring-primary focus:ring-1 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {passwordLoading ? (
                  <Button className="px-8 bg-primary hover:bg-primary/90 font-semibold rounded-lg flex-1">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleChangePassword}
                      className="px-8 bg-primary hover:bg-primary/90 font-semibold rounded-lg flex-1"
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordInput({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-8 font-semibold rounded-lg"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
