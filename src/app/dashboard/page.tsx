import dynamic from 'next/dynamic';

const DashboardPage = dynamic(
    () => import('@/components/DashboardPageInner'),
    { ssr: false } // Important: disables server-side rendering
);

export default DashboardPage;
