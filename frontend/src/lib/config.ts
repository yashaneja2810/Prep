/**
 * Application configuration
 */

export const siteConfig = {
  name: "GamutX LMS",
  description: "Learning Management System for VFX and Digital Media",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-image.png",
  links: {
    twitter: "https://twitter.com/GamutX",
    github: "https://github.com/GamutX/lms",
  },
}

export const navConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/",
    },
  ],
}

export const badgeConfig = {
  defaultSize: "md",
  categories: [
    { id: "programming", label: "Programming" },
    { id: "tools", label: "Tools" },
    { id: "design", label: "Design" },
    { id: "project", label: "Projects" },
  ],
}

export const eventConfig = {
  types: [
    { id: "hackathon", label: "Hackathons" },
    { id: "workshop", label: "Workshops" },
    { id: "webinar", label: "Webinars" },
    { id: "competition", label: "Competitions" },
  ],
  statuses: [
    { id: "upcoming", label: "Upcoming" },
    { id: "active", label: "Active" },
    { id: "past", label: "Past" },
  ],
} 