import { useState, useRef } from 'react'
import { AsteroidCanvas } from './components/AsteroidCanvas'
import { ColorPicker } from './components/ColorPicker'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import { Slider } from './components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Checkbox } from './components/ui/checkbox'
import { Download, Play, Square, Shuffle, RotateCcw } from 'lucide-react'

function App() {
  const [config, setConfig] = useState({
    curveType: 'astroid',
    sharpness: 4,
    size: 200,
    randomness: 0,
    fillColor: '#0090FF',
    strokeColor: '#3E63DD',
    strokeWidth: 3,
    displayMode: 'both',
    showCenter: false,
    animSpeed: 50,
    cornerRoundness: 0
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const generatorRef = useRef(null)

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleAnimate = () => {
    if (generatorRef.current) {
      setIsAnimating(true)
      generatorRef.current.generate()
      generatorRef.current.startAnimation(() => {
        setIsAnimating(false)
      })
    }
  }

  const handleStopAnimation = () => {
    if (generatorRef.current) {
      generatorRef.current.stopAnimation()
      generatorRef.current.draw()
      setIsAnimating(false)
    }
  }

  const handleRandomize = () => {
    const radixColorKeys = Object.keys(require('./lib/radix-colors').radixColors)
    const randomFillKey = radixColorKeys[Math.floor(Math.random() * radixColorKeys.length)]
    const randomStrokeKey = radixColorKeys[Math.floor(Math.random() * radixColorKeys.length)]

    const { radixColors } = require('./lib/radix-colors')

    setConfig({
      ...config,
      sharpness: Math.floor(Math.random() * 15) + 3,
      size: Math.floor(Math.random() * 150) + 100,
      randomness: Math.floor(Math.random() * 60),
      strokeWidth: Math.floor(Math.random() * 10) + 1,
      cornerRoundness: Math.floor(Math.random() * 50),
      fillColor: radixColors[randomFillKey].value,
      strokeColor: radixColors[randomStrokeKey].value
    })
  }

  const handleRegenerate = () => {
    if (generatorRef.current) {
      generatorRef.current.update()
    }
  }

  const handleDownload = () => {
    if (generatorRef.current) {
      const svg = generatorRef.current.generateSVG()
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `asteroid-curve-${Date.now()}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-[1fr,400px]">
            {/* Canvas Section */}
            <div className="p-10 bg-slate-50 flex flex-col items-center justify-center">
              <AsteroidCanvas
                config={config}
                onGeneratorReady={(generator) => {
                  generatorRef.current = generator
                }}
              />
            </div>

            {/* Controls Section */}
            <div className="p-8 bg-white overflow-y-auto max-h-screen">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Asteroid Curve</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Generate mathematically accurate curves
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Curve Type */}
                  <div className="space-y-2">
                    <Label>Curve Type</Label>
                    <Select
                      value={config.curveType}
                      onValueChange={(value) => handleConfigChange('curveType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="astroid">Astroid (4 cusps)</SelectItem>
                        <SelectItem value="hypocycloid">Hypocycloid (Custom)</SelectItem>
                        <SelectItem value="asteroid">Realistic Asteroid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sharpness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Sharpness</Label>
                      <span className="text-sm text-slate-500">{config.sharpness}</span>
                    </div>
                    <Slider
                      value={[config.sharpness]}
                      onValueChange={([value]) => handleConfigChange('sharpness', value)}
                      min={3}
                      max={20}
                      step={1}
                    />
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Size</Label>
                      <span className="text-sm text-slate-500">{config.size}</span>
                    </div>
                    <Slider
                      value={[config.size]}
                      onValueChange={([value]) => handleConfigChange('size', value)}
                      min={50}
                      max={280}
                      step={10}
                    />
                  </div>

                  {/* Randomness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Randomness</Label>
                      <span className="text-sm text-slate-500">{(config.randomness / 100).toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[config.randomness]}
                      onValueChange={([value]) => handleConfigChange('randomness', value)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Corner Roundness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Corner Roundness</Label>
                      <span className="text-sm text-slate-500">{config.cornerRoundness}%</span>
                    </div>
                    <Slider
                      value={[config.cornerRoundness]}
                      onValueChange={([value]) => handleConfigChange('cornerRoundness', value)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Stroke Width */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Stroke Width</Label>
                      <span className="text-sm text-slate-500">{config.strokeWidth}</span>
                    </div>
                    <Slider
                      value={[config.strokeWidth]}
                      onValueChange={([value]) => handleConfigChange('strokeWidth', value)}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>

                  {/* Fill Color */}
                  <ColorPicker
                    label="Fill Color"
                    value={config.fillColor}
                    onChange={(value) => handleConfigChange('fillColor', value)}
                  />

                  {/* Stroke Color */}
                  <ColorPicker
                    label="Stroke Color"
                    value={config.strokeColor}
                    onChange={(value) => handleConfigChange('strokeColor', value)}
                  />

                  {/* Display Mode */}
                  <div className="space-y-2">
                    <Label>Display Mode</Label>
                    <Select
                      value={config.displayMode}
                      onValueChange={(value) => handleConfigChange('displayMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="outline">Outline Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Animation Speed */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Animation Speed</Label>
                      <span className="text-sm text-slate-500">{config.animSpeed}</span>
                    </div>
                    <Slider
                      value={[config.animSpeed]}
                      onValueChange={([value]) => handleConfigChange('animSpeed', value)}
                      min={10}
                      max={100}
                      step={10}
                    />
                  </div>

                  {/* Show Center */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showCenter"
                      checked={config.showCenter}
                      onCheckedChange={(checked) => handleConfigChange('showCenter', checked)}
                    />
                    <Label htmlFor="showCenter" className="cursor-pointer">
                      Show Center Point
                    </Label>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        onClick={handleRandomize}
                        className="w-full"
                      >
                        <Shuffle className="mr-2 h-4 w-4" />
                        Randomize
                      </Button>
                      <Button
                        onClick={handleRegenerate}
                        className="w-full"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>

                    {!isAnimating ? (
                      <Button
                        variant="outline"
                        onClick={handleAnimate}
                        className="w-full"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Animate Drawing
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={handleStopAnimation}
                        className="w-full"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop Animation
                      </Button>
                    )}

                    <Button
                      variant="default"
                      onClick={handleDownload}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download SVG
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
