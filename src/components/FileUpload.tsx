import { ChangeEvent } from 'react'

interface FileUploadProps {
  label: string
  onChange: (file: File | null) => void
}

export default function FileUpload({ label, onChange }: FileUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] || null)
  }

  return (
    <div className="flex items-center justify-between border p-2 mb-3 rounded">
      <label className="text-gray-700">{label}</label>
      <input type="file" onChange={handleFileChange} className="text-sm" />
    </div>
  )
}
