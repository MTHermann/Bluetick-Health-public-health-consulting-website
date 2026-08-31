import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogSurvival: resolve(__dirname, 'blog/survival-analysis-clinical-research/index.html'),
        blogRegression: resolve(__dirname, 'blog/regression-analysis-methods-health-data/index.html'),
        blogTimeSeries: resolve(__dirname, 'blog/time-series-analysis-public-health-monitoring/index.html'),
        blogClinicalTrials: resolve(__dirname, 'blog/clinical-trial-design-and-statistics/index.html'),
        blogHealthEconomics: resolve(__dirname, 'blog/health-economics-cost-effectiveness-analysis/index.html'),
        blogDataManagement: resolve(__dirname, 'blog/data-management-best-practices/index.html'),
        blogEpidemiology: resolve(__dirname, 'blog/epidemiological-study-design/index.html'),
        blogRedcap: resolve(__dirname, 'blog/redcap-implementation-guide/index.html'),
        resources: resolve(__dirname, 'resources/index.html'),
        faq: resolve(__dirname, 'faq/index.html'),
        news: resolve(__dirname, 'news/index.html'),
        vacancies: resolve(__dirname, 'vacancies/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})