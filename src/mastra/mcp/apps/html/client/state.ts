/** Mutable browser state shared by the storefront views and actions. */
export const stateScript = String.raw`
    let lastArgs = {};
    let lastResult = null;
    let lastAction = "";
    let pendingCancel = "";
    let pendingReviewDelete = "";
    let reviewDraft = null;
    let busy = false;
    let busyLabel = "";
    let notice = "";
    let view = "empty";
    let viewData = null;
`;
