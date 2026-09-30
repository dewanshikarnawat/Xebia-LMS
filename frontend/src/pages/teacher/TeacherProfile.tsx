import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, User, BookOpen, Camera, GraduationCap } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { getInitials, formatDate } from '../../utils/helpers';
import type { Teacher } from '../../types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  subject: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const TeacherProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const teacher = user as Teacher;
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    defaultValues: { name: teacher?.name, subject: teacher?.subject || '' },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.subject) formData.append('subject', data.subject);
      const res = await teacherService.updateProfile(formData);
      updateUser(res.user);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout role="teacher" title="My Profile" subtitle="Manage your account information">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Avatar Card */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4A1F4F] to-[#622865] flex items-center justify-center text-white text-2xl font-bold">
                {teacher?.avatar ? (
                  <img src={teacher.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  getInitials(teacher?.name || '')
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{teacher?.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{teacher?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5EAF8]0/10 text-[#4A1F4F] dark:text-purple-300 text-xs font-medium">
                  <GraduationCap size={12} />
                  Teacher
                </span>
                {teacher?.subject && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] text-xs font-medium">
                    <BookOpen size={12} />
                    {teacher.subject}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
            Edit Information
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              value={teacher?.email}
              disabled
              leftIcon={<Mail size={16} />}
              hint="Email cannot be changed"
            />
            <Input
              label="Subject"
              placeholder="e.g. Mathematics, Physics"
              leftIcon={<BookOpen size={16} />}
              {...register('subject')}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={saving} disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Info */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
            Account Information
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Account Type', value: 'Teacher' },
              { label: 'Member Since', value: teacher?.createdAt ? formatDate(teacher.createdAt) : '—' },
              { label: 'Status', value: 'Active' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-[var(--brand-border)] last:border-0">
                <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};
