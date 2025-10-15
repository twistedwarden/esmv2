import Dashboard from './modules/Dashboard/DashboardOverview'
import ScholarshipOverview from './modules/scholarship/ScholarshipOverview'
import ApplicationManagement from './modules/scholarship/application/ApplicationManagement'
import ScholarshipPrograms from './modules/scholarship/ScholarshipPrograms'
import SSCManagement from './modules/scholarship/ssc/SSCManagement'
import SADOverview from './modules/schoolAid/SADOverview'
import SADApplications from './modules/schoolAid/SADApplications'
import SADDistributionLogs from './modules/schoolAid/SADDistributionLogs'
import FundAllocation from './modules/schoolAid/FundAllocation'
import PaymentProcessing from './modules/schoolAid/PaymentProcessing'
import Analytics from './modules/schoolAid/Analytics'
import StudentRegistryOverview from './modules/studentRegistry/StudentRegistryOverview'
import ActiveStudents from './modules/studentRegistry/ActiveStudents'
import ArchivedStudents from './modules/studentRegistry/ArchivedStudents'
import Scholars from './modules/studentRegistry/Scholars'
import BulkOperations from './modules/studentRegistry/BulkOperations'
import ReportsAnalytics from './modules/studentRegistry/ReportsAnalytics'
import ImportExport from './modules/studentRegistry/ImportExport'
import PSDSchoolManagement from './modules/partnerSchool/PSDSchoolManagement'
import PSDStudentPopulation from './modules/partnerSchool/PSDStudentPopulation'
import PSDVerification from './modules/partnerSchool/PSDVerification'
import PSDAnalytics from './modules/partnerSchool/PSDAnalytics'
import PSDSettings from './modules/partnerSchool/PSDSettings'
import UserManagement from './modules/UserManagement/UserManagement'
import AuditLog from './modules/AuditLog/AuditLog'
import { EMROverview, AcademicPerformanceReport, EnrollmentReport, StudentProgressReport, AnalyticsCharts } from './modules/educationMonitoring'
import SettingsOverview from './modules/settings/SettingsOverview'
import InterviewerDashboard from './modules/interviewer/InterviewerDashboard'
import MyInterviews from './modules/interviewer/MyInterviews'
import DocumentSecurityDashboard from './modules/security/DocumentSecurityDashboard'

type Props = { activeItem: string; onPageChange?: (id: string) => void; userRole?: string; userSystemRole?: string }

function ContentRenderer({ activeItem, onPageChange, userRole, userSystemRole }: Props) {
	switch (activeItem) {
		case 'dashboard':
			// Show interviewer dashboard for staff with interviewer system role
			if (userRole === 'staff' && userSystemRole === 'interviewer') {
				return <div><InterviewerDashboard /></div>
			}
			return <div><Dashboard /></div>
		case 'Settings':
			return <div><SettingsOverview /></div>
		case 'scholarship-overview':
			return <div><ScholarshipOverview /></div>
		case 'scholarship-applications':
			return <div><ApplicationManagement /></div>
		case 'scholarship-programs':
			return <div><ScholarshipPrograms /></div>
		case 'scholarship-ssc':
			return <div><SSCManagement /></div>
		case 'sad-overview':
			return <div><SADOverview onPageChange={onPageChange} /></div>
		case 'sad-applications':
			return <div><SADApplications onPageChange={onPageChange} /></div>
		case 'sad-distribution-logs':
			return <div><SADDistributionLogs onPageChange={onPageChange} /></div>
		case 'sad-fund-allocation':
			return <div><FundAllocation onPageChange={onPageChange} /></div>
		case 'sad-payment-processing':
			return <div><PaymentProcessing onPageChange={onPageChange} /></div>
		case 'sad-analytics':
			return <div><Analytics onPageChange={onPageChange} /></div>
		case 'studentRegistry-overview':
			return <div><StudentRegistryOverview /></div>
		case 'studentRegistry-active-students':
			return <div><ActiveStudents /></div>
		case 'studentRegistry-archived-students':
			return <div><ArchivedStudents /></div>
		case 'studentRegistry-scholars':
			return <div><Scholars /></div>
		case 'studentRegistry-bulk-operations':
			return <div><BulkOperations /></div>
		case 'studentRegistry-reports':
			return <div><ReportsAnalytics /></div>
		case 'studentRegistry-import-export':
			return <div><ImportExport /></div>
		case 'psd-school-management':
			return <div><PSDSchoolManagement /></div>
		case 'psd-student-population':
			return <div><PSDStudentPopulation /></div>
		case 'psd-verification':
			return <div><PSDVerification /></div>
		case 'psd-analytics':
			return <div><PSDAnalytics /></div>
		case 'psd-settings':
			return <div><PSDSettings /></div>
		case 'emr-overview':
			return <div><EMROverview /></div>
		case 'emr-academic-performance':
			return <div><AcademicPerformanceReport /></div>
		case 'emr-enrollment-statistics':
			return <div><EnrollmentReport /></div>
		case 'emr-student-progress':
			return <div><StudentProgressReport /></div>
		case 'emr-analytics':
			return <div><AnalyticsCharts /></div>
            case 'user-management':
                return <div><UserManagement /></div>
            case 'audit-logs':
                return <div><AuditLog /></div>
            // Security module routes
            case 'security-dashboard':
                return <div><DocumentSecurityDashboard activeItem="security-dashboard" /></div>
            case 'security-threats':
                return <div><DocumentSecurityDashboard activeItem="security-threats" /></div>
            case 'security-quarantine':
                return <div><DocumentSecurityDashboard activeItem="security-quarantine" /></div>
            case 'security-settings':
                return <div><DocumentSecurityDashboard activeItem="security-settings" /></div>
            case 'settings':
                return <div><SettingsOverview /></div>
		// Interviewer routes
		case 'interviews-pending':
			return <div><MyInterviews filter="pending" /></div>
		case 'interviews-completed':
			return <div><MyInterviews filter="completed" /></div>
		case 'interviews-all':
			return <div><MyInterviews filter="all" /></div>
		default:
			return <div>Dashboard</div>
	}
}

export default ContentRenderer 