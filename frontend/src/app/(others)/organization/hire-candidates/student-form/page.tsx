"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Star, 
  Github, 
  Linkedin, 
  Mail, 
  Calendar, 
  Upload,
  FileText,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageContainer } from "@/components/page-container";

// Form validation schema
const studentFormSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    location: z.string().min(2, { message: "Please provide your location." }),
  }),
  education: z.object({
    degree: z.string().min(2, { message: "Please specify your degree." }),
    institution: z.string().min(2, { message: "Please specify your institution." }),
    graduationYear: z.string().regex(/^\d{4}$/, { message: "Please enter a valid year." }),
  }),
  professional: z.object({
    role: z.string().min(2, { message: "Please specify your desired role." }),
    experience: z.string(),
    skills: z.array(z.string()).min(1, { message: "Please select at least one skill." }),
    availability: z.string(),
    workType: z.enum(["remote", "onsite", "hybrid"]),
  }),
  portfolio: z.object({
    github: z.string().optional(),
    linkedin: z.string(),
    portfolio: z.string().optional(),
  }),
  resume: z.any().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function StudentFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      education: {
        degree: "",
        institution: "",
        graduationYear: "",
      },
      professional: {
        role: "",
        experience: "0-1 years",
        skills: [],
        availability: "Immediate",
        workType: "remote",
      },
      portfolio: {
        github: "",
        linkedin: "",
        portfolio: "",
      },
    },
  });
  
  const onSubmit = async (data: StudentFormValues) => {
    setSubmitting(true);
    
    try {
      // Here you would normally upload the resume file and send the form data
      console.log("Form data:", data);
      console.log("Resume file:", resumeFile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  // Skills options
  const skillOptions = [
    "Python", "C++", "JavaScript", "TypeScript", "Maya", "Houdini", 
    "Nuke", "After Effects", "Blender", "3D Modeling", "Texturing", 
    "Rigging", "Animation", "Compositing", "Pipeline Development", 
    "Shader Writing", "Game Development", "Unity", "Unreal Engine",
    "VFX", "Motion Graphics", "Rendering", "Lighting", "Concept Art",
    "Storyboarding", "Character Design", "Environment Design"
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  if (submitted) {
    return (
      <PageContainer>
        <motion.div 
          className="container p-6 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <GlossyHero
            title="Application Submitted"
            subtitle="Thank you for submitting your profile"
          />
          
          <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Success!</CardTitle>
                <CardDescription>
                  Your profile has been successfully submitted for review by recruiters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Thank you for taking the time to submit your profile. Recruiters will now be able to view your information and may contact you if they're interested in your skills and experience.
                </p>
                
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your profile will be reviewed by our team</li>
                    <li>Recruiters can browse your skills and experience</li>
                    <li>You may receive interview offers via email</li>
                    <li>You can update your profile at any time</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setSubmitted(false)}>Update My Profile</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <motion.div 
        className="container p-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <GlossyHero
          title="Student Profile Form"
          subtitle="Add your details and resume to be visible to recruiters"
        />
        
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Personal & Professional Information</CardTitle>
              <CardDescription>
                Fill out the form below to create your profile for recruiters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Your full name"
                        {...form.register("personalInfo.name")}
                      />
                      {form.formState.errors.personalInfo?.name && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.personalInfo.name.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com"
                        {...form.register("personalInfo.email")}
                      />
                      {form.formState.errors.personalInfo?.email && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.personalInfo.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Your phone number"
                        {...form.register("personalInfo.phone")}
                      />
                      {form.formState.errors.personalInfo?.phone && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.personalInfo.phone.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="City, Country"
                        {...form.register("personalInfo.location")}
                      />
                      {form.formState.errors.personalInfo?.location && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.personalInfo.location.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Education */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree/Certificate</Label>
                      <Input 
                        id="degree" 
                        placeholder="B.S. Computer Science, Certificate, etc."
                        {...form.register("education.degree")}
                      />
                      {form.formState.errors.education?.degree && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.education.degree.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input 
                        id="institution" 
                        placeholder="University, Academy, etc."
                        {...form.register("education.institution")}
                      />
                      {form.formState.errors.education?.institution && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.education.institution.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input 
                        id="graduationYear" 
                        placeholder="YYYY"
                        {...form.register("education.graduationYear")}
                      />
                      {form.formState.errors.education?.graduationYear && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.education.graduationYear.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Desired Role</Label>
                      <Input 
                        id="role" 
                        placeholder="e.g. VFX Artist, Technical Director, etc."
                        {...form.register("professional.role")}
                      />
                      {form.formState.errors.professional?.role && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.professional.role.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("professional.experience", value)}
                        defaultValue={form.getValues("professional.experience")}
                      >
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1 years">0-1 years</SelectItem>
                          <SelectItem value="1-3 years">1-3 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="5+ years">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("professional.availability", value)}
                        defaultValue={form.getValues("professional.availability")}
                      >
                        <SelectTrigger id="availability">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediate">Immediate</SelectItem>
                          <SelectItem value="2 weeks">2 weeks</SelectItem>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="3 months">3 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workType">Preferred Work Type</Label>
                      <Select 
                        onValueChange={(value: "remote" | "onsite" | "hybrid") => form.setValue("professional.workType", value)}
                        defaultValue={form.getValues("professional.workType")}
                      >
                        <SelectTrigger id="workType">
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Skills (select multiple)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillOptions.map((skill) => (
                        <Badge 
                          key={skill}
                          variant={form.watch("professional.skills").includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const currentSkills = form.watch("professional.skills");
                            if (currentSkills.includes(skill)) {
                              form.setValue(
                                "professional.skills", 
                                currentSkills.filter(s => s !== skill)
                              );
                            } else {
                              form.setValue(
                                "professional.skills", 
                                [...currentSkills, skill]
                              );
                            }
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {form.formState.errors.professional?.skills && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.professional.skills.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Portfolio Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Portfolio & Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="linkedin" 
                          placeholder="linkedin.com/in/yourprofile"
                          className="pl-10"
                          {...form.register("portfolio.linkedin")}
                        />
                      </div>
                      {form.formState.errors.portfolio?.linkedin && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.portfolio.linkedin.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Profile (optional)</Label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="github" 
                          placeholder="github.com/yourusername"
                          className="pl-10"
                          {...form.register("portfolio.github")}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="portfolio">Portfolio Website (optional)</Label>
                      <Input 
                        id="portfolio" 
                        placeholder="https://your-portfolio-site.com"
                        {...form.register("portfolio.portfolio")}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Resume Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Resume Upload</h3>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your resume in PDF or DOCX format (max 5MB)
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>Select File</span>
                        </div>
                        <input 
                          id="resume-upload" 
                          type="file" 
                          accept=".pdf,.docx" 
                          className="hidden"
                          onChange={handleResumeUpload}
                        />
                      </label>
                      
                      {resumeFile && (
                        <Badge variant="outline" className="ml-2">
                          {resumeFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Submitting..." : "Submit Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
} 