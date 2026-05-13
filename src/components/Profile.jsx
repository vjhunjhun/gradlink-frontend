import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile.jsx'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AtSign, Heart, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { setAuthUser, setUserProfile,setselectedUser } from '@/redux/authSlice'
import FollowDialog from './FollowDialog'
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const dispatch = useDispatch();
  const { userProfile, user } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const doesFollow = user?.following.includes(userId) || false;
  const [isFollowing, setIsFollowing] = useState(doesFollow);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const openFollowers = () => {
    setDialogType("followers");
    setOpenDialog(true);
  };

  const openFollowing = () => {
    setDialogType("following");
    setOpenDialog(true);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const handleMessage = () => {
    if (!userProfile) return;
    dispatch(setselectedUser(userProfile));
    navigate("/chat");
  };
  const handleFollowUnfollow = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/user/followorunfollow/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        if (!isFollowing) {
          // FOLLOW

          dispatch(
            setAuthUser({
              ...user,
              following: [...user.following, userId],
            }),
          );

          dispatch(
            setUserProfile({
              ...userProfile,
              followers: [...userProfile.followers, user._id],
            }),
          );
        } else {
          // UNFOLLOW

          dispatch(
            setAuthUser({
              ...user,
              following: user.following.filter((id) => id !== userId),
            }),
          );

          dispatch(
            setUserProfile({
              ...userProfile,
              followers: userProfile.followers.filter((id) => id !== user._id),
            }),
          );
        }
        setIsFollowing(!isFollowing);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;
  return (
    <div className="flex max-w-6xl justify-center mx-auto pl-20 py-8">
      <div className="flex flex-col gap-20 p-8 w-full">
        <div className="grid grid-cols-2 gap-12">
          <section className="flex items-center justify-center">
            <Avatar className="h-40 w-40 shadow-lg ring-4 ring-primary/30">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profile_pic"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{userProfile?.name}</span>
                {userProfile?.role && (
                  <Badge variant="outline" className="text-sm">
                    {userProfile.role}
                  </Badge>
                )}
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-secondary h-8 text-xs"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={handleFollowUnfollow}
                      className="h-8 text-xs"
                    >
                      Unfollow
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 h-8 text-xs" 
                      onClick={handleMessage}
                    >
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 h-8 text-xs"
                    onClick={handleFollowUnfollow}
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-8">
                <p className="text-sm">
                  <span className="font-bold text-lg">
                    {userProfile?.posts.length}
                  </span>
                  <span className="ml-2 text-muted-foreground">posts</span>
                </p>
                <div className="flex gap-8">
                  <span onClick={openFollowers} className="cursor-pointer hover:text-primary transition-colors text-sm">
                    <b className="text-lg">{userProfile?.followers.length}</b>
                    <span className="ml-2 text-muted-foreground">followers</span>
                  </span>

                  <span onClick={openFollowing} className="cursor-pointer hover:text-primary transition-colors text-sm">
                    <b className="text-lg">{userProfile?.following.length}</b>
                    <span className="ml-2 text-muted-foreground">following</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-semibold text-foreground">
                  {userProfile?.bio || "No bio yet"}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <AtSign size={16} />
                  <span>{userProfile?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">Department: {userProfile?.department || "N/A"}</p>
                <p className="text-sm text-muted-foreground">Batch: {userProfile?.batch || "N/A"}</p>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-border pl-14">
          <div className="flex items-center justify-center gap-12 text-sm">
            <span
              className={`py-3 px-2 cursor-pointer font-semibold transition-colors ${activeTab === "posts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 px-2 cursor-pointer font-semibold transition-colors ${activeTab === "saved" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {displayedPost?.map((post) => {
              return (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl" key={post?._id}>
                  <img
                    src={post?.image}
                    alt="post_image"
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-6">
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Heart size={20} className="fill-current" />
                        <span className="font-semibold">{post?.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageCircle size={20} />
                        <span className="font-semibold">{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <FollowDialog
        open={openDialog}
        setOpen={setOpenDialog}
        type={dialogType}
        userId={userProfile?._id}
      />
    </div>
  );
}

export default Profile
