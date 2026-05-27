// ============================================================
// Realtime — Supabase websocket subscriptions
// Syncs vote counts live across all connected users
// ============================================================

let realtimeChannel = null;

function initRealtime(onVoteChange) {
  const sb = getSupabase();

  // Subscribe to any INSERT or DELETE on the votes table
  realtimeChannel = sb
    .channel('votes-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'votes',
    }, payload => {
      // Re-fetch songs to get fresh vote counts
      if (typeof onVoteChange === 'function') onVoteChange(payload);
    })
    .subscribe();

  return realtimeChannel;
}

function destroyRealtime() {
  if (realtimeChannel) {
    getSupabase().removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
