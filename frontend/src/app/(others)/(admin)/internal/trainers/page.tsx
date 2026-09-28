import { Metadata } from "next";
import TrainersClient from "@/components/design/internal/trainers/trainers";

export const metadata: Metadata = {
  title: "Instructors | GamutX LMS",
  description: "View and manage all faculty information in the learning management system.",
};

export default function InstructorsPage() {
  return <TrainersClient />;
} 