
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const updateDeviceType = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    updateDeviceType()
    
    // Add event listener for window resize
    window.addEventListener("resize", updateDeviceType)
    
    // Clean up
    return () => window.removeEventListener("resize", updateDeviceType)
  }, [])

  return !!isMobile
}
