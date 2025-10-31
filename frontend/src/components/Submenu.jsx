import {useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Professional Sidebar Link Component
const SidebarLink = ({ to, onClick, active, children, hasSubnav }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 my-0.5 rounded-lg text-gray-700 text-sm font-medium no-underline transition-all duration-200 group ${
      active 
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-l-4 border-indigo-600 shadow-sm' 
        : 'hover:bg-gray-50 hover:text-indigo-600'
    }`}
  >
    {children}
  </Link>
);

const SidebarLabel = ({ children }) => (
  <span className="ml-3 text-sm font-medium">{children}</span>
);

const DropdownLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`flex items-center py-2.5 pl-12 pr-4 my-0.5 rounded-lg text-gray-600 text-sm no-underline transition-all duration-200 group ${
      active 
        ? 'bg-indigo-100 text-indigo-600 font-semibold' 
        : 'hover:bg-gray-100 hover:text-indigo-600 hover:pl-14'
    }`}
  >
    {children}
  </Link>
);

const SubMenu = ({ item, currentPath }) => {
  const [subnav, setSubnav] = useState(false);

  useEffect(() => {
    if (item.subNav && item.subNav.some(subItem => currentPath.includes(subItem.path))) {
      setSubnav(true);
    } else {
      setSubnav(false);
    }
  }, [currentPath, item.subNav]);

  const showSubnav = () => setSubnav(!subnav);

  return (
    <div className="mb-1">
      <SidebarLink
        to={item.path}
        onClick={item.subNav && showSubnav}
        active={currentPath === item.path}
        hasSubnav={!!item.subNav}
      >
        <div className="flex items-center flex-1 min-w-0">
          <span className="text-gray-500 group-hover:text-indigo-600 transition-colors flex-shrink-0">
            {item.icon}
          </span>
          <SidebarLabel>
            {item.title}
          </SidebarLabel>
        </div>
        <div className="flex-shrink-0 text-gray-400 group-hover:text-indigo-600 transition-all duration-200">
          {item.subNav && (
            <span className={`transition-transform duration-200 ${subnav ? 'rotate-180' : 'rotate-0'}`}>
              {subnav ? item.iconOpened : item.iconClosed}
            </span>
          )}
        </div>
      </SidebarLink>

      {subnav && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg py-1 px-2 my-1 border-l-2 border-indigo-200 ml-2">
          {item.subNav.map((subItem, index) => (
            <DropdownLink
              to={subItem.path}
              key={index}
              active={currentPath === subItem.path}
            >
              <span className="text-gray-400 group-hover:text-indigo-600 transition-colors mr-2 flex-shrink-0">
                {subItem.icon}
              </span>
              <SidebarLabel>
                {subItem.title}
              </SidebarLabel>
            </DropdownLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubMenu;

