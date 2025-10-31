import {useEffect, useState } from "react";
import Accordion from 'react-bootstrap/Accordion';
import axios from 'axios';
import StudentTable from './StudentTableTemplate';
import { BASE_URL } from '../../config/backend_url';
import AccordionPlaceholder from '../AccordionPlaceholder';

function StudentYearAndBranchView() {
  document.title = 'CPMS | All Students';

  const [loading, setLoading] = useState(true);

  // ---- All State Variables ----
  const [firstYearCSE, setFirstYearCSE] = useState([]);
  const [firstYearISE, setFirstYearISE] = useState([]);
  const [firstYearAIML, setFirstYearAIML] = useState([]);
  const [firstYearMECH, setFirstYearMECH] = useState([]);
  const [firstYearCIVIL, setFirstYearCIVIL] = useState([]);
  const [firstYearECE, setFirstYearECE] = useState([]);
  const [firstYearEEE, setFirstYearEEE] = useState([]);

  const [secondYearCSE, setSecondYearCSE] = useState([]);
  const [secondYearISE, setSecondYearISE] = useState([]);
  const [secondYearAIML, setSecondYearAIML] = useState([]);
  const [secondYearMECH, setSecondYearMECH] = useState([]);
  const [secondYearCIVIL, setSecondYearCIVIL] = useState([]);
  const [secondYearECE, setSecondYearECE] = useState([]);
  const [secondYearEEE, setSecondYearEEE] = useState([]);

  const [thirdYearCSE, setThirdYearCSE] = useState([]);
  const [thirdYearISE, setThirdYearISE] = useState([]);
  const [thirdYearAIML, setThirdYearAIML] = useState([]);
  const [thirdYearMECH, setThirdYearMECH] = useState([]);
  const [thirdYearCIVIL, setThirdYearCIVIL] = useState([]);
  const [thirdYearECE, setThirdYearECE] = useState([]);
  const [thirdYearEEE, setThirdYearEEE] = useState([]);

  const [fourthYearCSE, setFourthYearCSE] = useState([]);
  const [fourthYearISE, setFourthYearISE] = useState([]);
  const [fourthYearAIML, setFourthYearAIML] = useState([]);
  const [fourthYearMECH, setFourthYearMECH] = useState([]);
  const [fourthYearCIVIL, setFourthYearCIVIL] = useState([]);
  const [fourthYearECE, setFourthYearECE] = useState([]);
  const [fourthYearEEE, setFourthYearEEE] = useState([]);

  const fetchStudentsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/student/all-students-data-year-and-branch`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFirstYearCSE(response.data.firstYearCSE);
      setFirstYearISE(response.data.firstYearISE);
      setFirstYearAIML(response.data.firstYearAIML);
      setFirstYearMECH(response.data.firstYearMECH);
      setFirstYearCIVIL(response.data.firstYearCIVIL);
      setFirstYearECE(response.data.firstYearECE);
      setFirstYearEEE(response.data.firstYearEEE);

      setSecondYearCSE(response.data.secondYearCSE);
      setSecondYearISE(response.data.secondYearISE);
      setSecondYearAIML(response.data.secondYearAIML);
      setSecondYearMECH(response.data.secondYearMECH);
      setSecondYearCIVIL(response.data.secondYearCIVIL);
      setSecondYearECE(response.data.secondYearECE);
      setSecondYearEEE(response.data.secondYearEEE);

      setThirdYearCSE(response.data.thirdYearCSE);
      setThirdYearISE(response.data.thirdYearISE);
      setThirdYearAIML(response.data.thirdYearAIML);
      setThirdYearMECH(response.data.thirdYearMECH);
      setThirdYearCIVIL(response.data.thirdYearCIVIL);
      setThirdYearECE(response.data.thirdYearECE);
      setThirdYearEEE(response.data.thirdYearEEE);

      setFourthYearCSE(response.data.fourthYearCSE);
      setFourthYearISE(response.data.fourthYearISE);
      setFourthYearAIML(response.data.fourthYearAIML);
      setFourthYearMECH(response.data.fourthYearMECH);
      setFourthYearCIVIL(response.data.fourthYearCIVIL);
      setFourthYearECE(response.data.fourthYearECE);
      setFourthYearEEE(response.data.fourthYearEEE);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  return (
    <>
      {loading ? (
        <AccordionPlaceholder />
      ) : (
        <div className="my-4 max-md:p-2 md:p-6 overflow-auto">
          <Accordion defaultActiveKey={['1']} flush alwaysOpen className="flex flex-col gap-4">

            {/* Fourth Year */}
            <Accordion.Item eventKey="1" className="shadow-lg">
              <Accordion.Header>Fourth Year</Accordion.Header>
              <Accordion.Body>
                <StudentTable branchName="CSE" studentData={fourthYearCSE} />
                <StudentTable branchName="ISE" studentData={fourthYearISE} />
                <StudentTable branchName="AIML" studentData={fourthYearAIML} />
                <StudentTable branchName="MECH" studentData={fourthYearMECH} />
                <StudentTable branchName="CIVIL" studentData={fourthYearCIVIL} />
                <StudentTable branchName="ECE" studentData={fourthYearECE} />
                <StudentTable branchName="EEE" studentData={fourthYearEEE} />
              </Accordion.Body>
            </Accordion.Item>

            {/* Third Year */}
            <Accordion.Item eventKey="2" className="shadow-lg">
              <Accordion.Header>Third Year</Accordion.Header>
              <Accordion.Body>
                <StudentTable branchName="CSE" studentData={thirdYearCSE} />
                <StudentTable branchName="ISE" studentData={thirdYearISE} />
                <StudentTable branchName="AIML" studentData={thirdYearAIML} />
                <StudentTable branchName="MECH" studentData={thirdYearMECH} />
                <StudentTable branchName="CIVIL" studentData={thirdYearCIVIL} />
                <StudentTable branchName="ECE" studentData={thirdYearECE} />
                <StudentTable branchName="EEE" studentData={thirdYearEEE} />
              </Accordion.Body>
            </Accordion.Item>

            {/* Second Year */}
            <Accordion.Item eventKey="3" className="shadow-lg">
              <Accordion.Header>Second Year</Accordion.Header>
              <Accordion.Body>
                <StudentTable branchName="CSE" studentData={secondYearCSE} />
                <StudentTable branchName="ISE" studentData={secondYearISE} />
                <StudentTable branchName="AIML" studentData={secondYearAIML} />
                <StudentTable branchName="MECH" studentData={secondYearMECH} />
                <StudentTable branchName="CIVIL" studentData={secondYearCIVIL} />
                <StudentTable branchName="ECE" studentData={secondYearECE} />
                <StudentTable branchName="EEE" studentData={secondYearEEE} />
              </Accordion.Body>
            </Accordion.Item>

            {/* First Year */}
            <Accordion.Item eventKey="4" className="shadow-lg">
              <Accordion.Header>First Year</Accordion.Header>
              <Accordion.Body>
                <StudentTable branchName="CSE" studentData={firstYearCSE} />
                <StudentTable branchName="ISE" studentData={firstYearISE} />
                <StudentTable branchName="AIML" studentData={firstYearAIML} />
                <StudentTable branchName="MECH" studentData={firstYearMECH} />
                <StudentTable branchName="CIVIL" studentData={firstYearCIVIL} />
                <StudentTable branchName="ECE" studentData={firstYearECE} />
                <StudentTable branchName="EEE" studentData={firstYearEEE} />
              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        </div>
      )}
    </>
  );
}

export default StudentYearAndBranchView;



// old code
// import {useEffect, useState } from "react";
// import Accordion from 'react-bootstrap/Accordion';
// import axios from 'axios';
// import StudentTable from './StudentTableTemplate';
// import { BASE_URL } from '../../config/backend_url';
// import AccordionPlaceholder from '../AccordionPlaceholder';

// function StudentYearAndBranchView() {
//   document.title = 'CPMS | All Students';

//   const [loading, setLoading] = useState(true);

//   const [firstYearComputer, setFirstYearComputer] = useState([]);
//   const [firstYearCivil, setFirstYearCivil] = useState([]);
//   const [firstYearMechanical, setFirstYearMechanical] = useState([]);
//   const [firstYearAIDS, setFirstYearAIDS] = useState([]);
//   const [firstYearECS, setFirstYearECS] = useState([]);
//   const [secondYearComputer, setSecondYearComputer] = useState([]);
//   const [secondYearCivil, setSecondYearCivil] = useState([]);
//   const [secondYearMechanical, setSecondYearMechanical] = useState([]);
//   const [secondYearECS, setSecondYearECS] = useState([]);
//   const [secondYearAIDS, setSecondYearAIDS] = useState([]);
//   const [thirdYearComputer, setThirdYearComputer] = useState([]);
//   const [thirdYearCivil, setThirdYearCivil] = useState([]);
//   const [thirdYearMechanical, setThirdYearMechanical] = useState([]);
//   const [thirdYearECS, setThirdYearECS] = useState([]);
//   const [thirdYearAIDS, setThirdYearAIDS] = useState([]);
//   const [fourthYearComputer, setFourthYearComputer] = useState([]);
//   const [fourthYearCivil, setFourthYearCivil] = useState([]);
//   const [fourthYearMechanical, setFourthYearMechanical] = useState([]);
//   const [fourthYearECS, setFourthYearECS] = useState([]);
//   const [fourthYearAIDS, setFourthYearAIDS] = useState([]);

//   const fetchStudentsData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/student/all-students-data-year-and-branch`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         }
//       });
//       setFirstYearComputer(response.data.firstYearComputer);
//       setFirstYearCivil(response.data.firstYearCivil);
//       setFirstYearMechanical(response.data.firstYearMechanical);
//       setFirstYearECS(response.data.firstYearECS);
//       setFirstYearAIDS(response.data.firstYearAIDS);

