// Filename - components/SidebarData.js

import { AiFillHome } from "react-icons/ai";
import { ImProfile } from "react-icons/im";
import { RiArrowDownSFill, RiArrowUpSFill, RiPlayListAddLine } from "react-icons/ri";
import { FaIndustry, FaListCheck, FaBuildingColumns, FaListUl, FaRegCalendarCheck, FaBlog } from "react-icons/fa6";
import { FaPencilAlt, FaRoad, FaVideo } from "react-icons/fa";

export const SidebarData = [
  {
    title: "Dashboard",
    path: "/student/dashboard",
    icon: <AiFillHome />
  },
  {
    title: "Applied Jobs",
    path: "/student/myjob",
    icon: <FaRegCalendarCheck />,
  },
  {
    title: "Placements",
    // path: "",
    icon: <FaIndustry />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,

    subNav: [
      {
        title: "Placement Profile",
        path: "/student/placement-profile",
        icon: <ImProfile />,
        cName: "sub-nav",
      },
      {
        title: "Job Listings",
        path: "/student/job-listings",
        icon: <FaListCheck />,
      },
    ],
  },
  {
    title: "My Internship",
    icon: <FaBuildingColumns />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,

    subNav: [
      {
        title: "List All",
        path: "/student/internship",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/student/add-internship",
        icon: <RiPlayListAddLine />,
      },
    ],
  },
  {
    title: "Resume Analyzer",
    path: "/student/resume-analyzer",
    icon: <FaRegCalendarCheck />,
  },
  {
    title: "Learning Path",
    path: "/student/learning-path",
    icon: <FaRoad />,
  },
  {
    title: "Student Blogs",
    icon: <FaBlog />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    subNav: [
      {
        title: "All Blogs",
        path: "/student/blogs",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Create Blog",
        path: "/student/create-blog",
        icon: <FaPencilAlt />,
      },
    ],
  },
  {
    title: "Meetings",
    path: "/student/meetings",
    icon: <FaVideo />
  },

];

