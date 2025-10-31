import Student from '../../assets/student.jpg';
import TPO from '../../assets/tpo.jpg';
import Management from '../../assets/management.jpg';
import Admin from '../../assets/admin.jpg';
import { FaUserGraduate, FaUserTie, FaChartLine, FaUserShield } from 'react-icons/fa';

function LandAbout() {
  const roles = [
    { 
      title: "Student", 
      image: Student, 
      icon: <FaUserGraduate />,
      description: "Students can register, explore jobs, apply, and track applications with a dashboard.",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "TPO", 
      image: TPO, 
      icon: <FaUserTie />,
      description: "TPOs manage job postings, applications, and generate reports.",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Management", 
      image: Management, 
      icon: <FaChartLine />,
      description: "Monitor placements, review analytics, and control access.",
      color: "from-indigo-500 to-indigo-600"
    },
    { 
      title: "Admin", 
      image: Admin, 
      icon: <FaUserShield />,
      description: "Handle all roles, manage users, system settings, and operations.",
      color: "from-pink-500 to-pink-600"
    },
  ];


  return (
    <div id="about" className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20">
      {/* Header Section */}
      <div className="text-center mb-16 px-4">
        <div className="inline-block mb-4">
          <span className="px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-semibold">
            🎯 About CPMS
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800">About CPMS</h2>
        <p className="text-gray-700 max-w-3xl mx-auto text-md md:text-lg">
          Developed by final year students of The National Institute of Engineering Mysuru, CPMS is a web platform to manage campus placements efficiently.
        </p>
      </div>

      {/* Roles Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role, idx) => (
            <div 
              key={idx} 
              className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
            >
              {/* Image with gradient overlay */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={role.image} 
                  alt={role.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${role.color} opacity-60 group-hover:opacity-40 transition-opacity`} />
                
                {/* Icon Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <div className="text-2xl text-gray-800">{role.icon}</div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{role.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
                
                {/* Hover indicator */}
                <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${role.color} transition-all duration-500 rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandAbout;

