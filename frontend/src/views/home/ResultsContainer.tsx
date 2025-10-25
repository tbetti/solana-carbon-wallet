import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'


export function ResultsContainer({result, isVisible}) {
  return (
    <>
      {isVisible && (
        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-2xl border-[#E0E0E0]">
          <CardContent className="px-10 py-10 space-y-6">
            <div className="space-y-3 pr-12">
              <div className="flex items-start">
                <div>
                  <h3 className="text-[1.25rem] text-[#fdfdfd] mb-2">Results</h3>
                  <ul className="text-[#fdfdfd] leading-relaxed">
                    <li>
                      <span className="text-3sm">✅</span>
                      <span className="font-semibold">CO2 Emitted: </span>{result && result.co2Tons} tons
                    </li>
                    <li>
                      <span className="text-3sm">✅</span>
                      <span className="font-semibold">Power Used: </span>{result && result.energyKwh} KW
                    </li>
                    <li>
                      <span className="text-3sm">✅</span>
                      <span className="font-semibold">Credit Needed: </span>{result && result.creditsNeeded} KW
                    </li>
                    <li>
                      <span className="text-3sm">✅</span>
                      <span className="font-semibold">Estimated Cost: </span>{result && 'N/A'} KW
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <Button className="w-full bg-[#00A884] hover:bg-[#00A884]/90 text-white rounded-2xl h-12">
              Go to Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}