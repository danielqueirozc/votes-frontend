import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"

interface FileUploadProps {
  onFileUploaded: (url: string) => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      const previewUrl = URL.createObjectURL(uploadedFile)
      
      setFile(uploadedFile)
      setPreview(previewUrl)
      setError(null)
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", uploadedFile)

        console.log("📤 Enviando arquivo:", uploadedFile.name)
        
        const response = await axios.post("http://localhost:4000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        console.log("✅ Resposta do servidor:", response.data)
        
        const uploadedUrl = response.data.url
        onFileUploaded(uploadedUrl)
        
      } catch (err: any) {
        console.error("❌ Erro no upload:", err)
        
        const errorMessage = err.response?.data?.message || "Erro no upload da imagem"
        setError(errorMessage)
        
        // Limpa o preview se houver erro
        setPreview(null)
        setFile(null)
      } finally {
        setIsUploading(false)
      }
    }
  }, [onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp", ".gif"],
    },
    maxFiles: 1,
    disabled: isUploading
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p>Enviando imagem...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Solte a imagem aqui...</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img className="w-20 h-20" src="/picture-dialog.svg" alt="" />
            <p>Arraste aqui a imagem do participante ou clique para selecionar</p>
          </div>
        )}

        {preview && !isUploading && (
          <div className="mt-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-40 rounded shadow-md" 
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {file && !isUploading && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <p className="text-sm">✅ Imagem enviada com sucesso: {file.name}</p>
        </div>
      )}
    </div>
  )
}