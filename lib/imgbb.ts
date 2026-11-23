type ImgBBApiResponse = {
  success?: boolean
  data?: { display_url?: string; url?: string }
  error?: { message?: string }
}

/**
 * Uploads a File to ImgBB and returns a public image URL.
 * Reused by the profile page and the tutor post-tuition flow.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!apiKey) {
    throw new Error(
      "Image upload is unavailable right now. You can add an image URL instead."
    )
  }

  const formData = new FormData()
  formData.append("image", file)

  let response: Response
  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: formData }
    )
  } catch {
    throw new Error("Could not upload your image. Please try again.")
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ImgBBApiResponse | null
  if (!response.ok || !payload?.success) {
    throw new Error(
      "We couldn't upload your image. Please try again or add an image URL."
    )
  }

  const url = payload.data?.display_url || payload.data?.url
  if (!url) {
    throw new Error(
      "Upload finished, but we couldn't get your image link. Please try again."
    )
  }

  return url
}