//       setSecondYearComputer(response.data.secondYearComputer);
//       setSecondYearCivil(response.data.secondYearCivil);
//       setSecondYearMechanical(response.data.secondYearMechanical);
//       setSecondYearECS(response.data.secondYearECS);
//       setSecondYearAIDS(response.data.secondYearAIDS);

//       setThirdYearComputer(response.data.thirdYearComputer);
//       setThirdYearCivil(response.data.thirdYearCivil);
//       setThirdYearMechanical(response.data.thirdYearMechanical);
//       setThirdYearECS(response.data.thirdYearECS);
//       setThirdYearAIDS(response.data.thirdYearAIDS);

//       setFourthYearComputer(response.data.fourthYearComputer);
//       setFourthYearCivil(response.data.fourthYearCivil);
//       setFourthYearMechanical(response.data.fourthYearMechanical);
//       setFourthYearECS(response.data.fourthYearECS);
//       setFourthYearAIDS(response.data.fourthYearAIDS);

//       // setLoading(false);
//     } catch (error) {
//       console.log("Error fetching jobs ", error);
//       // if (error?.response?.data?.msg) {
//       // setToastMessage(error.response.data.msg);
//       // setShowToast(true);
//       // }
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchStudentsData();
//   }, []);

//   return (
//     <>
//       {
//         loading ? (
//           // <div className="flex justify-center h-72 items-center">
//           //   <i className="fa-solid fa-spinner fa-spin text-3xl" />
//           // </div>
//           <AccordionPlaceholder />
//         ) : (
//           <>
//             <div className="my-4 max-md:p-2 md:p-6 overflow-auto">
//               <div className="">
//                 {/* parent accordion for year of student  */}
//                 <Accordion defaultActiveKey={['1']} flush className='flex flex-col gap-4'>
//                   <Accordion.Item eventKey="1" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
//                     {/* 4th year  */}
//                     <Accordion.Header>Fourth Year</Accordion.Header>
//                     <Accordion.Body>
//                       <Accordion flush defaultActiveKey={['Computer']} className='flex flex-col gap-2'>
//                         <StudentTable branchName={"Computer"} studentData={fourthYearComputer} />
//                         <StudentTable branchName={"Civil"} studentData={fourthYearCivil} />
//                         <StudentTable branchName={"ECS"} studentData={fourthYearECS} />
//                         <StudentTable branchName={"AIDS"} studentData={fourthYearAIDS} />
//                         <StudentTable branchName={"Mechanical"} studentData={fourthYearMechanical} />
//                       </Accordion>
//                     </Accordion.Body>
//                   </Accordion.Item>

