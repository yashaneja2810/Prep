"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Briefcase,
  MapPin,
  GraduationCap,
  Star,
  Github,
  Linkedin,
  Mail,
  Calendar,
  Filter,
  FileText,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContainer } from "@/components/page-container";

// Sample candidate data
interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  experience: string;
  education: string;
  rating: number;
  skills: string[];
  status: "new" | "interviewing" | "offered" | "hired" | "rejected";
  availability: string;
  performanceMetrics: {
    coursesCompleted: number;
    totalCourses: number;
    avgScore: number;
    projectsCompleted: number;
    strongestSkills: string[];
  };
  documents: {
    cv: string;
    resume: string;
    portfolio: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    github: string;
    linkedin: string;
  };
  academyBatch: string;
  preferredWorkType: "remote" | "onsite" | "hybrid";
}

const candidates: Candidate[] = [
  {
    id: "c1",
    name: "Alex Johnson",
    avatar: "/placeholder-user.jpg",
    role: "VFX Software Developer",
    location: "Los Angeles, CA",
    experience: "3 years",
    education: "B.S. Computer Science",
    rating: 4.8,
    skills: ["Python", "Maya API", "C++", "Qt", "Version Control", "Pipeline Development"],
    status: "new",
    availability: "Immediate",
    performanceMetrics: {
      coursesCompleted: 12,
      totalCourses: 15,
      avgScore: 92,
      projectsCompleted: 5,
      strongestSkills: ["Python", "Maya API"]
    },
    documents: {
      cv: "/documents/alex_johnson_cv.pdf",
      resume: "/documents/alex_johnson_resume.pdf",
      portfolio: "https://portfolio.alexjohnson.com"
    },
    contactInfo: {
      email: "alex.j@example.com",
      phone: "+1 (555) 123-4567",
      github: "github.com/alexjohnson",
      linkedin: "linkedin.com/in/alexjohnson"
    },
    academyBatch: "VFX Developer Cohort 2023-Q1",
    preferredWorkType: "hybrid"
  },
  {
    id: "c2",
    name: "Sarah Chen",
    avatar: "/placeholder-user.jpg",
    role: "Pipeline TD",
    location: "Vancouver, BC",
    experience: "5 years",
    education: "M.S. Computer Graphics",
    rating: 4.9,
    skills: ["Python", "Nuke API", "Houdini", "Shotgun", "USD", "Git"],
    status: "interviewing",
    availability: "2 weeks",
    performanceMetrics: {
      coursesCompleted: 15,
      totalCourses: 15,
      avgScore: 97,
      projectsCompleted: 7,
      strongestSkills: ["Python", "Nuke API", "Pipeline Architecture"]
    },
    documents: {
      cv: "/documents/sarah_chen_cv.pdf",
      resume: "/documents/sarah_chen_resume.pdf",
      portfolio: "https://sarahchen.design"
    },
    contactInfo: {
      email: "sarah.c@example.com",
      phone: "+1 (555) 234-5678",
      github: "github.com/sarahchen",
      linkedin: "linkedin.com/in/sarahchen"
    },
    academyBatch: "Pipeline TD Cohort 2022-Q4",
    preferredWorkType: "onsite"
  },
  {
    id: "c3",
    name: "Michael Patel",
    avatar: "/placeholder-user.jpg",
    role: "Technical Artist",
    location: "Toronto, ON",
    experience: "2 years",
    education: "B.A. Digital Media",
    rating: 4.5,
    skills: ["Maya", "Python", "MEL", "Substance Designer", "Unreal Engine", "Rigging"],
    status: "offered",
    availability: "1 month",
    performanceMetrics: {
      coursesCompleted: 11,
      totalCourses: 12,
      avgScore: 89,
      projectsCompleted: 4,
      strongestSkills: ["Maya", "Rigging", "Scripting"]
    },
    documents: {
      cv: "/documents/michael_patel_cv.pdf",
      resume: "/documents/michael_patel_resume.pdf",
      portfolio: "https://michaelpatel.art"
    },
    contactInfo: {
      email: "michael.p@example.com",
      phone: "+1 (555) 345-6789",
      github: "github.com/michaelpatel",
      linkedin: "linkedin.com/in/michaelpatel"
    },
    academyBatch: "Technical Art Cohort 2023-Q2",
    preferredWorkType: "remote"
  },
  {
    id: "c4",
    name: "Emma Rodriguez",
    avatar: "/placeholder-user.jpg",
    role: "Shader Developer",
    location: "Montreal, QC",
    experience: "4 years",
    education: "B.S. Computer Science",
    rating: 4.7,
    skills: ["GLSL", "OSL", "C++", "Python", "Maya", "Renderman"],
    status: "hired",
    availability: "3 months notice",
    performanceMetrics: {
      coursesCompleted: 14,
      totalCourses: 15,
      avgScore: 94,
      projectsCompleted: 6,
      strongestSkills: ["OSL", "Renderman", "Shader Development"]
    },
    documents: {
      cv: "/documents/emma_rodriguez_cv.pdf",
      resume: "/documents/emma_rodriguez_resume.pdf",
      portfolio: "https://emmalookdev.com"
    },
    contactInfo: {
      email: "emma.r@example.com",
      phone: "+1 (555) 456-7890",
      github: "github.com/emmarodriguez",
      linkedin: "linkedin.com/in/emmarodriguez"
    },
    academyBatch: "Look Development Cohort 2022-Q3",
    preferredWorkType: "hybrid"
  }
];

