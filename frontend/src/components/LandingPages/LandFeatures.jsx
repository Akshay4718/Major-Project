import { FaBriefcase, FaBlog, FaBell, FaFileAlt, FaUsers, FaClipboardCheck, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

function LandingFeatures() {
  const features = [
    {
      icon: <FaBriefcase />,
      title: "Job Listings & Applications",
      description: "Browse placement opportunities, apply to jobs, and track your application status in real-time.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <FaUsers />,
      title: "Placement Profile Management",
      description: "Create and maintain comprehensive placement profiles with academic records, skills, and achievements.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: <FaClipboardCheck />,
      title: "Internship Tracker",
      description: "Add, manage, and showcase your internship experiences with offer letters and certificates.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: <FaFileAlt />,
      title: "AI Resume Analyzer",
      description: "Get AI-powered feedback on your resume with suggestions to improve and optimize for ATS systems.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: <FaLightbulb />,
      title: "Learning Path Generator",
      description: "Generate personalized AI-powered learning roadmaps with curated resources for any technology or skill.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: <FaBell />,
      title: "Notice Board",
      description: "Stay updated with important placement announcements, deadlines, and notifications from TPO.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: <FaBlog />,
      title: "Student Blogs",
      description: "Share interview experiences, placement tips, and resources with the student community.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: <FaShieldAlt />,
      title: "Role-Based Access",
      description: "Secure platform with separate dashboards for Students, TPO, Management, and Admin users.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50"
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-sm font-semibold">
              ⚡ Powerful Features
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
            Everything You Need in{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Comprehensive tools and features designed to streamline the entire campus placement process
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative ${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`text-3xl bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Border Animation */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500`} />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Placement Process?
            </h3>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students and institutions already using CPMS to achieve better placement outcomes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started Free
              </button>
              <button className="bg-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-purple-800 hover:scale-105 transition-all duration-300 border-2 border-white/20">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingFeatures;
