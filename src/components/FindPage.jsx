import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setselectedUser } from "@/redux/authSlice";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const FindPage = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { onlineUsers } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

 
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL}/api/v1/user/search?query=${search}`,
          { withCredentials: true },
        );

        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="ml-[16%] h-screen flex flex-col bg-background">
      <div className="p-6 border-b border-border sticky top-0 bg-card z-10 shadow-sm">
        <Input
          type="text"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full bg-secondary border-border focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

     
      <div className="flex-1 overflow-y-auto">
       
        {loading && (
          <div className="text-center mt-8 text-muted-foreground font-medium">Searching...</div>
        )}

     
        {!loading && users.length > 0
          ? users.map((user) => {
              const isOnline = onlineUsers.includes(user._id);

              return (
                <Link
                  to={`/profile/${user?._id}`}
                  key={user._id}
                  onClick={() => dispatch(setselectedUser(user))}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-secondary cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                >
                 
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-primary/30">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                        isOnline ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  </div>

                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.role ? `${user.role} • ` : ""}{isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </Link>
              );
            })
          : !loading &&
            search && (
              <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
                No users found
              </div>
            )}
      </div>
    </div>
  );
};

export default FindPage;
