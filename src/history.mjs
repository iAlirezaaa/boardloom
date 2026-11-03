/** Session-only, bounded metadata history; snapshots intentionally exclude binary image blobs. */
export function createHistory(limit=35) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid history limit');
  const past=[], future=[];
  return {
    capture(previous, next) {
      if (JSON.stringify(previous) === JSON.stringify(next)) return false;
      past.push(structuredClone(previous));
      if (past.length > limit) past.shift();
      future.length=0;
      return true;
    },
    undo(current) {
      if (!past.length) return null;
      future.push(structuredClone(current));
      return structuredClone(past.pop());
    },
    redo(current) {
      if (!future.length) return null;
      past.push(structuredClone(current));
      if (past.length > limit) past.shift();
      return structuredClone(future.pop());
    },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; }
  };
}
