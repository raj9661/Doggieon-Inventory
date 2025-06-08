import dynamic from 'next/dynamic'

// Dynamic import for Carousel component
export const DynamicCarousel = dynamic(() => import('./ui/carousel').then(mod => mod.Carousel), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />
})

// Dynamic import for Chart components
export const DynamicChart = dynamic(() => import('./ui/chart').then(mod => mod.ChartContainer), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />
})

// Dynamic import for TopDonorsChart
export const DynamicTopDonorsChart = dynamic(() => import('@/frontend/src/components/dashboard/TopDonorsChart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />
})

// Dynamic import for DashboardStats
export const DynamicDashboardStats = dynamic(() => import('./dashboard/DashboardStats'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-32 rounded-lg" />
}) 