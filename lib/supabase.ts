import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a client-side supabase client with auth
export function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export async function uploadImage(file: File, bucket = "item-images"): Promise<string | null> {
  try {
    // Create client with auth context
    const supabaseClient = createClientComponentClient()

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

export async function deleteImage(url: string, bucket = "item-images"): Promise<boolean> {
  try {
    const supabaseClient = createClientComponentClient()
    const fileName = url.split("/").pop()
    if (!fileName) return false

    const { error } = await supabaseClient.storage.from(bucket).remove([fileName])

    return !error
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}
