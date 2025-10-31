import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';
import Toast from '../Toast';

function ManageApplicants() {
  document.title = 'CPMS | Manage Applicants';
  const { jobId } = useParams();
  
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [selectedForShortlist, setSelectedForShortlist] = useState([]);
  const [selectedForReject, setSelectedForReject] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [editingStatus, setEditingStatus] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Academic filters
  const [filters, setFilters] = useState({
    minCGPA: '',
    maxCGPA: '',
    minSSLC: '',
    maxSSLC: '',
    minPUC: '',
    maxPUC: ''
  });

  useEffect(() => {
    fetchWorkflowStatus();
  }, [jobId]);

  const fetchWorkflowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/placement-workflow/status/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setJob(response.data.job);
        setApplicants(response.data.applicants);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      setToastMessage('Failed to load applicants');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Pass activeTab as status parameter to filter export
      const statusParam = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const response = await axios.get(`${BASE_URL}/placement-workflow/export/${jobId}${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Dynamic filename based on active tab
      const statusLabel = activeTab !== 'all' 
        ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) 
        : 'All';
      link.setAttribute('download', `${statusLabel}_Students_${job?.jobTitle}_${Date.now()}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();

      const count = getFilteredApplicants().length;
      setToastMessage(`Excel file downloaded successfully! (${count} ${statusLabel} student${count !== 1 ? 's' : ''})`);
      setShowToast(true);
      fetchWorkflowStatus();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setToastMessage('Failed to export Excel file');
      setShowToast(true);
    }
  };

  const handleFinishDrive = async () => {
    if (!window.confirm('Are you sure you want to finish this drive? This will lock the job and no further changes can be made.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/placement-workflow/finish-drive/${jobId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage(response.data.message);
      setShowToast(true);
      fetchWorkflowStatus();
    } catch (error) {
      console.error('Error finishing drive:', error);
      setToastMessage(error.response?.data?.message || 'Failed to finish drive');
      setShowToast(true);
    }
  };

  const handleMarkShortlisted = async () => {
    if (job?.driveFinished) {
      setToastMessage('Cannot modify applicants - Drive is finished');
      setShowToast(true);
      return;
    }
    
    if (selectedForShortlist.length === 0 && selectedForReject.length === 0) {
      setToastMessage('Please select students to shortlist or reject');
      setShowToast(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/placement-workflow/shortlist/${jobId}`,
        {
          shortlistedStudentIds: selectedForShortlist,
          rejectedStudentIds: selectedForReject
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage(response.data.message);
      setShowToast(true);
      setSelectedForShortlist([]);
      setSelectedForReject([]);
      fetchWorkflowStatus();
    } catch (error) {
      console.error('Error marking shortlisted:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update shortlist');
      setShowToast(true);
    }
  };

  const toggleShortlist = (studentId) => {
    if (job?.driveFinished) return; // Prevent changes when drive is finished
    
    if (selectedForShortlist.includes(studentId)) {
      setSelectedForShortlist(selectedForShortlist.filter(id => id !== studentId));
    } else {
      setSelectedForShortlist([...selectedForShortlist, studentId]);
      setSelectedForReject(selectedForReject.filter(id => id !== studentId));
    }
  };

  const toggleReject = (studentId) => {
    if (job?.driveFinished) return; // Prevent changes when drive is finished
    
    if (selectedForReject.includes(studentId)) {
      setSelectedForReject(selectedForReject.filter(id => id !== studentId));
    } else {
      setSelectedForReject([...selectedForReject, studentId]);
      setSelectedForShortlist(selectedForShortlist.filter(id => id !== studentId));
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    if (job?.driveFinished) {
      setToastMessage('Cannot modify applicants - Drive is finished');
      setShowToast(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Use shortlist endpoint for status changes
      let shortlistedIds = [];
      let rejectedIds = [];
      
      if (newStatus === 'shortlisted') {
        shortlistedIds = [studentId];
      } else if (newStatus === 'rejected') {
        rejectedIds = [studentId];
      } else if (newStatus === 'in-process' || newStatus === 'placed') {
        // For in-process and placed, we'll use direct status update
        const response = await axios.post(`${BASE_URL}/student/update-status/${jobId}/${studentId}`,
          { 
            applicant: { 
              applicationStatus: newStatus 
            } 
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setToastMessage(`Status updated to ${newStatus}`);
        setShowToast(true);
        fetchWorkflowStatus();
        return;
      }

      const response = await axios.post(`${BASE_URL}/placement-workflow/shortlist/${jobId}`,
        {
          shortlistedStudentIds: shortlistedIds,
          rejectedStudentIds: rejectedIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage(response.data.message);
      setShowToast(true);
      fetchWorkflowStatus();
    } catch (error) {
      console.error('Error updating status:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update status');
      setShowToast(true);
    }
  };

  // Calculate CGPA from SGPA
  const calculateCGPA = (sgpa) => {
    if (!sgpa) return null; // Return null instead of 0 for missing data
    const sgpaValues = [
      sgpa.sem1, sgpa.sem2, sgpa.sem3, sgpa.sem4,
      sgpa.sem5, sgpa.sem6, sgpa.sem7, sgpa.sem8
    ].filter(val => val !== null && val !== undefined && val !== '' && !isNaN(val));
    
    return sgpaValues.length > 0
      ? sgpaValues.reduce((sum, val) => sum + parseFloat(val), 0) / sgpaValues.length
      : null; // Return null instead of 0 if no SGPA data
  };

  const getFilteredApplicants = () => {
    let filtered = applicants;
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => a.applicationStatus === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        const name = `${a.studentId.first_name} ${a.studentId.last_name}`.toLowerCase();
        const email = a.studentId.email.toLowerCase();
        const usn = a.studentId.studentProfile?.USN?.toLowerCase() || '';
        return name.includes(query) || email.includes(query) || usn.includes(query);
      });
    }
    
    // Filter by CGPA
    if (filters.minCGPA || filters.maxCGPA) {
      console.log("🔍 CGPA Filter Active:", { minCGPA: filters.minCGPA, maxCGPA: filters.maxCGPA });
      
      filtered = filtered.filter(a => {
        const cgpa = calculateCGPA(a.studentId.studentProfile?.SGPA);
        const studentName = `${a.studentId.first_name} ${a.studentId.last_name}`;
        
        console.log(`Student: ${studentName}, CGPA: ${cgpa !== null ? cgpa.toFixed(2) : 'NO DATA'}, SGPA:`, a.studentId.studentProfile?.SGPA);
        
        // If CGPA is null (no data), skip this student only if filter is strict
        if (cgpa === null) {
          console.log(`  ❌ Filtered out (no CGPA data)`);
          return false; // Don't show students without CGPA data when filter is active
        }
        
        const min = filters.minCGPA ? parseFloat(filters.minCGPA) : 0;
        const max = filters.maxCGPA ? parseFloat(filters.maxCGPA) : 10;
        const passes = cgpa >= min && cgpa <= max;
        console.log(`  ${passes ? '✅' : '❌'} CGPA ${cgpa.toFixed(2)} ${passes ? 'passes' : 'fails'} filter (${min}-${max})`);
        
        return passes;
      });
      
      console.log(`📊 After CGPA filter: ${filtered.length} students remaining`);
    }
    
    // Filter by SSLC percentage
    if (filters.minSSLC || filters.maxSSLC) {
      filtered = filtered.filter(a => {
        const sslc = a.studentId.studentProfile?.pastQualification?.sslc?.percentage;
        
        // If SSLC is missing, skip this student when filter is active
        if (!sslc && sslc !== 0) {
          return false;
        }
        
        const min = filters.minSSLC ? parseFloat(filters.minSSLC) : 0;
        const max = filters.maxSSLC ? parseFloat(filters.maxSSLC) : 100;
        return sslc >= min && sslc <= max;
      });
    }
    
    // Filter by PUC percentage
    if (filters.minPUC || filters.maxPUC) {
      filtered = filtered.filter(a => {
        const puc = a.studentId.studentProfile?.pastQualification?.puc?.percentage;
        
        // If PUC is missing, skip this student when filter is active
        if (!puc && puc !== 0) {
          return false;
        }
        
        const min = filters.minPUC ? parseFloat(filters.minPUC) : 0;
        const max = filters.maxPUC ? parseFloat(filters.maxPUC) : 100;
        return puc >= min && puc <= max;
      });
    }
    
    return filtered;
  };
  
  const clearFilters = () => {
    setFilters({
      minCGPA: '',
      maxCGPA: '',
      minSSLC: '',
      maxSSLC: '',
      minPUC: '',
      maxPUC: ''
    });
  };

  // Bulk shortlist filtered students
  const handleBulkShortlistFiltered = async () => {
    if (job?.driveFinished) {
      setToastMessage('Cannot modify applicants - Drive is finished');
      setShowToast(true);
      return;
    }
    
    const filteredApplicants = getFilteredApplicants();
    const appliedStudents = filteredApplicants.filter(a => a.applicationStatus === 'applied');
    
    if (appliedStudents.length === 0) {
      setToastMessage('No students with "Applied" status in filtered results');
      setShowToast(true);
      return;
    }

    const confirmMessage = `This will shortlist ${appliedStudents.length} student(s) from the filtered results. Continue?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const studentIds = appliedStudents.map(a => a.studentId._id);

      const response = await axios.post(`${BASE_URL}/placement-workflow/shortlist/${jobId}`,
        {
          shortlistedStudentIds: studentIds,
          rejectedStudentIds: []
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage(response.data.message || `Successfully shortlisted ${appliedStudents.length} student(s)`);
      setShowToast(true);
      fetchWorkflowStatus();
    } catch (error) {
      console.error('Error bulk shortlisting:', error);
      setToastMessage(error.response?.data?.message || 'Failed to shortlist students');
      setShowToast(true);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'applied': { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'fa-paper-plane', label: 'Applied' },
      'shortlisted': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'fa-list-check', label: 'Shortlisted' },
      'in-process': { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'fa-spinner', label: 'In Process' },
      'placed': { bg: 'bg-green-100', text: 'text-green-700', icon: 'fa-circle-check', label: 'Placed' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: 'fa-circle-xmark', label: 'Rejected' }
    };

    const badge = badges[status] || badges['applied'];
    return (
      <span className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        <i className={`fa-solid ${badge.icon}`}></i>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className="container-fluid py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{job?.jobTitle || 'Job Details'}</h3>
              <p className="text-gray-600">
                <span className="font-semibold">Company:</span> {job?.company?.companyName || 'N/A'}
                {job?.company?.companyLocation && (
                  <span className="ml-2 text-sm">
                    <i className="fa-solid fa-location-dot"></i> {job?.company?.companyLocation}
                  </span>
                )}
              </p>
              
            </div>
            <div className="flex gap-2">
              {!job?.driveFinished && (
                <button
                  onClick={handleFinishDrive}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  <i className="fa-solid fa-flag-checkered"></i>
                  Finish Drive
                </button>
              )}
              {job?.driveFinished && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-300">
                  <i className="fa-solid fa-check-circle"></i>
                  Drive Finished
                </div>
              )}
              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fa-solid fa-file-excel"></i>
                Export to Excel
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total || 0}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.applied || 0}</div>
              <div className="text-xs text-gray-600">Applied</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.shortlisted || 0}</div>
              <div className="text-xs text-gray-600">Shortlisted</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.inProcess || 0}</div>
              <div className="text-xs text-gray-600">In Process</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.placed || 0}</div>
              <div className="text-xs text-gray-600">Placed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {['all', 'applied', 'shortlisted', 'in-process', 'placed', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i className="fa-solid fa-xmark text-gray-400 hover:text-gray-600"></i>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Found {getFilteredApplicants().length} result(s)
            </div>
          )}
        </div>

        {/* Academic Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-filter text-indigo-600"></i>
              <h3 className="text-lg font-semibold text-gray-800">Academic Filters</h3>
            </div>
            {(filters.minCGPA || filters.maxCGPA || filters.minSSLC || filters.maxSSLC || filters.minPUC || filters.maxPUC) && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CGPA Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <i className="fa-solid fa-graduation-cap text-indigo-600 mr-1"></i>
                CGPA (0-10)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minCGPA}
                  onChange={(e) => setFilters({...filters, minCGPA: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.maxCGPA}
                  onChange={(e) => setFilters({...filters, maxCGPA: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* SSLC Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <i className="fa-solid fa-school text-green-600 mr-1"></i>
                SSLC / 10th (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  step="0.01"
                  value={filters.minSSLC}
                  onChange={(e) => setFilters({...filters, minSSLC: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  step="0.01"
                  value={filters.maxSSLC}
                  onChange={(e) => setFilters({...filters, maxSSLC: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* PUC Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <i className="fa-solid fa-book text-blue-600 mr-1"></i>
                PUC / 12th (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  step="0.01"
                  value={filters.minPUC}
                  onChange={(e) => setFilters({...filters, minPUC: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  step="0.01"
                  value={filters.maxPUC}
                  onChange={(e) => setFilters({...filters, maxPUC: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.minCGPA || filters.maxCGPA || filters.minSSLC || filters.maxSSLC || filters.minPUC || filters.maxPUC) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                  {(filters.minCGPA || filters.maxCGPA) && (
                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">
                      CGPA: {filters.minCGPA || '0'} - {filters.maxCGPA || '10'}
                    </span>
                  )}
                  {(filters.minSSLC || filters.maxSSLC) && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      SSLC: {filters.minSSLC || '0'}% - {filters.maxSSLC || '100'}%
                    </span>
                  )}
                  {(filters.minPUC || filters.maxPUC) && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      PUC: {filters.minPUC || '0'}% - {filters.maxPUC || '100'}%
                    </span>
                  )}
                  <span className="text-sm text-gray-600">
                    → Showing {getFilteredApplicants().length} of {applicants.length} applicants
                  </span>
                </div>
                
                {/* Bulk Shortlist Button */}
                {(() => {
                  const appliedCount = getFilteredApplicants().filter(a => a.applicationStatus === 'applied').length;
                  return appliedCount > 0 && !job?.driveFinished && (
                    <button
                      onClick={handleBulkShortlistFiltered}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <i className="fa-solid fa-check-double"></i>
                      Shortlist Filtered ({appliedCount})
                    </button>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {activeTab === 'applied' && !job?.driveFinished && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Selected: {selectedForShortlist.length} for shortlist, {selectedForReject.length} for reject
              </div>
              <button
                onClick={handleMarkShortlisted}
                disabled={selectedForShortlist.length === 0 && selectedForReject.length === 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300"
              >
                Update Status
              </button>
            </div>
          </div>
        )}

        {/* Applicants Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  {activeTab === 'applied' && <th className="px-4 py-3 text-left text-sm font-semibold">Select</th>}
                  <th className="px-4 py-3 text-left text-sm font-semibold">S.No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">CGPA</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">SSLC %</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">PUC %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Current Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Applied On</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredApplicants().length > 0 ? (
                  getFilteredApplicants().map((applicant, index) => (
                    <tr key={applicant.studentId._id} className="hover:bg-gray-50 transition-colors">
                      {activeTab === 'applied' && (
                        <td className="px-4 py-3 text-center">
                          {!job?.driveFinished && (
                            <div className="flex gap-2">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedForShortlist.includes(applicant.studentId._id)}
                                  onChange={() => toggleShortlist(applicant.studentId._id)}
                                  className="w-4 h-4 text-green-600 rounded"
                                />
                                <span className="text-xs text-green-600">✓</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedForReject.includes(applicant.studentId._id)}
                                  onChange={() => toggleReject(applicant.studentId._id)}
                                  className="w-4 h-4 text-red-600 rounded"
                                />
                                <span className="text-xs text-red-600">✗</span>
                              </label>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {applicant.studentId.first_name} {applicant.studentId.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{applicant.studentId.email}</td>
                      
                      {/* CGPA */}
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const cgpa = calculateCGPA(applicant.studentId.studentProfile?.SGPA);
                          if (cgpa === null) {
                            return <span className="text-xs text-gray-400 italic">N/A</span>;
                          }
                          const color = cgpa >= 8 ? 'text-green-600' : cgpa >= 7 ? 'text-blue-600' : cgpa >= 6 ? 'text-yellow-600' : 'text-orange-600';
                          return <span className={`text-sm font-semibold ${color}`}>{cgpa.toFixed(2)}</span>;
                        })()}
                      </td>
                      
                      {/* SSLC */}
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const sslc = applicant.studentId.studentProfile?.pastQualification?.sslc?.percentage;
                          if (!sslc && sslc !== 0) {
                            return <span className="text-xs text-gray-400 italic">N/A</span>;
                          }
                          const color = sslc >= 85 ? 'text-green-600' : sslc >= 70 ? 'text-blue-600' : sslc >= 60 ? 'text-yellow-600' : 'text-orange-600';
                          return <span className={`text-sm font-semibold ${color}`}>{sslc}%</span>;
                        })()}
                      </td>
                      
                      {/* PUC */}
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const puc = applicant.studentId.studentProfile?.pastQualification?.puc?.percentage;
                          if (!puc && puc !== 0) {
                            return <span className="text-xs text-gray-400 italic">N/A</span>;
                          }
                          const color = puc >= 85 ? 'text-green-600' : puc >= 70 ? 'text-blue-600' : puc >= 60 ? 'text-yellow-600' : 'text-orange-600';
                          return <span className={`text-sm font-semibold ${color}`}>{puc}%</span>;
                        })()}
                      </td>
                      
                      <td className="px-4 py-3 text-sm">{getStatusBadge(applicant.applicationStatus)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(applicant.appliedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={applicant.applicationStatus}
                          onChange={(e) => handleStatusChange(applicant.studentId._id, e.target.value)}
                          disabled={job?.driveFinished}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${job?.driveFinished ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="in-process">In Process</option>
                          <option value="placed">Placed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'applied' ? 11 : 10} className="px-4 py-8 text-center text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageApplicants;
