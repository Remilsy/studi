import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadPDF(buffer: Buffer, publicId: string): Promise<string> {
  const dataURI = `data:application/pdf;base64,${buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'raw',
    format:        'pdf',
    public_id:     publicId,
    overwrite:     true,
  })
  return result.secure_url
}

export async function deletePDF(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
}
