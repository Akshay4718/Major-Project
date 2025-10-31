import {useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import TablePlaceholder from './TablePlaceholder';
import { BASE_URL } from '../config/backend_url';

function AddUserTable({
  users,
  loading,
  handleDeleteUser,
  formOpen,
  setFormOpen,
  data,
  handleDataChange,
  handleSubmit,
  userToAdd,
  handleApproveStudent
}) {

  // useState for load data
  const [currentUser, setCurrentUser] = useState({
    name: 'Not Found',
    email: 'Not Found',
    profile: 'Profile Img',
  });

  // checking for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          email: res.data.email,
          role: res.data.role,
        });
      })
      .catch(err => {
        console.log("AddUserTable.jsx => ", err);
      });
  }, []);

  {/* for hover label effect  */ }
  const renderTooltipDeleteUser = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Delete User
    </Tooltip>
  );
  const renderTooltipApproveUser = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Approve User
    </Tooltip>
  );


  return (
    <>
      <div className=''>
        {
          loading ? (
            // fake table loading animation 
            <div>
              <TablePlaceholder />
              {/* <i className="fa-solid fa-spinner fa-spin text-3xl" /> */}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200">
              <Table
                hover
                responsive="sm"
                className='mb-0 bg-white w-full text-base max-sm:text-sm'
              >
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>Sr. No.</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Name</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '25%' }}>Email</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Phone Number</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '20%' }}>Date of Joining</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '15%' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={user?.email} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm">
                          {user && (
                            <Link
                              to={
                                currentUser.role === "superuser"
                                  ? `/admin/user/${user?._id}`
                                  : currentUser.role === "management_admin"
                                    ? `/management/user/${user?._id}`
                                    : currentUser.role === "tpo_admin"
                                      ? `/tpo/user/${user?._id}`
                                      : "#"
                              }
                              className="text-indigo-600 no-underline hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                              <i className="fa-solid fa-user text-xs"></i>
                              {user?.first_name + " "}
                              {user?.last_name && user?.last_name}
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <a href={`mailto:${user.email}`} className='no-underline text-indigo-600 hover:text-indigo-800 flex items-center gap-1'>
                            <i className="fa-regular fa-envelope text-xs"></i>
                            {user.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-phone text-xs text-gray-400"></i>
                            {user.number}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <i className="fa-regular fa-calendar text-xs text-gray-400"></i>
                            {new Date(user.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {/* for hover label effect  */}
                          <div className="flex justify-center items-center">
                            {
                              userToAdd === 'approve-student' ? (
                                <div className="flex justify-center items-center gap-3">
                                  <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltipDeleteUser}
                                  >
                                    <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                      <i
                                        className="fa-solid fa-circle-xmark text-lg cursor-pointer"
                                        onClick={() => handleDeleteUser(user.email)}
                                      />
                                    </button>
                                  </OverlayTrigger >
                                  <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltipApproveUser}
                                  >
                                    <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                                      <i
                                        className="fa-solid fa-square-check text-lg cursor-pointer"
                                        onClick={() => handleApproveStudent(user.email)}
                                      />
                                    </button>
                                  </OverlayTrigger >
                                </div>

                              ) : (
                                <div className="flex justify-center">
                                  <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltipDeleteUser}
                                  >
                                    <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                      <i
                                        className="fa-regular fa-trash-can text-lg cursor-pointer"
                                        onClick={() => handleDeleteUser(user.email)}
                                      />
                                    </button>
                                  </OverlayTrigger >
                                </div>
                              )
                            }
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <i className="fa-solid fa-user-slash text-4xl text-gray-300"></i>
                          <p className="mb-0 font-medium">No users found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )
        }

        {/* checking if approve student user page is open or not */}
        {/* {
          userToAdd !== "approve-student" && (
            <Button variant="dark" size="lg" onClick={() => setFormOpen(true)}>
              <i className="fa-solid fa-person-circle-plus px-1" /> Add {userToAdd}
            </Button>
          )
        }


        {
          formOpen &&
          <>
            <div className="bg-white flex justify-center w-full mt-4">
              <div className='w-1/2 rounded-lg shadow px-10 py-3'>
                <Form className='text-base' onSubmit={handleSubmit}>
                  <h2>New {userToAdd}</h2>
                  <FloatingLabel className='my-3' label="Name">
                    <Form.Control type="text" autoComplete="name" placeholder="Name" name='first_name' value={data.first_name || ''} onChange={handleDataChange} />
                  </FloatingLabel>
                  <FloatingLabel className='my-3' label="Email">
                    <Form.Control type="email" autoComplete="email" placeholder="Email" name='email' value={data.email || ''} onChange={handleDataChange} />
                  </FloatingLabel>
                  <FloatingLabel className='my-3' label="Number">
                    <Form.Control type="number" autoComplete="number" placeholder="Phone Number" name='number' value={data.number || ''} onChange={handleDataChange} />
                  </FloatingLabel>
                  <FloatingLabel className='my-3' label="Password">
                    <Form.Control type="password" autoComplete="password" placeholder="Enter Initial Password" name='password' value={data.password || ''} onChange={handleDataChange} />
                  </FloatingLabel>
                  <button type="submit" className="flex items-center px-3 py-2 bg-blue-500 text-white rounded">
                    <GrFormAdd className="mr-2 text-3xl" />
                    Create New {userToAdd}
                  </button>
                </Form>
              </div>
            </div>
          </>
        } */}
      </div >
    </>
  )
}

export default AddUserTable;
