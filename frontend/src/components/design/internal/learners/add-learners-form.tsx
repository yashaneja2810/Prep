"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Mail, 
  Users, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Upload,
  FileText,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAddLearner, useAddLearnersBatch } from "@/hooks/useLearners"
import { toast } from "sonner"
import { API_MESSAGES } from "@/helpers/string_const"

interface EmailValidationResult {
  email: string
  isValid: boolean
  error?: string
}

interface AddLearnersFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const AddLearnersForm: React.FC<AddLearnersFormProps> = ({
  onSuccess,
  onCancel,
  className
}) => {
  // Single email states
  const [singleEmail, setSingleEmail] = useState('')
  const [singleEmailError, setSingleEmailError] = useState('')

  // Bulk email states
  const [bulkEmails, setBulkEmails] = useState('')
  const [validatedEmails, setValidatedEmails] = useState<EmailValidationResult[]>([])
  const [showValidationResults, setShowValidationResults] = useState(false)

  // UI states
  const [activeTab, setActiveTab] = useState('single')
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkResults, setBulkResults] = useState<any>(null)

  // Hooks
  const { addLearner, isLoading: isAddingSingle } = useAddLearner()
  const { addLearnersBatch, isLoading: isAddingBatch } = useAddLearnersBatch()

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Parse and validate bulk emails
  const parseBulkEmails = (text: string): EmailValidationResult[] => {
    const emails = text
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)

    return emails.map(email => ({
      email,
      isValid: validateEmail(email),
      error: !validateEmail(email) ? 'Invalid email format' : undefined
    }))
  }

  // Handle single email submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!singleEmail.trim()) {
      setSingleEmailError('Email is required')
      return
    }

    if (!validateEmail(singleEmail)) {
      setSingleEmailError('Please enter a valid email address')
      return
    }

    setSingleEmailError('')

    try {
      await addLearner(singleEmail.trim())
      setSingleEmail('')
      toast.success(API_MESSAGES.LEARNER_ADDED_SUCCESS)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add learner:', error)
    }
  }

  // Handle bulk email validation
  const handleBulkValidation = () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter at least one email address')
      return
    }

    const results = parseBulkEmails(bulkEmails)
    setValidatedEmails(results)
    setShowValidationResults(true)
  }

  // Handle bulk email submission
  const handleBulkSubmit = async () => {
    const validEmails = validatedEmails
      .filter(result => result.isValid)
      .map(result => result.email)

    if (validEmails.length === 0) {
      toast.error('No valid email addresses found')
      return
    }

    try {
      setBulkProgress(0)
      const response = await addLearnersBatch(validEmails)
      setBulkResults(response)
      setBulkProgress(100)
      
      // Clear form on success
      setBulkEmails('')
      setValidatedEmails([])
      setShowValidationResults(false)
      
      // Only navigate away if ALL learners were added successfully (no failures)
      if (response.failed === 0) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Failed to add learners:', error)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setBulkEmails(content)
    }
    reader.readAsText(file)
  }

  // Remove email from validation results
  const removeEmail = (emailToRemove: string) => {
    setValidatedEmails(prev => 
      prev.filter(result => result.email !== emailToRemove)
    )
  }

  const validEmailsCount = validatedEmails.filter(result => result.isValid).length
  const invalidEmailsCount = validatedEmails.filter(result => !result.isValid).length

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Add New Learners
        </CardTitle>
        <CardDescription>
          Add learners individually or in bulk to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Single Email
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Add
            </TabsTrigger>
          </TabsList>

          {/* Single Email Tab */}
          <TabsContent value="single" className="space-y-4">
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="single-email">Email Address</Label>
                <Input
                  id="single-email"
                  type="email"
                  placeholder="learner@example.com"
                  value={singleEmail}
                  onChange={(e) => {
                    setSingleEmail(e.target.value)
                    setSingleEmailError('')
                  }}
                  className={cn(singleEmailError && "border-red-500")}
                />
                {singleEmailError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {singleEmailError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isAddingSingle}
                  className="flex-1"
                >
                  {isAddingSingle ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Learner...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Learner
                    </>
                  )}
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </TabsContent>

          {/* Bulk Email Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-emails">Email Addresses</Label>
                <Textarea
                  id="bulk-emails"
                  placeholder="Enter email addresses separated by commas, semicolons, or new lines:&#10;&#10;learner1@example.com&#10;learner2@example.com, learner3@example.com&#10;learner4@example.com; learner5@example.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-muted-foreground">
                  Separate multiple emails with commas, semicolons, or new lines
                </p>
              </div>

              {/* File Upload */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <span className="text-sm text-muted-foreground">
                  or upload a .txt/.csv file
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Validation Button */}
              {!showValidationResults ? (
                <Button 
                  type="button" 
                  onClick={handleBulkValidation}
                  disabled={!bulkEmails.trim()}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Validate Emails
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Validation Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {validEmailsCount}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Valid Emails
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {invalidEmailsCount}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        Invalid Emails
                      </div>
                    </div>
                  </div>

                  {/* Validation Results */}
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {validatedEmails.map((result, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg",
                          result.isValid 
                            ? "bg-green-50 dark:bg-green-950" 
                            : "bg-red-50 dark:bg-red-950"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {result.isValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={cn(
                            "text-sm",
                            result.isValid 
                              ? "text-green-700 dark:text-green-300" 
                              : "text-red-700 dark:text-red-300"
                          )}>
                            {result.email}
                          </span>
                          {result.error && (
                            <span className="text-xs text-red-500">
                              ({result.error})
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmail(result.email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkSubmit}
                      disabled={validEmailsCount === 0 || isAddingBatch}
                      className="flex-1"
                    >
                      {isAddingBatch ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding {validEmailsCount} Learners...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Add {validEmailsCount} Learners
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowValidationResults(false)
                        setValidatedEmails([])
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              {/* Bulk Progress */}
              {isAddingBatch && (
                <div className="space-y-2">
                  <Progress value={bulkProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing bulk addition...
                  </p>
                </div>
              )}

              {/* Bulk Results */}
              {bulkResults && (
                <div className="space-y-4">
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Successfully added {bulkResults.successful}/{bulkResults.totalRequested} learners.
                      {bulkResults.failed > 0 && ` ${bulkResults.failed} failed.`}
                    </AlertDescription>
                  </Alert>

                  {/* Failed Users List */}
                  {bulkResults.failed > 0 && bulkResults.results && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-destructive">
                        Failed to Add ({bulkResults.failed})
                      </h4>
                      <div className="space-y-2">
                        {bulkResults.results
                          .filter((result: any) => !result.success)
                          .map((failedResult: any, index: number) => (
                            <Alert key={index} variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-1">
                                  <div className="font-medium">{failedResult.email}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {failedResult.error || failedResult.message}
                                  </div>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Button */}
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export { AddLearnersForm } 