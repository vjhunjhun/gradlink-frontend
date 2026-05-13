import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar/>
      <div className="flex-1">
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout
