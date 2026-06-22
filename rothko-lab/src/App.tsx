import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Gallery } from '@/pages/Gallery'
import { PaintingDetail } from '@/pages/PaintingDetail'
import { EmotionMap } from '@/pages/EmotionMap'
import { PriceExplorer } from '@/pages/PriceExplorer'
import { DesignStudio } from '@/pages/DesignStudio'
import { Methodology } from '@/pages/Methodology'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Gallery />} />
        <Route path="work/:id" element={<PaintingDetail />} />
        <Route path="emotion" element={<EmotionMap />} />
        <Route path="prices" element={<PriceExplorer />} />
        <Route path="studio" element={<DesignStudio />} />
        <Route path="methodology" element={<Methodology />} />
      </Route>
    </Routes>
  )
}
