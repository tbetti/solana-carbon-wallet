import { Zap, Check, Loader2, Earth, Wallet, Hourglass } from 'lucide-react'
import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { setActualMode, sethoursKm, setManualWalletAddress, setVehicleModelId, setSubmitted } from '../slices/tripSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'

interface TripFormProps {
  walletAddress: string
  isConnected: boolean
  isSubmitting: boolean
  onSubmit: (data: { vehicle_model_id: string; hours_km: number; actual_mode: string; wallet_address: string }) => void
}

// export function TripForm({ walletAddress, isConnected, isSubmitting, onSubmit }: TripFormProps) {
export function TripForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

    // State for the form inputs, pre-filled with your example
  const [gpuType, setGpuType] = useState('A100');
  const [hours, setHours] = useState('100');
  const [region, setRegion] = useState('US-West');

  // State for the API response
  const [data, setData] = useState(null); // This will hold the response JSON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected) {
      // dispatch(setManualWalletAddress(walletAddress))
    }
  }, [isConnected, walletAddress])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!gpuType) {
      newErrors.actualMode = 'Please select a GPU Type.'
    }

    const hoursNum = parseFloat(hours)
    if (!hours) {
      newErrors.hours = 'Hours must be greater than zero.'
    } else if (isNaN(hoursNum) || hoursNum <= 0) {
      newErrors.hours = 'Hours must be greater than zero.'
    } else if (hoursNum > 2000) {
      newErrors.hours = 'Invalid hours.'
    }

    if (!region) {
      newErrors.actualMode = 'Please select a region.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGpuType = (value: string) => {
    setGpuType(value)
  }
  
  const handleRegion = (value: string) => {
    setRegion(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // await onSubmit({
    //   vehicle_model_id: vehicleModelId,
    //   hours_km: parseFloat(hoursKm),
    //   actual_mode: actualMode,
    //   wallet_address: walletAddress,
    // })

    setSubmitted(true)
    // setTimeout(() => dispatch(setSubmitted(false)), 2000)
    setTimeout(() => setSubmitted(false), 2000)

  }

  const isFormValid =
    gpuType &&
    parseFloat(hours) > 0 &&
    parseFloat(hours) <= 2000 &&
    region &&
    isConnected && walletAddress

  return (
    <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-2xl border-[#E0E0E0]">
      <CardHeader className="px-10 pt-10 pb-4">
        <CardTitle className="text-[1.25rem] text-[#fdfdfd]">Log your trip</CardTitle>
        <CardDescription className="text-[#667085] text-sm pt-1">
          We'll calculate the CarbonPoints to send to your wallet.
        </CardDescription>
      </CardHeader>
      <Separator className="bg-[#E0E0E0]" />
      <CardContent className="px-10 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gpuType" className="flex items-center gap-2 text-[#f8f8f8]">
              <Zap className="w-4 h-4 text-[#667085]" />
              GPU Type
            </Label>
            <Select value={gpuType} onValueChange={handleGpuType}>
            <SelectTrigger
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 bg-white ${errors.actualMode ? 'border-[#E5484D]' : ''}`}
            >
              <SelectValue placeholder="Select transport mode" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="A100">A100</SelectItem>
              <SelectItem value="H100">H100</SelectItem>
              <SelectItem value="V100">V100</SelectItem>
              <SelectItem value="A10">A10</SelectItem>
              <SelectItem value="T4">T4</SelectItem>
              <SelectItem value="RTX4090">RTX4090</SelectItem>
              <SelectItem value="RTX3090">RTX3090</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours" className="flex items-center gap-2 text-[#f8f8f8]">
              <Hourglass className="w-4 h-4 text-[#667085]" />
              Time (hrs)
            </Label>
            <Input
              id="hours"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 ${errors.hoursKm ? 'border-[#E5484D]' : ''}`}
            />
            {errors.hoursKm && <p className="text-sm text-[#E5484D]">{errors.hoursKm}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="flex items-center gap-2 text-[#f8f8f8]">
              <Earth className="w-4 h-4 text-[#667085]" />
              Region
            </Label>
            <Select value={region} onValueChange={handleRegion}>
            <SelectTrigger
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 bg-white ${errors.actualMode ? 'border-[#E5484D]' : ''}`}
            >
              <SelectValue placeholder="Select transport mode" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="us-ca">US-CA</SelectItem>
              <SelectItem value="us-tx">US-TX</SelectItem>
              <SelectItem value="eu">EU</SelectItem>
              <SelectItem value="china">China</SelectItem>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="brazil">Brazil</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
              <SelectItem value="japan">Japan</SelectItem>
              <SelectItem value="iceland">Iceland</SelectItem>
              <SelectItem value="norway">Norway</SelectItem>
              <SelectItem value="singapore">Singapore</SelectItem>
            </SelectContent>
          </Select>
            {errors.actualMode && <p className="text-sm text-[#E5484D]">{errors.actualMode}</p>}
          </div>
          <div className="space-y-2 pt-3">
            <Button
              type="submit"
              className="w-full bg-[#00A884] hover:bg-[#00A884]/90 text-white rounded-2xl h-12"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing CarbonPoints…
                </>
              ) : submitted ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Reward sent!
                </>
              ) : (
                'Calculate'
              )}
            </Button>
            <p className="text-sm text-center text-[#667085]">CarbonPoints will appear in your Pera Wallet within a minute.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
