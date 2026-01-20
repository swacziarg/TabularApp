type SummaryCardsProps = {
    totalA: number;
    totalB: number;
    missingInA: number;
    missingInB: number;
    changed: number;
  };
  
  export function SummaryCards({
    totalA,
    totalB,
    missingInA,
    missingInB,
    changed,
  }: SummaryCardsProps) {
    return (
      <div className="summaryGrid">
        <div className="summaryCard">
          <div className="summaryLabel">Total A</div>
          <div className="summaryValue">{totalA.toLocaleString()}</div>
        </div>
  
        <div className="summaryCard">
          <div className="summaryLabel">Total B</div>
          <div className="summaryValue">{totalB.toLocaleString()}</div>
        </div>
  
        <div className="summaryCard">
          <div className="summaryLabel">Missing in A</div>
          <div className="summaryValue">{missingInA.toLocaleString()}</div>
        </div>
  
        <div className="summaryCard">
          <div className="summaryLabel">Missing in B</div>
          <div className="summaryValue">{missingInB.toLocaleString()}</div>
        </div>
  
        <div className="summaryCard">
          <div className="summaryLabel">Changed</div>
          <div className="summaryValue">{changed.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  