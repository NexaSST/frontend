import { ModuleAnalytics } from "../analytics/ModuleAnalytics.js";
import type { Props } from "./types.js";
import { Categories } from "./Categories.js";
import { Types } from "./AssetTypes.js";
import { Assets } from "./Assets.js";
import { Templates } from "./Templates.js";
import { History } from "./History.js";
import { ActionPlans } from "./ActionPlans.js";

export function InspectionsModule(props: Props) {
  if (props.tab === "overview")
    return (
      <ModuleAnalytics scope={props.scope} domain="inspections" periodDays={props.search.periodDays} onPeriodChange={(periodDays) => props.setSearch({ periodDays })} onOpenAttention={(item) => props.setSearch({ tab: item.kind === 'nonconformant_finding' ? 'history' : 'assets', id: item.entityId, page: 1 })} />
    );
  if (props.tab === "categories") return <Categories {...props} />;
  if (props.tab === "types") return <Types {...props} />;
  if (props.tab === "templates") return <Templates {...props} />;
  if (props.tab === "action-plans") return <ActionPlans {...props} />;
  if (props.tab === "history") return <History {...props} />;
  return <Assets {...props} />;
}
