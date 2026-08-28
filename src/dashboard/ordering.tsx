import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { fetchOrderingStatus } from "./api/client";
import type { OrderingStatus } from "./api/types";
import { useSession } from "./auth";
import { useResource } from "./hooks";

/**
 * Whether a website can take online orders, asked once per site.
 *
 * The nav and the orders page both need this answer and it must be the same
 * answer: a tab that appears while the page behind it says the shop cannot sell
 * is the kind of disagreement nobody reports and everybody distrusts. So it is
 * fetched by the site-scoped shell and handed down.
 *
 * `null` while it is in flight and `null` when the request failed, and those
 * two are treated alike on purpose — both mean "we do not know yet", and the
 * safe reading of not knowing is to keep the tab out of the way rather than
 * offer a shop screen that may refuse. Today every site answers `enabled:
 * false`: the feature is switched off globally and no template blueprint turns
 * online ordering on, so nothing renders until somebody deliberately changes
 * that.
 */

type OrderingState = { status: OrderingStatus | null; loading: boolean };

const OrderingContext = createContext<OrderingState>({
  status: null,
  loading: false,
});

export function OrderingScope({
  siteId,
  children,
}: {
  siteId: string;
  children: ReactNode;
}) {
  const { token } = useSession();
  const { data, loading } = useResource(
    () => fetchOrderingStatus(token, siteId),
    [token, siteId],
  );
  return (
    <OrderingContext.Provider value={{ status: data, loading }}>
      {children}
    </OrderingContext.Provider>
  );
}

export function useOrdering(): OrderingState {
  return useContext(OrderingContext);
}

/** Whether the orders tab is worth offering. */
export function canSell(status: OrderingStatus | null): boolean {
  return status?.enabled === true;
}
