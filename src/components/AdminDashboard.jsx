import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Users, UserCheck, UserX, GraduationCap, BookOpen, LogOut, Plus, Search, Key, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { setAuthUser } from "@/redux/authSlice";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AdminDashboard = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [violations, setViolations] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", password: "", department: "" });
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [violationsRes, alumniRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/admin/violations`, { withCredentials: true }),
        axios.get(`${API_URL}/api/v1/admin/alumni`, { withCredentials: true }),
        axios.get(`${API_URL}/api/v1/admin/teachers`, { withCredentials: true }),
      ]);

      if (violationsRes.data.success) setViolations(violationsRes.data.violations);
      if (alumniRes.data.success) setAlumni(alumniRes.data.alumni);
      if (teachersRes.data.success) setTeachers(teachersRes.data.teachers);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/admin/ban/${userId}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/admin/unban/${userId}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to unban user");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout");
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      if (!teacherForm.name || !teacherForm.email || !teacherForm.password) {
        toast.error("All fields are required");
        return;
      }
      const res = await axios.post(
        `${API_URL}/api/v1/admin/create-teacher`,
        teacherForm,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setTeacherForm({ name: "", email: "", password: "", department: "" });
        fetchData();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create teacher");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      if (!adminForm.name || !adminForm.email || !adminForm.password) {
        toast.error("All fields are required");
        return;
      }
      const res = await axios.post(
        `${API_URL}/api/v1/admin/create-admin`,
        adminForm,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setAdminForm({ name: "", email: "", password: "" });
        fetchData();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/admin/search-users?query=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSearchResults(res.data.users);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to search users");
    }
  };

  const handleChangePassword = async (userId) => {
    if (!newPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/admin/change-password`,
        { userId, newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setNewPassword("");
        setShowPasswordChange(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/v1/admin/delete-user/${userId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSearchResults((prev) => prev.filter((user) => user._id !== userId));
        setDeleteConfirm(null);
        setIsDeleteDialogOpen(false);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users and monitor violations
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="violations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Violations
            </TabsTrigger>
            <TabsTrigger value="alumni" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Alumni
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger
              value="create-teacher"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Teacher
            </TabsTrigger>
            <TabsTrigger
              value="create-admin"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Create Admin
            </TabsTrigger>
            <TabsTrigger
              value="search-users"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Users
            </TabsTrigger>
            <TabsTrigger
              value="manage-password"
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Chat Violations ({violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : violations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No violations reported
                  </div>
                ) : (
                  <div className="space-y-4">
                    {violations.map((violation) => (
                      <div
                        key={violation._id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={violation.user?.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {violation.user?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {violation.user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                violation.reportedAt,
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Banned {violation.user?.banCount || 0} time(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <Badge variant="destructive">
                              {violation.violationType}
                            </Badge>
                            <p className="text-xs text-muted-foreground max-w-xs break-words">
                              Message: {violation.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status:{" "}
                              {violation.isResolved ? "Resolved" : "Open"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {violation.user?.isBanned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUnbanUser(violation.user._id)
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBanUser(violation.user._id)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteConfirm(violation.user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete User</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-2 justify-end">
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      setIsDeleteDialogOpen(false);
                                      setDeleteConfirm(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (deleteConfirm) {
                                        handleDeleteUser(deleteConfirm._id);
                                      }
                                    }}
                                  >
                                    Delete User
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alumni" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Alumni ({alumni.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : alumni.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alumni found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alumni.map((alum) => (
                      <div
                        key={alum._id}
                        className="flex items-center gap-3 p-4 border border-border rounded-lg"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={alum.profilePicture} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold break-words">
                            {alum.name}
                          </p>
                          <p className="text-sm text-muted-foreground break-words">
                            {alum.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alum.department} • {alum.batch}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Banned {alum.banCount || 0} time(s)
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          {alum.isBanned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(alum._id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(alum._id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          )}
                          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirm(alum)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeleteConfirm(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (deleteConfirm) {
                                      handleDeleteUser(deleteConfirm._id);
                                    }
                                  }}
                                >
                                  Delete User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teachers ({teachers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : teachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No teachers found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher._id}
                        className="flex items-center gap-3 p-4 border border-border rounded-lg"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={teacher.profilePicture} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold break-words">
                            {teacher.name}
                          </p>
                          <p className="text-sm text-muted-foreground break-words">
                            {teacher.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teacher.department}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Banned {teacher.banCount || 0} time(s)
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          {teacher.isBanned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(teacher._id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(teacher._id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          )}
                          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirm(teacher)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeleteConfirm(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (deleteConfirm) {
                                      handleDeleteUser(deleteConfirm._id);
                                    }
                                  }}
                                >
                                  Delete User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                        
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-teacher" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Teacher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      placeholder="Teacher name"
                      value={teacherForm.name}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="teacher@email.com"
                      value={teacherForm.email}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={teacherForm.password}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Department"
                      value={teacherForm.department}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Create Teacher Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Create New Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      placeholder="Admin name"
                      value={adminForm.name}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="admin@email.com"
                      value={adminForm.email}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={adminForm.password}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Create Admin Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                />

                {searchResults.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}

                <div className="space-y-2">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser._id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={searchUser.profilePicture} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">
                            {searchUser.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {searchUser.email}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge className="text-xs">
                              {searchUser.role}
                            </Badge>
                            <Badge className="text-xs text-amber-600">
                              Banned {searchUser.banCount || 0} time(s)
                            </Badge>
                            {searchUser.isBanned && (
                              <Badge variant="destructive" className="text-xs">
                                Currently Banned
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(searchUser);
                            setShowPasswordChange(true);
                          }}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Password
                        </Button>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfirm(searchUser)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setIsDeleteDialogOpen(false);
                                  setDeleteConfirm(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (deleteConfirm) {
                                    handleDeleteUser(deleteConfirm._id);
                                  }
                                }}
                              >
                                Delete User
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change User Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg bg-secondary/50">
                      <p className="text-sm">Selected User:</p>
                      <p className="font-semibold">{selectedUser.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleChangePassword(selectedUser._id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Update Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewPassword("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Search and select a user to change their password
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;