export default function HireCandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedWorkType, setSelectedWorkType] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
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
  
  // Get unique values for filter dropdowns
  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills))).sort();
  const allBatches = Array.from(new Set(candidates.map(c => c.academyBatch))).sort();
  
  // Filter candidates based on all criteria
  const filteredCandidates = candidates.filter(candidate => {
    // Since we removed filters, just return all candidates
    return true;
  });
  
  // Email contact handler
  const handleContactCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEmailSubject(`Interview Opportunity with GamutX Academy`);
    setEmailBody(`Dear ${candidate.name},

I hope this email finds you well. We've reviewed your profile and are impressed with your skills and experience in ${candidate.skills.slice(0, 3).join(", ")}.

We would like to discuss a potential opportunity with you. Are you available for a virtual interview in the coming week?

Please let me know your availability, and I will arrange a meeting accordingly.

Best regards,
[Your Name]
GamutX Academy Recruitment Team`);
    setEmailDialogOpen(true);
  };
  
  const sendEmail = () => {
    if (selectedCandidate) {
      const mailtoLink = `mailto:${selectedCandidate.contactInfo.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, '_blank');
      setEmailDialogOpen(false);
    }
  };
  
  return (
    <PageContainer>
      <motion.div 
        className="container p-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Glossy Hero Section */}
        <GlossyHero
          title="Hire Candidates"
          subtitle="Students upload their resumes and details for recruiters to review"
        >
        </GlossyHero>
        
        {/* Apply as Student button - floating action button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button asChild className="rounded-full px-6 py-6 shadow-lg bg-primary hover:bg-primary/90 transition-colors">
            <a href="/organization/hire-candidates/student-form" className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Apply as Student</span>
            </a>
          </Button>
        </div>
        
        {/* Tabs for different stages */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Candidates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </div>
              </CardContent>
            </Card>
            
            {/* Candidate Cards */}
            <div className="grid grid-cols-1 gap-4">
              {filteredCandidates.map((candidate) => (
                <motion.div 
                  key={candidate.id}
                  variants={itemVariants}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Left column with candidate info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border">
                              <AvatarImage src={candidate.avatar} alt={candidate.name} />
                              <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <h3 className="text-lg font-bold">{candidate.name}</h3>
                              </div>
                              
                              <div className="text-muted-foreground flex items-center gap-1 mb-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span className="text-sm">{candidate.role} • {candidate.experience}</span>
                              </div>
                              
                              <div className="text-muted-foreground flex items-center gap-1 mb-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-sm">{candidate.location}</span>
                              </div>
                              
                              <div className="text-muted-foreground flex items-center gap-1">
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span className="text-sm">{candidate.education}</span>
                              </div>
                              
                              <div className="flex items-center gap-1 mt-3">
                                {Array.from({ length: Math.floor(candidate.rating) }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-sm font-medium ml-1">{candidate.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                              <Github className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                              <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Right column with actions */}
                        <div className="w-full sm:w-52 bg-muted/30 p-6 flex flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l">
                          <Button className="w-full bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>View Full Profile</span>
                          </Button>
                          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 transition-colors" onClick={() => handleContactCandidate(candidate)}>
                            <Mail className="h-4 w-4" />
                            <span>Contact Candidate</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Contact Candidate</DialogTitle>
              <DialogDescription>
                Compose an email to {selectedCandidate?.name}. This will open in your default email client when you click Send.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium min-w-[80px]">To:</span>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 flex-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCandidate?.contactInfo.email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="emailSubject" className="text-sm font-medium min-w-[80px]">Subject:</Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailBody" className="text-sm font-medium">Message:</Label>
                <Textarea
                  id="emailBody"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={sendEmail} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </PageContainer>
  );
} 