import threading
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from icalendar import Calendar, Event
from datetime import timedelta

def send_html_email_async(subject, template_name, context, recipient_list, ics_data=None):
    """
    Sends HTML email using Django's EmailMultiAlternatives in a background thread.
    Optionally attaches an ICS calendar file.
    """
    def _send():
        try:
            html_content = render_to_string(template_name, context)
            # Standard text fallback
            text_content = f"Subject: {subject}\n"
            for k, v in context.items():
                text_content += f"{k}: {v}\n"

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            msg.attach_alternative(html_content, "text/html")

            if ics_data:
                msg.attach("invite.ics", ics_data, "text/calendar")

            msg.send()
        except Exception as e:
            # Silence error or log it to console
            print(f"Background email send failed: {e}")

    # Launch background thread
    threading.Thread(target=_send).start()

def generate_ics_file(interview):
    """
    Helper to generate raw ICS data for an interview.
    """
    try:
        cal = Calendar()
        cal.add("prodid", "-//InterviewHub Calendar//EN")
        cal.add("version", "2.0")

        event = Event()
        event.add("summary", f"{interview.type} Interview - {interview.role}")
        event.add("dtstart", interview.date)
        event.add("dtend", interview.date + timedelta(minutes=interview.duration_min))
        event.add("description", f"Interviewer: {interview.interviewer}\nNotes: {interview.notes}")
        if interview.meeting_link:
            event.add("location", interview.meeting_link)

        cal.add_component(event)
        return cal.to_ical()
    except Exception:
        return None

def send_interview_scheduled_email(interview):
    subject = f"Interview Scheduled: {interview.type} - {interview.role}"
    context = {
        "candidate_name": interview.candidate.name,
        "role": interview.role,
        "type": interview.type,
        "mode": interview.mode,
        "date": interview.date,
        "duration_min": interview.duration_min,
        "interviewer": interview.interviewer,
        "meeting_link": interview.meeting_link,
        "notes": interview.notes,
        "frontend_url": settings.FRONTEND_URL
    }
    
    recipients = [interview.candidate.email]
    
    # Query all active administrators to notify them of the scheduled round
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_emails = list(User.objects.filter(role="ADMIN", is_active=True).values_list("email", flat=True))
        recipients.extend(admin_emails)
    except Exception as e:
        print(f"Failed to retrieve administrator emails: {e}")

    send_html_email_async(
        subject,
        "emails/interview_scheduled.html",
        context,
        recipients
    )

def send_interview_status_changed_email(interview, old_status, new_status):
    subject = f"Interview Update: Status Changed to {new_status}"
    context = {
        "candidate_name": interview.candidate.name,
        "role": interview.role,
        "type": interview.type,
        "old_status": old_status,
        "new_status": new_status,
        "date": interview.date,
        "interviewer": interview.interviewer,
        "meeting_link": interview.meeting_link,
        "frontend_url": settings.FRONTEND_URL
    }
    
    ics_data = None
    if new_status == "CONFIRMED":
        ics_data = generate_ics_file(interview)
        
    send_html_email_async(
        subject,
        "emails/interview_status_changed.html",
        context,
        [interview.candidate.email],
        ics_data=ics_data
    )

def send_new_notice_email(notice, user_emails):
    subject = f"Notice Board Alert: {notice.title}"
    context = {
        "title": notice.title,
        "body": notice.body,
        "priority": notice.priority,
        "type": notice.type,
        "frontend_url": settings.FRONTEND_URL
    }
    send_html_email_async(
        subject,
        "emails/new_notice.html",
        context,
        list(user_emails)
    )

def send_new_comment_email(comment):
    interview = comment.interview
    # Only notify if comment author is NOT the candidate
    if comment.author != interview.candidate:
        subject = f"New Comment on your {interview.type} Interview"
        context = {
            "candidate_name": interview.candidate.name,
            "comment_author": comment.author.name,
            "comment_text": comment.text,
            "interview_id": str(interview.id),
            "frontend_url": settings.FRONTEND_URL
        }
        send_html_email_async(
            subject,
            "emails/new_comment.html",
            context,
            [interview.candidate.email]
        )
