import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import OtpVerification from './Auth/Otp';
import NewPassword from './Auth/NewPassword';
import SelectOrganization from './Auth/SelectOrganization';
import ForgetPassword from './Auth/ForgetPassword';
import LandingPage from './LandingPage/Landingpage';
import AdminDashboardSideNav from './SidenavAdmindasboard/Dashboard'; // Corrected name
import AdminDashboard from './Admin/Dashbaord'; // Corrected name
import Employees from './Admin/Employees';
import OrgDetails from './Admin/OrgDetails';
import Departments from './Admin/Departments';
import SetMetrics from './Admin/SetMetrics';
import StaffFeedback from './Admin/StaffFeedback';
import Settings from './util/Settings';
import DetailsStaffFeedback from './Admin/DetailsStaffFeedback';
import LeaderBoard from './Admin/LeaderBoard';
import Report from './Admin/Report';
import SideMangerdashboard from './SidenavManagerdashboard/Dashboard';
import MangerDashboard from './Manager/DashBoard';
import Evaluation from './Manager/Evaluation';
import Department from './Manager/Department';
import Matrix_Information from './Manager/Matrix_Information';
import Team from './Manager/Team';
import Feedback from './Manager/FeedBack';
import ReportManager from './Manager/Report';
import Notification from './util/Notification';
import EmployeeDashboardSideNav from './SidenavEmployeedashboard/Dashboard';
import EmployeeDashBoard from './Employee/Dashboard';
import ReportEmployee from './Employee/Report';
import Goal from './Employee/Goal';
import FeedBack from './Employee/FeedBack';
import EmployeeLeaderBoard from './Employee/LeaderBoard';
import CreateOrganiztaion from './Auth/CreateOrganiztion';
import EmployeeNamePass from './Auth/EmployeeNamePass';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <Router>
      <Routes>
      <ToastContainer position="top-right" autoClose={3000} />
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/select-organization" element={<SelectOrganization />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        {/* <Route path="/notification" element={<Notification />} /> */}
        <Route path='/create-organization' element={<CreateOrganiztaion/>}/>
        <Route path='/employee-name-pass' element={<EmployeeNamePass />} />

        {/* Admin Dashboard Routes */}
        <Route element={<AdminDashboardSideNav />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/orgdetails" element={<OrgDetails />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/setmetrics" element={<SetMetrics />} />
          <Route path="/admin/stafffeedback" element={<StaffFeedback />} />
          <Route path="/admin/notification" element={<Notification />} />
          <Route path="/admin/setting" element={<Settings />} />
          <Route path="/admin/leaderboard" element={<LeaderBoard />} />
          <Route path='/admin/report' element={<Report/>}/>
          <Route path="/admin/stafffeedback/:id" element={<DetailsStaffFeedback />} />
        </Route>

        <Route element={<SideMangerdashboard/>}>
        <Route path='/manger/dashboard' element={<MangerDashboard />} />
        <Route path='/manger/evaluation' element={<Evaluation />} />
        <Route path='/manger/departments' element={<Department />} />
        <Route path='/manger/matrix' element={<  Matrix_Information />} />
        <Route path='/manger/team' element={<Team />} />
        <Route path='/manger/feedback' element={<Feedback />} />
        <Route path='/manger/leaderboard' element={<LeaderBoard />} />
        <Route path="/manger/setting" element={<Settings />} />
        <Route path='/manger/report' element={<ReportManager />} />

        </Route>
        <Route element={<EmployeeDashboardSideNav/>}>
        <Route path='/employee/dashboard' element={<EmployeeDashBoard />} />
        <Route path='/employee/report' element={<ReportEmployee />} />
        <Route path='/employee/goal' element={<Goal />} />
        <Route path='/employee/feedback' element={<FeedBack />} />
        <Route path="/employee/setting" element={<Settings />} />
        <Route path='/employee/leaderboard' element={<EmployeeLeaderBoard />} />

        </Route>
        
      </Routes>
    </Router>
  ); 
}

export default App;
