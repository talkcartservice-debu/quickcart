'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const { userData, loading, isAdmin } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userData && !isAdmin) {
      router.push('/')
    }
    if (!loading && !userData) {
      router.push('/login')
    }
  }, [userData, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!userData || !isAdmin) {
    return null
  }

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout
