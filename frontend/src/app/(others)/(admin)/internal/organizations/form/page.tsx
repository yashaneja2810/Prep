import { redirect } from 'next/navigation';
import { ROUTES } from '@/helpers/string_const';

export default function FormIndexPage() {
  redirect(ROUTES.ORGANIZATIONS);
} 