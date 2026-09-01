from twilio.rest import Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_twilio_client():
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        return None
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

def send_whatsapp(to_number: str, message: str) -> bool:
    client = get_twilio_client()
    if not client:
        logger.warning("Twilio not configured, skipping WhatsApp message")
        return False
    try:
        msg = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to_number}",
            body=message
        )
        logger.info(f"WhatsApp sent: {msg.sid}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
        return False

def notify_booking_client(client_phone: str, client_name: str, business_name: str, service_name: str):
    msg = (
        f"Hi {client_name}! 👋\n\n"
        f"Your booking request at *{business_name}* for *{service_name}* has been received. "
        f"They'll confirm shortly.\n\n"
        f"Shop Local, Shop Lekker! 🇿🇦\n— Loxion Mart"
    )
    send_whatsapp(client_phone, msg)

def notify_booking_business(business_wa: str, client_name: str, client_phone: str, service_name: str, notes: str):
    msg = (
        f"🔔 *New Booking via Loxion Mart!*\n\n"
        f"Client: {client_name}\n"
        f"Phone: {client_phone}\n"
        f"Service: {service_name}\n"
        f"Notes: {notes or 'None'}\n\n"
        f"Reply to confirm or contact the client directly."
    )
    send_whatsapp(business_wa, msg)

def notify_order_paid(client_phone: str, client_name: str, business_name: str, order_id: int, total: float):
    msg = (
        f"✅ *Payment confirmed!*\n\n"
        f"Hi {client_name}, your order #{order_id} from *{business_name}* "
        f"of R{total:.2f} has been paid successfully.\n\n"
        f"The business will be in touch shortly.\n\n"
        f"Shop Local, Shop Lekker! 🇿🇦\n— Loxion Mart"
    )
    send_whatsapp(client_phone, msg)
