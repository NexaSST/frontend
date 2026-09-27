import { Matrices } from './Matrices.js';
import { Frequencies } from './Frequencies.js';
import { ModuleAnalytics } from "../analytics/ModuleAnalytics.js";
import type { Props } from "./types.js";
import { Courses } from "./Courses.js";
import { Events } from "./Events.js";
import { Expirations } from "./Expirations.js";
export { People } from "./People.js";
export { CatalogCard } from "./CatalogCard.js";

export function TrainingModule(props: Props) {
  if (props.tab === "overview")
    return (
      <ModuleAnalytics scope={props.scope} domain="training" periodDays={props.search.periodDays} groupBy={props.search.analyticsGroupBy} onPeriodChange={(periodDays) => props.setSearch({ periodDays })} onGroupByChange={(analyticsGroupBy) => props.setSearch({ analyticsGroupBy })} onOpenAttention={(item) => props.setSearch({ tab: 'expirations', id: item.entityId, page: 1 })} />
    );
  if (props.tab === "frequencies") return <Frequencies {...props} />;
  if (props.tab === "courses") return <Courses {...props} />;
  if (props.tab === "events") return <Events {...props} />;
  if (props.tab === "matrices") return <Matrices {...props} />;
  if (props.tab === "expirations") return <Expirations {...props} />;
  return <Courses {...props} />;
}
