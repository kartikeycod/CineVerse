import SetPricing from "./SetPricing";
import "./Pricing.css";

function PricingManager() {
  return (
    <div className="pricing-wrapper">
      <div className="pricing-header">
        <h2>Show Pricing</h2>
        <p>Set seat-wise prices per show</p>
      </div>

      <SetPricing />
    </div>
  );
}

export default PricingManager;
