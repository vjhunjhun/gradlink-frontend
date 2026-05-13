import React from 'react'
import Posts from './Posts'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center pl-[20%] pr-4'>
      <div className='w-full max-w-xl'>
        <Posts/>
      </div>
    </div>
  )
}

export default Feed
