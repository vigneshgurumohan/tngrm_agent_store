"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { FileUpload } from '../file-upload'
import { ProfileService } from '../../lib/api/profile.service'
import { ISVProfile, ISVProfileUpdate } from '../../lib/types/profile.types'
import { useToast } from '../../hooks/use-toast'
import { Download, Trash2, Edit, Save, X } from 'lucide-react'

interface ISVProfileComponentProps {
  isvId: string
}

export function ISVProfileComponent({ isvId }: ISVProfileComponentProps) {
  const [profile, setProfile] = useState<ISVProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<ISVProfileUpdate>({
    name: '',
    position: '',
    registered_name: '',
    registered_address: '',
    domain: '',
    contact_number: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [isvId])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ProfileService.fetchISVProfile(isvId)
      setProfile(data)
      setFormData({
        name: data.name || '',
        position: data.position || '',
        registered_name: data.registered_name || '',
        registered_address: data.registered_address || '',
        domain: data.domain || '',
        contact_number: data.contact_number || '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updatedProfile = await ProfileService.updateISVProfile(isvId, formData)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast({
        description: "Profile updated successfully",
      })
    } catch (err: any) {
      toast({
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        position: profile.position || '',
        registered_name: profile.registered_name || '',
        registered_address: profile.registered_address || '',
        domain: profile.domain || '',
        contact_number: profile.contact_number || '',
      })
    }
    setIsEditing(false)
  }

  const handleFileUpload = async (file: File, type: 'mou' | 'logo') => {
    try {
      const filePath = await ProfileService.uploadFile(file, type, isvId)
      // Update profile with new file path
      const updatedProfile = { ...profile!, [`${type}_file_path`]: filePath }
      setProfile(updatedProfile as ISVProfile)
      toast({
        description: `${type.toUpperCase()} uploaded successfully`,
      })
    } catch (err: any) {
      toast({
        description: err.message || `Failed to upload ${type}`,
        variant: "destructive",
      })
    }
  }

  const handleFileDelete = async (type: 'mou' | 'logo') => {
    try {
      // API call to delete file would go here
      const updatedProfile = { ...profile!, [`${type}_file_path`]: undefined }
      setProfile(updatedProfile as ISVProfile)
      toast({
        description: `${type.toUpperCase()} deleted successfully`,
      })
    } catch (err: any) {
      toast({
        description: err.message || `Failed to delete ${type}`,
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'ISV'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProfile}>Try Again</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Home &gt; View Profile</p>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Personal Details</h1>
          <p className="text-gray-600">Account Information for the enterprise users</p>
        </div>
        <Button variant="ghost" size="sm">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="bg-green-100 text-green-800 text-2xl font-bold">
            {getInitials(profile.name || profile.registered_name || 'ISV')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Profile Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            ) : (
              <Input value={profile.name || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position">Position</Label>
            {isEditing ? (
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Position in company"
              />
            ) : (
              <Input value={profile.position || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          {/* Registered Name */}
          <div>
            <Label htmlFor="registered_name">Registered Name</Label>
            {isEditing ? (
              <Input
                id="registered_name"
                value={formData.registered_name}
                onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                placeholder="Registered Name"
              />
            ) : (
              <Input value={profile.registered_name || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          {/* Registered Address */}
          <div>
            <Label htmlFor="registered_address">Registered address</Label>
            {isEditing ? (
              <Textarea
                id="registered_address"
                value={formData.registered_address}
                onChange={(e) => setFormData({ ...formData, registered_address: e.target.value })}
                placeholder="Registered address details"
                rows={3}
              />
            ) : (
              <Textarea value={profile.registered_address || ''} readOnly className="bg-gray-50" rows={3} />
            )}
          </div>

          {/* Domain */}
          <div>
            <Label htmlFor="domain">Domain</Label>
            {isEditing ? (
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="-"
              />
            ) : (
              <Input value={profile.domain || '-'} readOnly className="bg-gray-50" />
            )}
          </div>

          {/* Contact Number */}
          <div>
            <Label htmlFor="contact_number">Contact Number</Label>
            {isEditing ? (
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+91 9876543210"
              />
            ) : (
              <Input value={profile.contact_number || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          {/* MOU Section */}
          <div>
            <Label>MOU</Label>
            <div className="mt-2">
              {profile.mou_file_path ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">PDF</span>
                    </div>
                    <span className="text-sm">mou.pdf</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(ProfileService.getFileDownloadUrl(profile.mou_file_path!), '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDelete('mou')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <FileUpload
                    onFileSelect={(file) => handleFileUpload(file, 'mou')}
                    accept=".pdf"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
              )}
            </div>
          </div>

          {/* Logo Section */}
          <div>
            <Label>Logo</Label>
            <div className="mt-2">
              {profile.logo_file_path ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">IMG</span>
                    </div>
                    <span className="text-sm">logo.png</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(ProfileService.getFileDownloadUrl(profile.logo_file_path!), '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDelete('logo')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <FileUpload
                    onFileSelect={(file) => handleFileUpload(file, 'logo')}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
