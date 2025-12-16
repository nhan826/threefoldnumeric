import React from 'react'
import GlobalControls, { useSidebar, SidebarContext } from './GlobalControls'
import Header from './Header'

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Responsive: on mobile, overlay; on desktop, shift main content
  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 relative">
          <main
            className={`flex-1 p-6 max-w-7xl mx-auto transition-all duration-300`}
            style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '4.5rem' }}
          >
            <div className="canvas-grid p-6">
              {children}
            </div>
          </main>
          <GlobalControls />
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
