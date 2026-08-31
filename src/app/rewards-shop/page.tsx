import React from 'react';
import { Metadata } from 'next';
import RewardsShopClient from '@/components/gamification/RewardsShopClient';

export const metadata: Metadata = {
  title: 'سوق الجوائز والأوسمة | معادلة برو',
  description: 'استبدل نقاط خبرتك بإطارات حساب حصرية وألقاب شرفية مميزة.',
};

export const dynamic = 'force-dynamic';

export default function RewardsShopPage() {
  return <RewardsShopClient />;
}
