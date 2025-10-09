import Dashboard from './modules/Dashboard/DashboardOverview'
import ScholarshipOverview from './modules/scholarship/ScholarshipOverview'
import ScholarshipApplications from './modules/scholarship/ScholarshipApplications'
import ScholarshipPrograms from './modules/scholarship/ScholarshipPrograms'
import ScholarshipStudents from './modules/scholarship/ScholarshipStudents'
import ScholarshipDocuments from './modules/scholarship/ScholarshipDocuments'
import ScholarshipReports from './modules/scholarship/ScholarshipReports'
import ScholarshipSettings from './modules/scholarship/ScholarshipSettings'
import SADOverview from './modules/schoolAid/SADOverview'
import StudentRegistryOverview from './modules/studentRegistry/StudentRegistryOverview'
import PSDOverview from './modules/partnerSchool/PSDOverview'
import { EMROverview } from './modules/educationMonitoring'
import SettingsOverview from './modules/settings/SettingsOverview'

type Props = { activeItem: string; onPageChange?: (id: string) => void }

function ContentRenderer({ activeItem, onPageChange }: Props) {
	switch (activeItem) {
		case 'dashboard':
			return <div><Dashboard /></div>
		case 'scholarship-overview':
			return <div><ScholarshipOverview /></div>
		case 'scholarship-applications':
			return <div><ScholarshipApplications /></div>
		case 'scholarship-programs':
			return <div><ScholarshipPrograms /></div>
		case 'scholarship-students':
			return <div><ScholarshipStudents /></div>
		case 'scholarship-documents':
			return <div><ScholarshipDocuments /></div>
		case 'scholarship-reports':
			return <div><ScholarshipReports /></div>
		case 'scholarship-settings':
			return <div><ScholarshipSettings /></div>
		case 'sad-overview':
			return <div><SADOverview onPageChange={onPageChange} /></div>
		case 'studentRegistry-overview':
			return <div><StudentRegistryOverview /></div>
		case 'psd-overview':
			return <div><PSDOverview /></div>
		case 'emr-overview':
			return <div><EMROverview /></div>
		case 'settings':
			return <div><SettingsOverview /></div>
		default:
			return <div><Dashboard /></div>
	}
}

export default ContentRenderer 