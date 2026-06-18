import csv
from django.http import StreamingHttpResponse

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        return value

def generate_interview_csv_rows(interviews):
    # CSV headers as requested
    headers = [
        "ID", "Candidate Name", "Email", "Role", "Department", "Type", 
        "Mode", "Date", "Time", "Duration (min)", "Interviewer", "Interview Handler", "Meeting Link", 
        "Status", "Scheduled At"
    ]
    
    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    yield writer.writerow(headers)
    
    for interview in interviews:
        local_date = interview.date.date().isoformat() if interview.date else ""
        local_time = interview.date.time().strftime("%H:%M:%S") if interview.date else ""
        scheduled_at = interview.created_at.isoformat() if interview.created_at else ""
        
        row = [
            str(interview.id),
            interview.candidate.name,
            interview.candidate.email,
            interview.role,
            interview.department,
            interview.type,
            interview.mode,
            local_date,
            local_time,
            str(interview.duration_min),
            interview.interviewer,
            interview.interview_handler,
            interview.meeting_link,
            interview.status,
            scheduled_at
        ]
        yield writer.writerow(row)

def get_interviews_csv_streaming_response(interviews):
    response = StreamingHttpResponse(
        generate_interview_csv_rows(interviews),
        content_type="text/csv"
    )
    response["Content-Disposition"] = 'attachment; filename="interviews.csv"'
    return response
