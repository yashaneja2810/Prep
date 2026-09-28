"use client"

import * as React from "react"
import { X, Plus, Globe, Linkedin, Github, Twitter, Facebook, Instagram, Youtube, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { validateSocialLink } from "@/helpers/validation/trainer-profile"
import { SOCIAL_PLATFORMS } from "@/helpers/string_const"

// Social platform configuration
const PLATFORM_CONFIG = {
  website: { icon: Globe, label: "Website", placeholder: "https://example.com" },
  linkedin: { icon: Linkedin, label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  github: { icon: Github, label: "GitHub", placeholder: "https://github.com/username" },
  twitter: { icon: Twitter, label: "Twitter", placeholder: "https://twitter.com/username" },
  facebook: { icon: Facebook, label: "Facebook", placeholder: "https://facebook.com/username" },
  instagram: { icon: Instagram, label: "Instagram", placeholder: "https://instagram.com/username" },
  youtube: { icon: Youtube, label: "YouTube", placeholder: "https://youtube.com/channel/..." },
  other: { icon: ExternalLink, label: "Other", placeholder: "https://example.com" }
} as const

export interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksInputProps {
  value?: Record<string, string>
  onChange?: (socialLinks: Record<string, string>) => void
  error?: string
  disabled?: boolean
  className?: string
}

export const SocialLinksInput = React.forwardRef<
  HTMLDivElement,
  SocialLinksInputProps
>(({ value = {}, onChange, error, disabled = false, className }, ref) => {
  // Convert object to array for easier manipulation
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(() => {
    return Object.entries(value).map(([platform, url]) => ({ platform, url }))
  })

  // Track validation errors for each link
  const [linkErrors, setLinkErrors] = React.useState<Record<number, string>>({})

  // Update parent when socialLinks change
  React.useEffect(() => {
    const socialLinksObject = socialLinks.reduce((acc, link) => {
      if (link.platform && link.url.trim()) {
        acc[link.platform] = link.url.trim()
      }
      return acc
    }, {} as Record<string, string>)
    onChange?.(socialLinksObject)
  }, [socialLinks, onChange])

  // Add a new social link
  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { platform: "", url: "" }])
  }

  // Remove a social link
  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index))
    setLinkErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      // Reindex remaining errors
      const reindexedErrors: Record<number, string> = {}
      Object.entries(newErrors).forEach(([key, value]) => {
        const oldIndex = parseInt(key)
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex
        reindexedErrors[newIndex] = value
      })
      return reindexedErrors
    })
  }

  // Update a social link
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))

    // Validate URL if it's being updated
    if (field === 'url' && value.trim()) {
      const link = socialLinks[index]
      const validation = validateSocialLink(link.platform, value)
      setLinkErrors(prev => ({
        ...prev,
        [index]: validation.isValid ? "" : validation.error || "Invalid URL"
      }))
    } else if (field === 'url' && !value.trim()) {
      // Clear error if URL is empty
      setLinkErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  // Get available platforms (exclude already selected ones)
  const getAvailablePlatforms = (currentIndex: number) => {
    const selectedPlatforms = socialLinks
      .map((link, index) => index !== currentIndex ? link.platform : null)
      .filter(Boolean)
    
    return Object.keys(PLATFORM_CONFIG).filter(platform => 
      !selectedPlatforms.includes(platform)
    )
  }

  // Render platform icon
  const renderPlatformIcon = (platform: string) => {
    const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
    if (!config) return <ExternalLink className="h-4 w-4" />
    
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Social Links</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSocialLink}
          disabled={disabled || socialLinks.length >= 8}
          className="h-8 px-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Link
        </Button>
      </div>

      <div className="space-y-3">
        {socialLinks.map((link, index) => {
          const availablePlatforms = getAvailablePlatforms(index)
          const platformConfig = PLATFORM_CONFIG[link.platform as keyof typeof PLATFORM_CONFIG]
          const hasError = linkErrors[index]

          return (
            <div key={index} className="flex items-start gap-2">
              {/* Platform Selection */}
              <div className="flex-shrink-0 w-32">
                <Select
                  value={link.platform}
                  onValueChange={(value) => updateSocialLink(index, 'platform', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className={cn(
                    "h-9",
                    hasError && "border-destructive"
                  )}>
                    <div className="flex items-center gap-2">
                      {link.platform && renderPlatformIcon(link.platform)}
                      <SelectValue placeholder="Platform" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platform) => {
                      const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
                      return (
                        <SelectItem key={platform} value={platform}>
                          <div className="flex items-center gap-2">
                            {renderPlatformIcon(platform)}
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* URL Input */}
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder={platformConfig?.placeholder || "https://example.com"}
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  disabled={disabled || !link.platform}
                  className={cn(
                    "h-9",
                    hasError && "border-destructive"
                  )}
                />
                {hasError && (
                  <p className="text-xs text-destructive mt-1">{hasError}</p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialLink(index)}
                disabled={disabled}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove social link</span>
              </Button>
            </div>
          )
        })}

        {socialLinks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No social links added yet</p>
            <p className="text-xs">Click "Add Link" to get started</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {socialLinks.length >= 8 && (
        <p className="text-xs text-muted-foreground">
          Maximum of 8 social links allowed
        </p>
      )}
    </div>
  )
})

SocialLinksInput.displayName = "SocialLinksInput" 