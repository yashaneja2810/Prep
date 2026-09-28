"use client"

import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Calendar, MapPin, Globe, Building } from "lucide-react";
import { useEffect } from "react";

export default function ProfileClient() {
  const user = useUserStore((state) => state.profile);

  useEffect(() => {
    console.log('🟢 [ProfilePage] User profile state:', {
      user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      activeRoles: user?.activeRoles,
      roleProfilesKeys: user?.roleProfiles ? Object.keys(user.roleProfiles) : [],
      trainerProfile: user?.roleProfiles?.trainer,
      learnerProfile: user?.roleProfiles?.learner,
      adminProfile: user?.roleProfiles?.admin,
      stats: user?.stats,
      activeOrganization: user?.activeOrganization
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.roleProfiles?.trainer?.profile_image || "/placeholder.svg"} alt="User" />
                <AvatarFallback className="text-2xl">
                  {user.first_name && user.last_name
                    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                    : user.email ? user.email[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.preferred_name || user.email}
                </h1>
                <div className="flex gap-2 mt-2">
                  {user.activeRoles?.map((role, index) => (
                    <Badge key={index} variant="outline" className="text-xs uppercase">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(user.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.timezone}</span>
              </div>
            </div>
            {user.preferred_name && user.preferred_name !== user.first_name && (
              <div>
                <p className="text-sm font-medium">Preferred Name:</p>
                <p className="text-sm text-muted-foreground">{user.preferred_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Information */}
        {user.activeOrganization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{user.activeOrganization.org_name}</p>
                  <p className="text-sm text-muted-foreground">{user.activeOrganization.code}</p>
                </div>
                {user.activeOrganization.type && (
                  <Badge variant="secondary" className="text-xs">
                    {user.activeOrganization.type}
                  </Badge>
                )}
                {user.activeOrganization.description && (
                  <p className="text-sm text-muted-foreground">{user.activeOrganization.description}</p>
                )}
                {user.activeOrganization.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.activeOrganization.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {user.activeOrganization.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-specific Information */}
        {user.roleProfiles && (
          <div className="space-y-4">
            {/* Learner Profile */}
            {user.roleProfiles.learner && (
              <Card>
                <CardHeader>
                  <CardTitle>Learner Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Learner Type:</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.roleProfiles.learner.learner_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tasks Completed:</p>
                      <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.tasks_completed}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Streak Days:</p>
                      <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.streak_days}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Enrollment Date:</p>
                      <p className="text-sm text-muted-foreground">{new Date(user.roleProfiles.learner.enrollment_date).toLocaleDateString()}</p>
                    </div>
                    {user.roleProfiles.learner.rank && (
                      <div>
                        <p className="text-sm font-medium">Rank:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.rank}</p>
                      </div>
                    )}
                    {user.roleProfiles.learner.last_activity_date && (
                      <div>
                        <p className="text-sm font-medium">Last Activity:</p>
                        <p className="text-sm text-muted-foreground">{new Date(user.roleProfiles.learner.last_activity_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Student-specific details */}
                  {user.roleProfiles.learner.learner_student_details && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Student Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.roleProfiles.learner.learner_student_details.college_name && (
                          <div>
                            <p className="text-sm font-medium">College Name:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_student_details.college_name}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_student_details.degree_course && (
                          <div>
                            <p className="text-sm font-medium">Degree Course:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_student_details.degree_course}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_student_details.expected_grad_year && (
                          <div>
                            <p className="text-sm font-medium">Expected Graduation Year:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_student_details.expected_grad_year}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_student_details.current_gpa && (
                          <div>
                            <p className="text-sm font-medium">Current GPA:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_student_details.current_gpa}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_student_details.interest && (
                          <div>
                            <p className="text-sm font-medium">Interests:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_student_details.interest}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Professional-specific details */}
                  {user.roleProfiles.learner.learner_professional_details && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Professional Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.roleProfiles.learner.learner_professional_details.company_name && (
                          <div>
                            <p className="text-sm font-medium">Company Name:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_professional_details.company_name}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_professional_details.job_title && (
                          <div>
                            <p className="text-sm font-medium">Job Title:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_professional_details.job_title}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_professional_details.years_experience && (
                          <div>
                            <p className="text-sm font-medium">Years of Experience:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_professional_details.years_experience}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_professional_details.pipeline_dev_exp && (
                          <div>
                            <p className="text-sm font-medium">Pipeline Development Experience:</p>
                            <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.learner_professional_details.pipeline_dev_exp}</p>
                          </div>
                        )}
                        {user.roleProfiles.learner.learner_professional_details.portfolio_url && (
                          <div>
                            <p className="text-sm font-medium">Portfolio:</p>
                            <a 
                              href={user.roleProfiles.learner.learner_professional_details.portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {user.roleProfiles.learner.learner_professional_details.portfolio_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Programs and Cohorts */}
                  {user.roleProfiles.learner.programs && user.roleProfiles.learner.programs.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Enrolled Programs</h4>
                      <div className="space-y-2">
                        {user.roleProfiles.learner.programs.map((program: any, index: number) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {program.name || `Program ${index + 1}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {user.roleProfiles.learner.cohorts && user.roleProfiles.learner.cohorts.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Cohorts</h4>
                      <div className="space-y-2">
                        {user.roleProfiles.learner.cohorts.map((cohort: any, index: number) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {cohort.name || `Cohort ${index + 1}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {user.roleProfiles.learner.goals_text && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Goals:</p>
                      <p className="text-sm text-muted-foreground">{user.roleProfiles.learner.goals_text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trainer Profile */}
            {user.roleProfiles.trainer && (
              <Card>
                <CardHeader>
                  <CardTitle>Trainer Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.roleProfiles.trainer.total_years_teaching && (
                      <div>
                        <p className="text-sm font-medium">Years of Teaching:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.trainer.total_years_teaching} years</p>
                      </div>
                    )}
                    {user.roleProfiles.trainer.bio && (
                      <div>
                        <p className="text-sm font-medium">Bio:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.trainer.bio}</p>
                      </div>
                    )}
                    {user.roleProfiles.trainer.expertise && (
                      <div>
                        <p className="text-sm font-medium">Expertise:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.trainer.expertise}</p>
                      </div>
                    )}
                    {user.roleProfiles.trainer.linkedin_url && (
                      <div>
                        <p className="text-sm font-medium">LinkedIn:</p>
                        <a 
                          href={user.roleProfiles.trainer.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {user.roleProfiles.trainer.linkedin_url}
                        </a>
                      </div>
                    )}
                    {user.roleProfiles.trainer.website && (
                      <div>
                        <p className="text-sm font-medium">Website:</p>
                        <a 
                          href={user.roleProfiles.trainer.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {user.roleProfiles.trainer.website}
                        </a>
                      </div>
                    )}
                    
                    {/* Social Links */}
                    {user.roleProfiles.trainer.social_links && (
                      <div>
                        <p className="text-sm font-medium">Social Links:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(user.roleProfiles.trainer.social_links).map(([platform, url]) => (
                            <a 
                              key={platform}
                              href={url as string}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {platform}: {url as string}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Trainer Specialities */}
                    {user.roleProfiles.trainer.trainer_specialities && user.roleProfiles.trainer.trainer_specialities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Specialities:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.roleProfiles.trainer.trainer_specialities.map((speciality: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {speciality.name || speciality.title || `Speciality ${index + 1}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Cohorts */}
                    {user.roleProfiles.trainer.cohorts && user.roleProfiles.trainer.cohorts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Teaching Cohorts:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.roleProfiles.trainer.cohorts.map((cohort: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {cohort.name || `Cohort ${index + 1}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recent Sessions */}
                    {user.roleProfiles.trainer.recentSessions && user.roleProfiles.trainer.recentSessions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recent Sessions:</p>
                        <div className="space-y-2">
                          {user.roleProfiles.trainer.recentSessions.slice(0, 3).map((session: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <p className="text-sm font-medium">{session.title || `Session ${index + 1}`}</p>
                              {session.date && (
                                <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Profile */}
            {user.roleProfiles.admin && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Admin Level:</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.roleProfiles.admin.admin_level}</p>
                    </div>
                    {user.roleProfiles.admin.phone_ext && (
                      <div>
                        <p className="text-sm font-medium">Phone Extension:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.admin.phone_ext}</p>
                      </div>
                    )}
                    {user.roleProfiles.admin.notes && (
                      <div>
                        <p className="text-sm font-medium">Notes:</p>
                        <p className="text-sm text-muted-foreground">{user.roleProfiles.admin.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats */}
        {user.stats && (
          <Card>
            <CardHeader>
              <CardTitle>Stats & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.stats.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                
                {/* Learner-specific stats */}
                {user.roleProfiles.learner && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{user.roleProfiles.learner.tasks_completed}</p>
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{user.roleProfiles.learner.streak_days}</p>
                      <p className="text-sm text-muted-foreground">Streak Days</p>
                    </div>
                    {user.roleProfiles.learner.rank && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">#{user.roleProfiles.learner.rank}</p>
                        <p className="text-sm text-muted-foreground">Rank</p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Trainer-specific stats */}
                {user.roleProfiles.trainer && (
                  <>
                    {user.roleProfiles.trainer.total_years_teaching && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{user.roleProfiles.trainer.total_years_teaching}</p>
                        <p className="text-sm text-muted-foreground">Years Teaching</p>
                      </div>
                    )}
                    {user.roleProfiles.trainer.cohorts && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{user.roleProfiles.trainer.cohorts.length}</p>
                        <p className="text-sm text-muted-foreground">Active Cohorts</p>
                      </div>
                    )}
                    {user.roleProfiles.trainer.recentSessions && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{user.roleProfiles.trainer.recentSessions.length}</p>
                        <p className="text-sm text-muted-foreground">Recent Sessions</p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Account-level stats */}
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.activeRoles.length}</p>
                  <p className="text-sm text-muted-foreground">Active Roles</p>
                </div>
                
                {/* Add more stats as needed */}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Account Status:</p>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Email Verified:</p>
                <Badge variant={user.email_verified ? "default" : "destructive"}>
                  {user.email_verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since:</p>
                <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated:</p>
                <p className="text-sm text-muted-foreground">{new Date(user.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
