import { AprPtOverview } from "./AprPtOverview.js";
import type { Props } from "./types.js";
import { Activities } from "./Activities.js";
import { Templates } from "./Templates.js";
import { Documents } from "./Documents.js";
import { WorkPermits } from "./WorkPermits.js";
export function AprModule(props: Props) {
  if (props.tab === "overview")
    return <AprPtOverview scope={props.scope} flow={props.area} periodDays={props.search.periodDays ?? 30} onPeriodChange={(periodDays) => props.setSearch({ periodDays })} onOpenList={() => props.setSearch({ tab: props.area === 'pt' ? 'work-permits' : 'documents', page: 1 })} onOpenPermit={(id) => props.setSearch({ tab: 'work-permits', id, page: 1 })} />;
  if (props.tab === "templates") return <Templates {...props} />;
  if (props.tab === "activities") return <Activities {...props} />;
  if (props.tab === "work-permits" || props.tab === "pt-reports" || props.tab === "apr-reports") return <WorkPermits {...props} reportsOnly={props.tab !== 'work-permits'} />;
  return <Documents {...props} />;
}
