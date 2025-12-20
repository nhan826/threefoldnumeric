import React from 'react'
import GlobalControls, { useSidebar, SidebarContext } from './GlobalControls'
import Header from './Header'

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Responsive: on mobile, overlay; on desktop, shift main content
  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
      <div className="min-h-screen flex flex-col bg-[#f7f8fa] overflow-x-hidden">
        <Header />
        <div className="flex flex-1 relative w-full overflow-hidden">
          <main
            className={`flex-1 w-full overflow-x-hidden transition-all duration-300`}
            style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '4.5rem', paddingBottom: '300px' }}
          >
            {children}
          </main>
        </div>
        <GlobalControls />
      </div>
    </SidebarContext.Provider>
  )
}
