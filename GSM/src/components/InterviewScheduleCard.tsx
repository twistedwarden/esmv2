import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { scholarshipApiService, InterviewSchedule } from '../services/scholarshipApiService';

interface InterviewScheduleCardProps {
  applicationId: number;
}

const InterviewScheduleCard: React.FC<InterviewScheduleCardProps> = ({
  applicationId
}) => {
  const [schedule, setSchedule] = useState<InterviewSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const schedules = await scholarshipApiService.getInterviewSchedules();
      const studentSchedule = schedules.find(s => s.application_id === applicationId);
      setSchedule(studentSchedule || null);
    } catch (err) {
      console.error('Error fetching interview schedule:', err);
      setError('Failed to load interview schedule');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Fetch interview schedule
  useEffect(() => {
    fetchInterviewSchedule();
  }, [applicationId, fetchInterviewSchedule]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'no_show':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'rescheduled':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'no_show':
        return 'text-orange-600 bg-orange-100';
      case 'rescheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      case 'rescheduled':
        return 'Rescheduled';
      default:
        return 'Scheduled';
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'phone':
        return <Phone className="h-5 w-5 text-green-500" />;
      default:
        return <MapPin className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInterviewTypeText = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online Interview';
      case 'phone':
        return 'Phone Interview';
      default:
        return 'In-Person Interview';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const interviewDate = new Date(`${date}T${time}`);
    return {
      date: interviewDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: interviewDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const addToCalendar = () => {
    if (!schedule) return;

    const startDate = new Date(`${schedule.interview_date}T${schedule.interview_time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarData = {
      title: 'Scholarship Interview',
      description: `Interview for scholarship application. ${schedule.interview_notes || ''}`,
      location: schedule.interview_type === 'online' ? schedule.meeting_link : schedule.interview_location,
      start: formatDate(startDate),
      end: formatDate(endDate)
    };

    // Google Calendar
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
    
    // iCal format
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Scholarship System//Interview Schedule//EN
BEGIN:VEVENT
UID:${schedule.id}@scholarship-system.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${calendarData.start}
DTEND:${calendarData.end}
SUMMARY:${calendarData.title}
DESCRIPTION:${calendarData.description}
LOCATION:${calendarData.location}
END:VEVENT
END:VCALENDAR`;

    const icalBlob = new Blob([icalContent], { type: 'text/calendar' });
    const icalUrl = URL.createObjectURL(icalBlob);

    // Create download link for iCal
    const link = document.createElement('a');
    link.href = icalUrl;
    link.download = `interview-${schedule.id}.ics`;
    link.click();

    // Open Google Calendar in new tab
    window.open(googleUrl, '_blank');
  };

  const joinMeeting = () => {
    if (schedule?.meeting_link) {
      window.open(schedule.meeting_link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading interview schedule...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Schedule</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInterviewSchedule}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Scheduled</h3>
          <p className="text-gray-600">
            Your interview has not been scheduled yet. You will be notified once a date and time are assigned.
          </p>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(schedule.interview_date, schedule.interview_time);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Interview Schedule</span>
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schedule.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(schedule.status)}
            <span>{getStatusText(schedule.status)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Interview Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-gray-900">{date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-gray-900">{time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getInterviewTypeIcon(schedule.interview_type)}
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-gray-900">{getInterviewTypeText(schedule.interview_type)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {schedule.interview_type === 'online' ? (
                <Video className="h-5 w-5 text-gray-500" />
              ) : (
                <MapPin className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {schedule.interview_type === 'online' ? 'Meeting Link' : 'Location'}
                </p>
                <p className="text-gray-900">
                  {schedule.interview_type === 'online' 
                    ? schedule.meeting_link || 'Link not provided'
                    : schedule.interview_location
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interviewer Information */}
        {schedule.interviewer_name && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-600">Interviewer</p>
                <p className="text-blue-900">{schedule.interviewer_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Interview Notes */}
        {schedule.interview_notes && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800 mb-1">Interview Notes</p>
            <p className="text-yellow-700">{schedule.interview_notes}</p>
          </div>
        )}

        {/* Interview Result */}
        {schedule.interview_result && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Interview Result</p>
                <p className="text-green-700 capitalize">{schedule.interview_result.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button
            onClick={addToCalendar}
            className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4" />
            <span>Add to Calendar</span>
          </button>

          {schedule.interview_type === 'online' && schedule.meeting_link && (
            <button
              onClick={joinMeeting}
              className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              <Video className="h-4 w-4" />
              <span>Join Meeting</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={fetchInterviewSchedule}
            className="flex items-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Scheduling Information */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            Scheduled {schedule.scheduling_type === 'automatic' ? 'automatically' : 'manually'} on{' '}
            {new Date(schedule.created_at || '').toLocaleDateString()}
          </p>
          {schedule.completed_at && (
            <p>
              Completed on {new Date(schedule.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduleCard;





