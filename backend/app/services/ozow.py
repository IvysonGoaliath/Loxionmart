import hashlib
import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

OZOW_API_URL = "https://api.ozow.com" if not settings.OZOW_IS_TEST else "https://testapi.ozow.com"

def generate_hash(data: dict) -> str:
    """Generate Ozow hash for payment request."""
    hash_string = (
        f"{settings.OZOW_SITE_CODE}"
        f"{data.get('countryCode', 'ZA')}"
        f"{data.get('currencyCode', 'ZAR')}"
        f"{data.get('amount', '')}"
        f"{data.get('transactionReference', '')}"
        f"{data.get('bankReference', '')}"
        f"{str(data.get('isTest', settings.OZOW_IS_TEST)).lower()}"
        f"{settings.OZOW_PRIVATE_KEY}"
    )
    return hashlib.sha512(hash_string.encode()).hexdigest().lower()

async def create_payment(order_id: int, amount: float, client_email: str, description: str) -> dict:
    """Create an Ozow payment link."""
    if not settings.OZOW_SITE_CODE:
        # Return mock URL for development
        return {
            "paymentUrl": f"https://testpay.ozow.com/mock?order={order_id}&amount={amount}",
            "transactionId": f"TEST_{order_id}"
        }

    transaction_ref = f"LXMRT-{order_id}"
    data = {
        "SiteCode": settings.OZOW_SITE_CODE,
        "CountryCode": "ZA",
        "CurrencyCode": "ZAR",
        "Amount": f"{amount:.2f}",
        "TransactionReference": transaction_ref,
        "BankReference": f"Order #{order_id}",
        "IsTest": settings.OZOW_IS_TEST,
        "SuccessUrl": f"{settings.public_frontend_url}/order/{order_id}/success",
        "ErrorUrl": f"{settings.public_frontend_url}/order/{order_id}/failed",
        "CancelUrl": f"{settings.public_frontend_url}/order/{order_id}/cancelled",
        "NotifyUrl": f"{settings.public_api_url}/api/orders/ozow/notify",
        "Customer": client_email,
        "Optional1": str(order_id),
    }
    data["HashCheck"] = generate_hash({
        "countryCode": "ZA",
        "currencyCode": "ZAR",
        "amount": data["Amount"],
        "transactionReference": transaction_ref,
        "bankReference": data["BankReference"],
        "isTest": settings.OZOW_IS_TEST,
    })

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{OZOW_API_URL}/PostPaymentRequest",
                json=data,
                headers={"ApiKey": settings.OZOW_API_KEY}
            )
            result = resp.json()
            return {"paymentUrl": result.get("url", ""), "transactionId": result.get("transactionId", "")}
    except Exception as e:
        logger.error(f"Ozow payment creation failed: {e}")
        raise

def verify_ozow_notification(data: dict) -> bool:
    """Verify Ozow payment notification authenticity."""
    expected = generate_hash({
        "countryCode": data.get("CountryCode", "ZA"),
        "currencyCode": data.get("CurrencyCode", "ZAR"),
        "amount": data.get("Amount", ""),
        "transactionReference": data.get("TransactionReference", ""),
        "bankReference": data.get("BankReference", ""),
        "isTest": data.get("IsTest", "false").lower() == "true",
    })
    return expected == data.get("Hash", "").lower()
