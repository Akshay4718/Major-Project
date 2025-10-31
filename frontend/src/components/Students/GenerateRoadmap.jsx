import React, { useState } from 'react';
import { FaRoad, FaSearch, FaBook, FaYoutube, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';

const GenerateRoadmap = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const generateRoadmap = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic to generate a learning path');
      return;
    }

    setIsLoading(true);
    setError('');
    setRoadmap(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/roadmap/generate`,
        { topic: topic.trim() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setRoadmap(response.data.roadmap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate learning path. Please try again.');
      console.error('Error generating roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <FaRoad className="text-white text-3xl" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-800">Learning Path Generator</h1>
              <p className="text-gray-600 mt-1">Get a personalized learning roadmap with curated resources</p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={generateRoadmap} className="mt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g., 'React', 'Machine Learning', 'DSA')"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Generating...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-2" /> Generate Path
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>

          {/* Sample Topics */}
          <div className="mt-4 flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Try:</span>
            {['React', 'Python', 'DSA', 'Machine Learning', 'Web Development'].map((sample) => (
              <button
                key={sample}
                onClick={() => setTopic(sample)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <FaSpinner className="text-6xl text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Learning Path...</h3>
              <p className="text-gray-600">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Roadmap Display */}
        {roadmap && !isLoading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overview Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center mb-2">
                <FaLightbulb className="text-3xl mr-3" />
                <h2 className="text-2xl font-bold">Your Learning Path: {roadmap.topic || topic}</h2>
              </div>
              <p className="text-blue-100">Follow these steps to master {roadmap.topic || topic}</p>
            </div>

            {/* Steps */}
            {roadmap.steps && roadmap.steps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  {/* Step Header */}
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Resources */}
                  {step.resources && step.resources.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaBook className="mr-2 text-blue-600" />
                        Learning Resources
                      </h4>
                      <ul className="space-y-3">
                        {step.resources.map((resource, i) => (
                          <li key={i} className="flex items-start group">
                            <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">
                              {resource.type === 'video' ? (
                                <FaYoutube className="text-xl" />
                              ) : (
                                <FaBook className="text-lg" />
                              )}
                            </span>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium group-hover:translate-x-1 transition-transform"
                            >
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duration or Tips */}
                  {step.duration && (
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <FaCircleCheck className="mr-2 text-green-500" />
                      <span>Estimated time: {step.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <FaCircleCheck className="text-5xl text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Your Learning Path is Ready!</h3>
              <p className="text-gray-600">Follow these steps consistently and track your progress. Good luck! 🚀</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!roadmap && !isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRoad className="text-4xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Your Learning Journey</h3>
              <p className="text-gray-600 mb-4">
                Enter any topic you want to learn and get a personalized step-by-step roadmap with curated resources to guide your learning.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-gray-800 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <FaCircleCheck className="text-green-500 mr-2" />
                    Structured learning path
                  </li>
                  <li className="flex items-center">
                    <FaCircleCheck className="text-green-500 mr-2" />
                    Curated resources (articles, videos, courses)
                  </li>
                  <li className="flex items-center">
                    <FaCircleCheck className="text-green-500 mr-2" />
                    Step-by-step guidance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateRoadmap;
