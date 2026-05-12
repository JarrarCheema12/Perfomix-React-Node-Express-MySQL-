import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Signup from './Auth/SignUp';
import OtpVerification from './Auth/Otp';
import NewPassword from './Auth/NewPassword';
import SelectOrganization from './Auth/SelectOrganization';
import ForgetPassword from './Auth/ForgetPassword';
import LandingPage from './LandingPage/Landingpage';
import AdminDashboardSideNav from './SidenavAdmindasboard/Dashboard'; 
import AdminDashboard from './Admin/Dashbaord';
import Employees from './Admin/Employees';
import OrgDetails from './Admin/OrgDetails';
import Departments from './Admin/Departments';
import SetMetrics from './Admin/SetMetrics';
import StaffFeedback from './Admin/StaffFeedback';
import AdminSettings from './Admin/Settings';
import EmployeeSettings from './Employee/Settings';
import ManagerSettings from './Manager/Settings';
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
import ManagerLeaderBorad from './Manager/LeaderBoard';
import AdminPrivateRoute from './routes/AdminPrivateRoute';
import ManagerPrivateRoute from './routes/ManagerPrivateRoute';
import EmployeePrivateRoute from './routes/EmployeePrivateRoute';
import DetailsStaffFeedback from './Admin/DetailsStaffFeedback';
import FillSurvey from './Employee/FillSurvey';
import ManagerFillSurvey from './Manager/FillSurvey';
import Recomendation from './Admin/Recomendation';
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/select-organization" element={<SelectOrganization />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path='/create-organization' element={<CreateOrganiztaion />} />
        <Route path='/employee-name-pass' element={<EmployeeNamePass />} />

        {/* Admin Dashboard Routes */}
        <Route 
          element={
            <AdminPrivateRoute>
              <AdminDashboardSideNav />
            </AdminPrivateRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/orgdetails" element={<OrgDetails />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/setmetrics" element={<SetMetrics />} />
          <Route path="/admin/stafffeedback" element={<StaffFeedback />} />
          <Route path="/admin/notification" element={<Notification />} />
          <Route path="/admin/setting" element={<AdminSettings />} />
          <Route path="/admin/leaderboard" element={<LeaderBoard />} />
          <Route path='/admin/report' element={<Report />} />
          <Route path="/admin/stafffeedback/:id" element={<DetailsStaffFeedback />} />
          <Route path='/admin/recomendation' element={<Recomendation />} />
             </Route>

        {/* Manager Dashboard Routes */}
        <Route 
          element={
            <ManagerPrivateRoute>
              <SideMangerdashboard />
            </ManagerPrivateRoute>
          }
        >
          <Route path='/manger/dashboard' element={<MangerDashboard />} />
          <Route path='/manger/evaluation' element={<Evaluation />} />
          <Route path='/manger/departments' element={<Department />} />
          <Route path='/manger/matrix' element={<Matrix_Information />} />
          <Route path='/manger/team' element={<Team />} />
          <Route path='/manger/feedback' element={<Feedback />} />
          <Route path='/manger/leaderboard' element={<ManagerLeaderBorad />} />
          <Route path="/manger/setting" element={<ManagerSettings />} />
          <Route path='/manger/report' element={<ReportManager />} />
          <Route path='/manger/fill-survey/:id' element={<ManagerFillSurvey />} />

        </Route>
 
        {/* Employee Dashboard Routes */}
        <Route 
          element={
            <EmployeePrivateRoute>
              <EmployeeDashboardSideNav />
            </EmployeePrivateRoute>
          }
        >
          <Route path='/employee/dashboard' element={<EmployeeDashBoard />} />
          <Route path='/employee/report' element={<ReportEmployee />} />
          <Route path='/employee/goal' element={<Goal />} />
          <Route path='/employee/feedback' element={<FeedBack />} />
          <Route path="/employee/setting" element={<EmployeeSettings />} />
          <Route path='/employee/leaderboard' element={<EmployeeLeaderBoard />} />
          <Route path='/employee/fill-survey/:id' element={<FillSurvey />} />
        </Route>
      </Routes>
    </Router>
  ); 
}

export default App;
