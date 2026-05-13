import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const GroupsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/group/all`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setGroups(res.data.groups);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error loading groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Socket events for real-time updates
  useEffect(() => {
    socket?.on("group_created", (newGroup) => {
      setGroups((prev) => [newGroup, ...prev]);
    });

    socket?.on("group_members_added", (updatedGroup) => {
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
    });

    socket?.on("group_deleted", (data) => {
      setGroups((prev) => prev.filter((g) => g._id !== data.groupId));
    });

    return () => {
      socket?.off("group_created");
      socket?.off("group_members_added");
      socket?.off("group_deleted");
    };
  }, [socket]);

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post(
        `${API_URL}/api/v1/group/create`,
        {
          name: groupName,
          description: groupDescription,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Group created successfully");
        setGroupName("");
        setGroupDescription("");
        setCreateGroupOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error creating group");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-xl">
        <h1 className="font-bold text-2xl flex items-center gap-2">
          <Users size={28} />
          Groups
        </h1>
        {user?.role === "teacher" && (
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus size={20} />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <div className="space-y-4">
                <h2 className="font-bold text-lg">Create New Group</h2>

                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupDesc">Description (Optional)</Label>
                  <Textarea
                    id="groupDesc"
                    placeholder="Enter group description"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                <Button
                  onClick={createGroup}
                  disabled={creating}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl text-center">
          <Users size={48} className="text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">No groups yet</p>
          {user?.role === "teacher" && (
            <p className="text-sm text-muted-foreground mt-2">
              Create a group to start collaborating
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/chat/group/${group._id}`)}
              className="p-4 bg-card border border-border rounded-xl hover:shadow-lg cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {group.members.length} members
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Created by{" "}
                      <span className="font-semibold">{group.createdBy?.name}</span>
                    </p>
                  </div>
                </div>

                {/* Last Message Preview */}
                {group.messages && group.messages[0] && (
                  <div className="ml-4 text-right">
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-32">
                      {group.messages[0].senderId?.name}:{" "}
                      {group.messages[0].message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(group.messages[0].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;
