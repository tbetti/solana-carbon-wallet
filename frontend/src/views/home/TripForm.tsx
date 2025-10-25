import { Zap, Check, Loader2, Earth, Hourglass } from 'lucide-react'
import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { setActualMode, sethoursKm, setManualWalletAddress, setVehicleModelId, setSubmitted } from '../slices/tripSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { fetchGpuCost } from 'pages/api/apiClient'

export function TripForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

    // State for the form inputs, pre-filled with your example
  const [gpuType, setGpuType] = useState('A100');
  const [hours, setHours] = useState('100');
  const [region, setRegion] = useState('US-CA');

  // State for the API response
  const [data, setData] = useState(null); // This will hold the response JSON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    setError(newErrors)
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
    setLoading(true);
    setError(null);
    setData(null); // Clear previous results

    if (!validate()) {
      setLoading(false);
      return
    }

    try {
      // Create the data object to send
      const calculationData = {
        gpuType,
        hours: parseInt(hours, 10),
        region,
      };

      // Call the externalized API function
      const result = await fetchGpuCost(calculationData);
      setSubmitted(true)
      setData(result.data); // Store the successful response
      setTimeout(() => setSubmitted(false), 2000)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    gpuType &&
    parseFloat(hours) > 0 &&
    parseFloat(hours) <= 2000 &&
    region
    // isConnected && walletAddress

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
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 bg-white ${error && error.actualMode ? 'border-[#E5484D]' : ''}`}
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
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 ${error && error.hours? 'border-[#E5484D]' : ''}`}
            />
            {error && error.hours && <p className="text-sm text-[#E5484D]">{error.hours}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="flex items-center gap-2 text-[#f8f8f8]">
              <Earth className="w-4 h-4 text-[#667085]" />
              Region
            </Label>
            <Select value={region} onValueChange={handleRegion}>
            <SelectTrigger
              className={`rounded-2xl border-[#E0E0E0] text-gray-900 bg-white ${error && error.actualMode ? 'border-[#E5484D]' : ''}`}
            >
              <SelectValue placeholder="Select transport mode" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="US">US</SelectItem>
              <SelectItem value="US-CA">US-CA</SelectItem>
              <SelectItem value="US-TX">US-TX</SelectItem>
              <SelectItem value="EU">EU</SelectItem>
              <SelectItem value="China">China</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Brazil">Brazil</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="Iceland">Iceland</SelectItem>
              <SelectItem value="Norway">Norway</SelectItem>
              <SelectItem value="Singapore">Singapore</SelectItem>
            </SelectContent>
          </Select>
            {error && error.actualMode && <p className="text-sm text-[#E5484D]">{error && error.actualMode}</p>}
          </div>
          <div className="space-y-2 pt-3">
            <Button
              type="submit"
              className="w-full bg-[#00A884] hover:bg-[#00A884]/90 text-white rounded-2xl h-12"
              disabled={loading && !!isFormValid}
            >
              {loading ? (
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
                'Calculate Emissions'
              )}
            </Button>
            <p className="text-sm text-center text-[#667085]">CarbonPoints will appear in your Pera Wallet within a minute.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
