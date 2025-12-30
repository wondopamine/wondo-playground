import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { radixColors } from "@/lib/radix-colors"

export function ColorPicker({ value, onChange, label }) {
  // Find the current color key based on value
  const currentKey = Object.keys(radixColors).find(
    key => radixColors[key].value === value
  ) || 'blue'

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={currentKey}
        onValueChange={(key) => onChange(radixColors[key].value)}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: radixColors[currentKey].value }}
            />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {Object.keys(radixColors).map((key) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: radixColors[key].value }}
                />
                <span>{radixColors[key].name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
