import { Car, Check, Loader2, Ruler, Train, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { setActualMode, setDistanceKm, setManualWalletAddress, setVehicleModelId, setSubmitted } from '../slices/tripSlice'
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
  onSubmit: (data: { vehicle_model_id: string; distance_km: number; actual_mode: string; wallet_address: string }) => void
}

// export function TripForm({ walletAddress, isConnected, isSubmitting, onSubmit }: TripFormProps) {
export function TripForm() {
  // const dispatch = useDispatch<AppDispatch>()
  // const { vehicleModelId, distanceKm, actualMode, manualWalletAddress, submitted } = useSelector((s: RootState) => s.trip)
  const [vehicleModelId, setVehicleModelId] = useState('')
  const [distanceKm, setDistanceKm] = useState('0')
  const [actualMode, setActualMode] = useState('bike')
  const [manualWalletAddress, setManualWalletAddress] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isConnected) {
      // dispatch(setManualWalletAddress(walletAddress))
    }
  }, [isConnected, walletAddress])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!vehicleModelId.trim()) {
      newErrors.vehicleModelId = 'Please enter a valid model ID.'
    } else if (vehicleModelId.length < 10 || vehicleModelId.length > 64) {
      newErrors.vehicleModelId = 'Please enter a valid model ID.'
    }

    const distance = parseFloat(distanceKm)
    if (!distanceKm) {
      newErrors.distanceKm = 'Distance must be greater than zero.'
    } else if (isNaN(distance) || distance <= 0) {
      newErrors.distanceKm = 'Distance must be greater than zero.'
    } else if (distance > 2000) {
      newErrors.distanceKm = 'Invalid distance.'
    }

    if (!actualMode) {
      newErrors.actualMode = 'Please select a transport mode.'
    }

    const addressToUse = isConnected ? walletAddress : manualWalletAddress
    if (!addressToUse.trim()) {
      newErrors.walletAddress = 'Please connect or enter a valid wallet address.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleActualMode = (value: string) => {
    // dispatch(setActualMode(value))
    setActualMode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const addressToUse = isConnected ? walletAddress : manualWalletAddress

    // await onSubmit({
    //   vehicle_model_id: vehicleModelId,
    //   distance_km: parseFloat(distanceKm),
    //   actual_mode: actualMode,
    //   wallet_address: addressToUse,
    // })

    // dispatch(setSubmitted(true))
    setSubmitted(true)
    // setTimeout(() => dispatch(setSubmitted(false)), 2000)
    setTimeout(() => setSubmitted(false), 2000)

  }

  const isFormValid =
    vehicleModelId.trim().length >= 10 &&
    vehicleModelId.trim().length <= 64 &&
    parseFloat(distanceKm) > 0 &&
    parseFloat(distanceKm) <= 2000 &&
    actualMode &&
    (isConnected ? walletAddress : manualWalletAddress).trim()

  return (
    <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-2xl border-[#E0E0E0]">
      <CardHeader className="px-10 pt-10 pb-4">
        <CardTitle className="text-[1.25rem] text-[#1A1F2C]">Log your trip</CardTitle>
        <CardDescription className="text-[#667085] text-sm pt-1">
          We'll calculate CO₂ saved vs. driving and send CarbonPoints to your wallet.
        </CardDescription>
      </CardHeader>
      <Separator className="bg-[#E0E0E0]" />
      <CardContent className="px-10 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vehicleModelId" className="flex items-center gap-2 text-[#1A1F2C]">
              <Car className="w-4 h-4 text-[#667085]" />
              Vehicle model ID
            </Label>
            <Input
              id="vehicleModelId"
              placeholder="e.g., d5f5b9f8-3e3c-4b5d-bc64"
              value={vehicleModelId}
              onChange={(e) => setVehicleModelId(e.target.value)}
              // onChange={(e) => dispatch(setVehicleModelId(e.target.value))}
              className={`rounded-2xl border-[#E0E0E0] ${errors.vehicleModelId ? 'border-[#E5484D]' : ''}`}
            />
            <p className="text-sm text-[#667085]">From Carbon Interface vehicles API.</p>
            {errors.vehicleModelId && <p className="text-sm text-[#E5484D]">{errors.vehicleModelId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance" className="flex items-center gap-2 text-[#1A1F2C]">
              <Ruler className="w-4 h-4 text-[#667085]" />
              Distance (km)
            </Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              // onChange={(e) => dispatch(setDistanceKm(e.target.value))}
              className={`rounded-2xl border-[#E0E0E0] ${errors.distanceKm ? 'border-[#E5484D]' : ''}`}
            />
            {errors.distanceKm && <p className="text-sm text-[#E5484D]">{errors.distanceKm}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="flex items-center gap-2 text-[#1A1F2C]">
              <Train className="w-4 h-4 text-[#667085]" />
              Mode of transport
            </Label>
            <Select value={actualMode} onValueChange={handleActualMode}>
              <SelectTrigger className={`rounded-2xl border-[#E0E0E0] ${errors.actualMode ? 'border-[#E5484D]' : ''}`}>
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="london_underground">London Underground</SelectItem>
              </SelectContent>
            </Select>
            {errors.actualMode && <p className="text-sm text-[#E5484D]">{errors.actualMode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress" className="flex items-center gap-2 text-[#1A1F2C]">
              <Wallet className="w-4 h-4 text-[#667085]" />
              Wallet address
            </Label>
            <Input
              id="walletAddress"
              placeholder="YOUR_ALGORAND_ADDRESS"
              value={isConnected ? walletAddress : manualWalletAddress}
              // onChange={(e) => !isConnected && dispatch(setManualWalletAddress(e.target.value))}
              onChange={(e) => !isConnected && setManualWalletAddress(e.target.value)}
              readOnly={isConnected}
              className={`rounded-2xl border-[#E0E0E0] ${errors.walletAddress ? 'border-[#E5484D]' : ''} ${isConnected ? 'bg-[#F6F8F7]' : ''}`}
            />
            {errors.walletAddress && <p className="text-sm text-[#E5484D]">{errors.walletAddress}</p>}
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
                'Calculate & Reward'
              )}
            </Button>
            <p className="text-sm text-center text-[#667085]">CarbonPoints will appear in your Pera Wallet within a minute.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
