export async function verifyTelegramToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await response.json()
    return data.ok
  } catch {
    return false
  }
}

export async function setTelegramWebhook(token: string, webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    )
    const data = await response.json()
    return data.ok
  } catch {
    return false
  }
}

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    })
    const data = await response.json()
    return data.ok
  } catch {
    return false
  }
}

export async function getTelegramBotInfo(token: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await response.json()
    if (data.ok) {
      return data.result
    }
    return null
  } catch {
    return null
  }
}
