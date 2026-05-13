import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const FollowDialog = ({ open, setOpen, type, userId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      const res = await axios.get(
        `${API_URL}/api/v1/user/${userId}/${type}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setUsers(res.data.users);
      }
    };

    fetchUsers();
  }, [open, type, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 bg-card border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border font-bold capitalize text-center text-lg">
          {type === 'followers' ? 'Followers' : 'Following'}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                onClick={() => setOpen(false)} 
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary border-b border-border/50 last:border-b-0 transition-colors"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{user.name}</span>
                  {user?.role && (
                    <span className="text-xs text-muted-foreground">{user.role}</span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center p-6 text-muted-foreground font-medium">No users found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowDialog;
