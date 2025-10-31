
function Footer({ isSidebarVisible }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <footer className={`bg-white border-t border-gray-200 transition-all duration-300 ${isSidebarVisible ? 'md:ml-64' : 'ml-0'}`}>
        <div className="px-6 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
            {/* Left - Copyright */}
            <p className="text-gray-600 mb-0">
              © {currentYear} CPMS. All rights reserved.
            </p>

            {/* Center - Credits */}
            <p className="text-gray-600 mb-0">
              Developed by <span className="font-semibold text-indigo-600">Major Project Team - NIE</span>
            </p>

            {/* Right - Version */}
            <p className="text-gray-500 mb-0">
              Version <span className="font-semibold">1.0.1</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
export default Footer

