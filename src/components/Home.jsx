import React from 'react'
import {Outlet} from 'react-router-dom'
import Feed from './Feed'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost.jsx'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers.jsx'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
const Home = () => {
  console.log("component is mounted");
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex bg-background min-h-screen">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
}

export default Home
