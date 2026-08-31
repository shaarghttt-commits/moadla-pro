import GroupsListPageClient from '@/components/groups/GroupsListPageClient';

export const metadata = {
  title: 'المجموعات والمجتمعات الطلابية | Moadla Pro',
  description: 'انضم إلى مجموعات ومجتمعات طلاب معادلة الهندسة والتجارة للمذاكرة ومشاركة الملخصات.',
};

export default function GroupsPage() {
  return <GroupsListPageClient />;
}
