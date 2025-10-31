import {useEffect, useState } from "react";
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';

const StudentTable = ({ branchName, studentData }) => {
  const [currentUser, setCurrentUser] = useState({ role: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${BASE_URL}/user/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUser({ role: res.data.role });
      })
      .catch((err) => {
        console.error('StudentTableTemplate.jsx => ', err);
      });
  }, []);

  return (
    <Accordion className="mt-3" alwaysOpen>
      <Accordion.Item eventKey={branchName} className="shadow-lg border-0 rounded-lg overflow-hidden">
        <Accordion.Header className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-users text-indigo-600"></i>
            <span className="font-semibold text-gray-800">{branchName}</span>
          </div>
        </Accordion.Header>
        <Accordion.Body className="p-0">
          <div className="overflow-x-auto">
            <Table hover className="mb-0 table-modern">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '6%' }}>Roll No.</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Full Name</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>USN</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Email</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '11%' }}>Phone Number</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>Resume</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '11%' }}>Internships</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '11%' }}>Applied Jobs</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {studentData?.length > 0 ? (
                  studentData
                    ?.sort((a, b) => {
                      const rollA = parseInt(a?.studentProfile?.rollNumber || 0);
                      const rollB = parseInt(b?.studentProfile?.rollNumber || 0);
                      return rollA - rollB;
                    })
                    ?.map((student, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student?.studentProfile?.rollNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          {(currentUser.role === 'tpo_admin' ||
                            currentUser.role === 'management_admin') && (
                            <Link
                              to={`/${
                                currentUser.role === 'tpo_admin'
                                  ? 'tpo'
                                  : 'management'
                              }/user/${student?._id}`}
                              className="no-underline text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 group"
                            >
                              <i className="fa-solid fa-user text-xs"></i>
                              {`${student?.first_name} ${student?.middle_name} ${student?.last_name}`}
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student?.studentProfile?.USN}</td>
                        <td className="px-4 py-3 text-sm">
                          <a
                            href={`mailto:${student?.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <i className="fa-regular fa-envelope text-xs"></i>
                            {student?.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-phone text-xs text-gray-400"></i>
                            {student?.number}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <a
                            href={student?.studentProfile?.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all no-underline text-xs font-semibold"
                          >
                            <i className="fa-solid fa-file-pdf"></i>
                            View
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                            {student?.studentProfile?.internships?.length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold">
                            {student?.studentProfile?.appliedJobs?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-users-slash text-4xl text-gray-300"></i>
                        <p className="mb-0 font-medium">No Students Registered!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default StudentTable;