//                   <Accordion.Item eventKey="2" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
//                     {/* 3rd year  */}
//                     <Accordion.Header>Third Year</Accordion.Header>
//                     <Accordion.Body>
//                       <Accordion flush defaultActiveKey={['Computer']} className='flex flex-col gap-2'>
//                         <StudentTable branchName={"Computer"} studentData={thirdYearComputer} />
//                         <StudentTable branchName={"Civil"} studentData={thirdYearCivil} />
//                         <StudentTable branchName={"ECS"} studentData={thirdYearECS} />
//                         <StudentTable branchName={"AIDS"} studentData={thirdYearAIDS} />
//                         <StudentTable branchName={"Mechanical"} studentData={thirdYearMechanical} />
//                       </Accordion>
//                     </Accordion.Body>
//                   </Accordion.Item>

//                   <Accordion.Item eventKey="3" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
//                     {/* 2nd year  */}
//                     <Accordion.Header>Second Year</Accordion.Header>
//                     <Accordion.Body>
//                       <Accordion flush defaultActiveKey={['Computer']} className='flex flex-col gap-2'>
//                         <StudentTable branchName={"Computer"} studentData={secondYearComputer} />
//                         <StudentTable branchName={"Civil"} studentData={secondYearCivil} />
//                         <StudentTable branchName={"ECS"} studentData={secondYearECS} />
//                         <StudentTable branchName={"AIDS"} studentData={secondYearAIDS} />
//                         <StudentTable branchName={"Mechanical"} studentData={secondYearMechanical} />
//                       </Accordion>
//                     </Accordion.Body>
//                   </Accordion.Item>

//                   <Accordion.Item eventKey="4" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
//                     {/* 1st year  */}
//                     <Accordion.Header>First Year</Accordion.Header>
//                     <Accordion.Body>
//                       <Accordion flush defaultActiveKey={['Computer']} className='flex flex-col gap-2'>
//                         <StudentTable branchName={"Computer"} studentData={firstYearComputer} />
//                         <StudentTable branchName={"Civil"} studentData={firstYearCivil} />
//                         <StudentTable branchName={"ECS"} studentData={firstYearECS} />
//                         <StudentTable branchName={"AIDS"} studentData={firstYearAIDS} />
//                         <StudentTable branchName={"Mechanical"} studentData={firstYearMechanical} />
//                       </Accordion>
//                     </Accordion.Body>
//                   </Accordion.Item>


//                 </Accordion>
//               </div>


//             </div >
//           </>
//         )
//       }
//     </>
//   )
// }

// export default StudentYearAndBranchView

